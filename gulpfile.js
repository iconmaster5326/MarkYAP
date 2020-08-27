import gulp from "gulp";
import pegjs from "gulp-pegjs";
import header from "gulp-header";
import footer from "gulp-footer";
import replace from "gulp-replace";
import webpack from "webpack-stream";
import rename from "gulp-rename";
import del from "del";

const HEADER = `
import { Tag, PosArg, OptArg, Paragraph } from "../src/classes.js";
`;
const FOOTER = `
var parse = peg$parse;
var SyntaxError = peg$SyntaxError;
export { parse, SyntaxError };
`;
const TO_REMOVE = `
module.exports = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};`;

function parser() {
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
  return gulp
    .src("src/index.js")
    .pipe(webpack(import("./webpack.config.cjs")))
    .pipe(rename("main.js"))
    .pipe(gulp.dest("dist"));
});

function clean() {
  return del(["dist"]);
}

export { parser, bundle, clean };
export default bundle;
