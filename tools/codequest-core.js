/* Code Quest core: pure robot world, bounded interpreter and code-text generator.
   Original puzzles; programs are interpreted from a small AST and never evaluated as JavaScript. */
(function (root) {
  'use strict';
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const LIMITS = { events: 500, actions: 120, idle: 40 };
  const COND = {
    PATH: ['path ahead', '前方有路'],
    WALL: ['rock ahead', '前方有石头'],
    LEFT: ['path on the left', '左边有路'],
    RIGHT: ['path on the right', '右边有路'],
    GEM: ['standing on a gem', '脚下有宝石'],
    GOAL: ['goal reached', '到达终点']
  };
  const JS_COND = { PATH: 'robot.pathAhead()', WALL: 'robot.rockAhead()', LEFT: 'robot.pathLeft()', RIGHT: 'robot.pathRight()', GEM: 'robot.onGem()', GOAL: 'robot.atGoal()' };

  const F = { t: 'move' }, L = { t: 'left' }, R = { t: 'right' }, C = { t: 'collect' }, call = { t: 'call' };
  const rep = (n, ...body) => ({ t: 'repeat', n, body });
  const until = (c, ...body) => ({ t: 'until', c, body });
  const iff = (c, body, els) => ({ t: 'if', c, body, els: els || [] });
  const many = (node, n) => Array.from({ length: n }, () => node);

  function createWorld(level) {
    const rows = level.map, h = rows.length, w = rows[0].length;
    const walls = [], gems = new Set();
    let start = [0, 0], goal = [0, 0];
    for (let y = 0; y < h; y++) {
      walls.push([]);
      for (let x = 0; x < w; x++) {
        const ch = rows[y][x];
        walls[y].push(ch === '#');
        if (ch === 'S') start = [x, y];
        if (ch === 'G') goal = [x, y];
        if (ch === '*') gems.add(x + ',' + y);
      }
    }
    return { w, h, walls, gems, totalGems: gems.size, start, goal, x: start[0], y: start[1], dir: level.dir || 0, steps: 0, collected: 0 };
  }
  const free = (st, x, y) => x >= 0 && y >= 0 && x < st.w && y < st.h && !st.walls[y][x];
  const dirAhead = (st, turn) => DIRS[(st.dir + turn) % 4];
  function cond(st, name) {
    const at = turn => { const v = dirAhead(st, turn); return free(st, st.x + v[0], st.y + v[1]); };
    switch (name) {
      case 'PATH': return at(0);
      case 'WALL': return !at(0);
      case 'LEFT': return at(3);
      case 'RIGHT': return at(1);
      case 'GEM': return st.gems.has(st.x + ',' + st.y);
      case 'GOAL': return st.x === st.goal[0] && st.y === st.goal[1];
      default: return false;
    }
  }
  const gemsLeft = st => st.totalGems - st.collected;
  const won = st => cond(st, 'GOAL') && gemsLeft(st) === 0;

  /* Generator: each yield is one visible event {type, id, ...}. Returns {status, reason}. */
  function* exec(nodes, st, prog, ctx, depth) {
    for (const node of nodes) {
      const stop = yield* visit(node, st, prog, ctx, depth);
      if (stop) return stop;
    }
    return null;
  }
  function* fail(reason, id) {
    yield { type: 'fail', reason, id };
    return { status: 'fail', reason };
  }
  function over(ctx, action) {
    ctx.events++;
    if (action) { ctx.actions++; ctx.idle = 0; } else ctx.idle++;
    return ctx.events > LIMITS.events || ctx.actions > LIMITS.actions || ctx.idle > LIMITS.idle;
  }
  function* visit(node, st, prog, ctx, depth) {
    const id = node.id;
    switch (node.t) {
      case 'move': case 'left': case 'right': case 'collect': {
        if (over(ctx, true)) return yield* fail('limit', id);
        if (node.t === 'move') {
          const v = DIRS[st.dir];
          if (!free(st, st.x + v[0], st.y + v[1])) return yield* fail('wall', id);
          st.x += v[0]; st.y += v[1];
        } else if (node.t === 'collect') {
          const key = st.x + ',' + st.y;
          if (!st.gems.has(key)) return yield* fail('nogem', id);
          st.gems.delete(key); st.collected++;
        } else st.dir = (st.dir + (node.t === 'left' ? 3 : 1)) % 4;
        st.steps++;
        const win = won(st);
        yield { type: 'action', act: node.t, id, win };
        return win ? { status: 'win' } : null;
      }
      case 'repeat': {
        for (let i = 1; i <= node.n; i++) {
          if (over(ctx, false)) return yield* fail('limit', id);
          yield { type: 'iter', id, i, n: node.n };
          const stop = yield* exec(node.body, st, prog, ctx, depth);
          if (stop) return stop;
        }
        return null;
      }
      case 'until': {
        for (;;) {
          const result = cond(st, node.c);
          if (over(ctx, false)) return yield* fail('limit', id);
          yield { type: 'check', id, cond: node.c, result, loop: true };
          if (result) return null;
          const stop = yield* exec(node.body, st, prog, ctx, depth);
          if (stop) return stop;
        }
      }
      case 'if': {
        const result = cond(st, node.c);
        if (over(ctx, false)) return yield* fail('limit', id);
        yield { type: 'check', id, cond: node.c, result };
        return yield* exec(result ? node.body : node.els, st, prog, ctx, depth);
      }
      case 'call': {
        if (depth > 3 || over(ctx, false)) return yield* fail('limit', id);
        yield { type: 'call', id };
        return yield* exec(prog.fn || [], st, prog, ctx, depth + 1);
      }
      default: return yield* fail('limit', id);
    }
  }
  function* run(prog, st) {
    const ctx = { events: 0, actions: 0, idle: 0 };
    const stop = yield* exec(prog.main, st, prog, ctx, 0);
    if (stop) return stop;
    const reason = cond(st, 'GOAL') ? 'gemsleft' : 'end';
    yield { type: 'fail', reason };
    return { status: 'fail', reason };
  }
  /* Runs a whole program instantly (used by tests, the solution check and the stats). */
  function simulate(level, prog) {
    const st = createWorld(level);
    const it = run(prog, st);
    let r;
    do { r = it.next(); } while (!r.done);
    return { result: r.value, state: st };
  }

  const nodesOf = prog => [].concat(prog.main || [], prog.fn || []);
  function countBlocks(nodes) {
    return nodes.reduce((sum, n) => sum + 1 + (n.body ? countBlocks(n.body) : 0) + (n.els ? countBlocks(n.els) : 0), 0);
  }
  function concepts(prog) {
    const set = new Set();
    (function walk(nodes, inLoop) {
      nodes.forEach(n => {
        if (n.t === 'repeat' || n.t === 'until') {
          set.add('loop'); set.add(n.t);
          if (inLoop) set.add('nested');
        }
        if (n.t === 'if') set.add('if');
        if (n.t === 'call') set.add('call');
        if (n.t === 'collect') set.add('collect');
        const loopy = inLoop || n.t === 'repeat' || n.t === 'until';
        if (n.body) walk(n.body, loopy);
        if (n.els) walk(n.els, loopy);
      });
    })(prog.main, false);
    return set;
  }
  const blockCount = prog => countBlocks(prog.main) + countBlocks(prog.fn || []);
  function starsFor(count, par) {
    if (count <= par) return 3;
    return count <= Math.ceil(par * 1.5) ? 2 : 1;
  }

  /* Text code view. Returns [{ind, text, id}]. */
  const LOOP_VARS = ['i', 'j', 'k', 'm'];
  function codeLines(prog, mode, zh) {
    const lines = [];
    const add = (ind, text, id) => lines.push({ ind, text, id });
    const label = c => COND[c][zh ? 1 : 0];
    function emit(nodes, ind, depth) {
      nodes.forEach(n => {
        if (mode === 'js') {
          const v = LOOP_VARS[Math.min(depth, 3)];
          switch (n.t) {
            case 'move': add(ind, 'robot.forward();', n.id); break;
            case 'left': add(ind, 'robot.turnLeft();', n.id); break;
            case 'right': add(ind, 'robot.turnRight();', n.id); break;
            case 'collect': add(ind, 'robot.pickUp();', n.id); break;
            case 'call': add(ind, 'routine();', n.id); break;
            case 'repeat': add(ind, `for (let ${v} = 0; ${v} < ${n.n}; ${v}++) {`, n.id); emit(n.body, ind + 1, depth + 1); add(ind, '}'); break;
            case 'until': add(ind, `while (!${JS_COND[n.c]}) {`, n.id); emit(n.body, ind + 1, depth + 1); add(ind, '}'); break;
            case 'if':
              add(ind, `if (${JS_COND[n.c]}) {`, n.id); emit(n.body, ind + 1, depth);
              if (n.els.length) { add(ind, '} else {'); emit(n.els, ind + 1, depth); }
              add(ind, '}'); break;
            default: break;
          }
        } else {
          switch (n.t) {
            case 'move': add(ind, zh ? '前进一步' : 'move forward', n.id); break;
            case 'left': add(ind, zh ? '左转' : 'turn left', n.id); break;
            case 'right': add(ind, zh ? '右转' : 'turn right', n.id); break;
            case 'collect': add(ind, zh ? '捡起宝石' : 'pick up the gem', n.id); break;
            case 'call': add(ind, zh ? '执行“我的例程”' : 'do my routine', n.id); break;
            case 'repeat': add(ind, zh ? `重复 ${n.n} 次：` : `repeat ${n.n} times:`, n.id); emit(n.body, ind + 1, depth + 1); break;
            case 'until': add(ind, zh ? `重复，直到${label(n.c)}：` : `repeat until ${label(n.c)}:`, n.id); emit(n.body, ind + 1, depth + 1); break;
            case 'if':
              add(ind, zh ? `如果${label(n.c)}：` : `if ${label(n.c)}:`, n.id); emit(n.body, ind + 1, depth);
              if (n.els.length) { add(ind, zh ? '否则：' : 'otherwise:'); emit(n.els, ind + 1, depth); }
              break;
            default: break;
          }
        }
      });
    }
    if (prog.fn && prog.fn.length) {
      add(0, mode === 'js' ? 'function routine() {' : (zh ? '定义“我的例程”：' : 'define my routine:'), prog.fnId);
      emit(prog.fn, 1, 0);
      if (mode === 'js') add(0, '}');
      add(0, '');
    }
    add(0, mode === 'js' ? (zh ? '// 点击运行时' : '// when Run is pressed') : (zh ? '点击运行时：' : 'when Run is pressed:'), prog.startId);
    emit(prog.main, mode === 'js' ? 0 : 1, 0);
    return lines;
  }

  const api = { DIRS, LIMITS, COND, F, L, R, C, call, rep, until, iff, many, createWorld, free, cond, gemsLeft, won, run, simulate, blockCount, concepts, starsFor, codeLines };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CQCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
