import gulp from "gulp";
import pegjs from "gulp-pegjs";
import header from "gulp-header";
import footer from "gulp-footer";
import replace from "gulp-replace";
import webpack from "webpack-stream";
import rename from "gulp-rename";
import del from "del";
import prettier from "gulp-prettier";
import eslint from "gulp-eslint";

function parser() {
  const HEADER = `
import { Tag, PosArg, OptArg, Paragraph } from "../src/classes.js";`;
  const FOOTER = `
var parse = peg$parse;
var SyntaxError = peg$SyntaxError;
export { parse, SyntaxError };`;
  const TO_REMOVE = `
module.exports = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};`;

  return gulp
    .src("src/markyap.pegjs")
    .pipe(pegjs({ format: "commonjs" }))
    .pipe(header(HEADER))
    .pipe(footer(FOOTER))
    .pipe(replace(TO_REMOVE, ""))
    .pipe(rename("parser.js"))
    .pipe(gulp.dest("dist"));
}

const bundle = gulp.series(parser, function bundleImpl() {
  const WEBPACK_CONFIG = {
    mode: "production",
    output: {
      filename: "bundle.js",
      libraryTarget: "commonjs2",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
      ],
    },
  };

  return gulp
    .src("src/index.js")
    .pipe(webpack(WEBPACK_CONFIG))
    .pipe(gulp.dest("dist"));
});

function clean() {
  return del(["dist"]);
}

const FORMAT_TYPES = ["js", "yaml", "yml", "pegjs", "md", "json"];

function makeFormatter(dir, check = false) {
  var cmd;
  if (check) {
    cmd = prettier.check;
  } else {
    cmd = prettier;
  }

  var fn = function () {
    return gulp
      .src(
        FORMAT_TYPES.map((f) => dir + "/*." + f).concat(
          FORMAT_TYPES.map((f) => dir + "/.*." + f)
        )
      )
      .pipe(cmd())
      .pipe(gulp.dest(dir));
  };
  Object.defineProperty(fn, "name", {
    value: "format " + dir + (check ? " check" : ""),
  });
  return fn;
}

const format = gulp.parallel(
  makeFormatter("."),
  makeFormatter("src"),
  makeFormatter("test"),
  makeFormatter(".github/workflows")
);

const checkFormat = gulp.parallel(
  makeFormatter(".", true),
  makeFormatter("src", true),
  makeFormatter("test", true),
  makeFormatter(".github/workflows", true)
);

function lint() {
  return gulp
    .src(["*.js", "src/*.js", "test/*.js"])
    .pipe(eslint())
    .pipe(eslint.format("stylish", process.stderr))
    .pipe(eslint.failAfterError());
}

export { parser, bundle, clean, format, checkFormat, lint };
export default bundle;
