#!/usr/bin/env python3
# Classroom Mission Control - local server for Mac and Linux.
# Serves this folder at http://localhost:8080 and lets student phones on the same Wi-Fi join Quiz Show games.
# Same relay as start-hub.ps1 on Windows. Needs Python 3, nothing else.
import json, os, socket, sys, threading, webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
G = threading.Lock()
D = {'state': 'null', 'ver': 0, 'ev': [], 'base': 0, 'blobs': {}}


def ips():
    out = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
        out.add(s.getsockname()[0])
        s.close()
    except Exception:
        pass
    try:
        for a in socket.gethostbyname_ex(socket.gethostname())[2]:
            out.add(a)
    except Exception:
        pass
    a = [x for x in out if not x.startswith('127.') and not x.startswith('169.254.')]
    rank = lambda x: 0 if x.startswith('192.168.137.') else 1 if x.startswith('192.168.') else 2 if x.startswith('10.') else 3
    return sorted(a, key=rank)


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def out(self, code, body, ctype='application/json; charset=utf-8'):
        b = body.encode('utf-8') if isinstance(body, str) else body
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(b)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(b)

    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n > 4000000:
            return None
        return self.rfile.read(n).decode('utf-8', 'replace') if n else ''

    def api(self, method):
        u = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(u.query).items()}
        p = u.path
        if p == '/api/ping':
            return self.out(200, json.dumps({'ok': 1, 'port': PORT, 'ips': ips()}))
        if p == '/api/state':
            with G:
                st, v = D['state'], D['ver']
            return self.out(200, '{"v":%d}' % v if q.get('v') == str(v) else '{"v":%d,"s":%s}' % (v, st))
        if p == '/api/blob':
            with G:
                d = D['blobs'].get(q.get('id', ''))
            return self.out(404, 'none', 'text/plain') if d is None else self.out(200, d, 'text/plain; charset=utf-8')
        if p == '/api/host/events':
            since = int(q.get('since') or 0)
            with G:
                total = D['base'] + len(D['ev'])
                lines = [str(total)] + D['ev'][max(since, D['base']) - D['base']:]
            return self.out(200, '\n'.join(lines), 'text/plain; charset=utf-8')
        if method != 'POST':
            return self.out(404, 'no such api', 'text/plain')
        b = self.body()
        if b is None:
            return self.out(413, 'too big', 'text/plain')
        if p == '/api/send':
            t = b.replace('\r', ' ').replace('\n', ' ').strip()
            if not (2 <= len(t) <= 20000 and t[0] == '{' and t[-1] == '}'):
                return self.out(400, 'bad', 'text/plain')
            with G:
                D['ev'].append(t)
                if len(D['ev']) > 4000:
                    del D['ev'][:1000]
                    D['base'] += 1000
            return self.out(200, '{"ok":1}')
        if p == '/api/host/state':
            t = b.strip()
            if not t or (t[0] != '{' and t != 'null'):
                return self.out(400, 'bad', 'text/plain')
            with G:
                D['state'] = t
                D['ver'] += 1
                v = D['ver']
            return self.out(200, '{"v":%d}' % v)
        if p == '/api/host/blob':
            i = q.get('id', '')
            if not i or len(i) > 40:
                return self.out(400, 'bad', 'text/plain')
            with G:
                D['blobs'][i] = b
            return self.out(200, '{"ok":1}')
        if p == '/api/host/reset':
            with G:
                D.update(state='null', ev=[], base=0, blobs={})
                D['ver'] += 1
            return self.out(200, '{"ok":1}')
        return self.out(404, 'no such api', 'text/plain')

    def do_GET(self):
        if self.path.startswith('/api/'):
            return self.api('GET')
        if self.path.split('?')[0] in ('/join', '/join/'):
            self.path = '/join.html'
        if self.path.split('?')[0] in ('/scan', '/scan/'):
            self.path = '/scan.html'
        rg = self.headers.get('Range', '')
        if rg.startswith('bytes='):
            f = self.translate_path(self.path)
            if os.path.isfile(f):
                size = os.path.getsize(f)
                a, _, z = rg[6:].split(',')[0].partition('-')
                try:
                    start = int(a) if a else max(0, size - int(z))
                    end = min(int(z), size - 1) if a and z else size - 1
                except ValueError:
                    start, end = 0, size - 1
                if start >= size or start > end:
                    self.send_response(416)
                    self.send_header('Content-Range', 'bytes */%d' % size)
                    self.end_headers()
                    return
                self.send_response(206)
                self.send_header('Content-Type', self.guess_type(f))
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Content-Range', 'bytes %d-%d/%d' % (start, end, size))
                self.send_header('Content-Length', str(end - start + 1))
                self.end_headers()
                with open(f, 'rb') as fh:
                    fh.seek(start)
                    left = end - start + 1
                    while left > 0:
                        chunk = fh.read(min(262144, left))
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        left -= len(chunk)
                return
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            return self.api('POST')
        self.out(404, 'not found', 'text/plain')


SimpleHTTPRequestHandler.extensions_map.update({'.wasm': 'application/wasm', '.mjs': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2'})

if __name__ == '__main__':
    try:
        srv = ThreadingHTTPServer(('0.0.0.0', PORT), H)
    except OSError:
        print('Port %d is busy. Close the other window running the hub and try again.' % PORT)
        sys.exit(1)
    srv.daemon_threads = True
    print('Classroom Mission Control is running at http://localhost:%d' % PORT)
    for a in ips():
        print('Student phones on the same Wi-Fi join at http://%s:%d/join' % (a, PORT))
    print('Keep this window open while you teach. Close it to stop.')
    if '--no-browser' not in sys.argv:
        threading.Timer(0.6, lambda: webbrowser.open('http://localhost:%d/index.html' % PORT)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
