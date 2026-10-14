const esbuild = require("esbuild");
const glslify = require("glslify");
const fs = require("node:fs");
const path = require("node:path");

esbuild.build({
  entryPoints: [path.join(__dirname, "src/engine.js")],
  outfile: path.join(__dirname, "engine.js"),
  bundle: true,
  minify: true,
  format: "esm",
  legalComments: "eof",
  plugins: [{
    name: "upstream-glsl",
    setup(build) {
      build.onLoad({ filter: /\.glsl$/ }, args => ({
        contents: glslify.compile(fs.readFileSync(args.path, "utf8"), { basedir: __dirname }),
        loader: "text",
      }));
    },
  }],
}).catch(error => { console.error(error); process.exit(1); });
