/**
 * @module markyap
 * @description Core MarkYAP parsing utilities.
 */

import { Tag, PosArg, OptArg, Paragraph } from "./classes.js";
import { Visitor } from "./visitor.js";
import { parse, SyntaxError } from "../dist/parser.js";

export { Tag, PosArg, OptArg, Paragraph, parse, SyntaxError, Visitor };
export default {
  Tag: Tag,
  PosArg: PosArg,
  OptArg: OptArg,
  Paragraph: Paragraph,
  parse: parse,
  SyntaxError: SyntaxError,
  Visitor: Visitor,
};

/**
 * @function parse
 * @description Parses a MarkYAP format file and returns an array of paragraphs.
 * @param {string} input - The MarkYAP text to parse.
 * @returns {Array.<Paragraph>} The parsed MarkYAP text.
 * @throws {SyntaxError}
 */

/**
 * @class SyntaxError
 * @description A PegJS syntax error. Thrown by {@link parse} when an issue occurs.
 */
