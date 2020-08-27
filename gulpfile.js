import gulp from "gulp";
import pegjs from "gulp-pegjs";
import header from "gulp-header";
import footer from "gulp-footer";
import replace from "gulp-replace";

const HEADER = `
import { Tag, PosArg, OptArg, Paragraph } from "./classes.js";
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
    .src("markyap.pegjs")
    .pipe(pegjs({ format: "commonjs", exportVar: "parser" }))
    .pipe(header(HEADER))
    .pipe(footer(FOOTER))
    .pipe(replace(TO_REMOVE, ""))
    .pipe(gulp.dest("."));
}

export { parser };
export default parser;
