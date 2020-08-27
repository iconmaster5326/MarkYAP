import { Tag, PosArg, OptArg, Paragraph } from "./classes.js";
import { parse, SyntaxError } from "../dist/parser.js";

export { Tag, PosArg, OptArg, Paragraph, parse, SyntaxError };
export default {
  Tag: Tag,
  PosArg: PosArg,
  OptArg: OptArg,
  Paragraph: Paragraph,
  parse: parse,
  SyntaxError: SyntaxError,
};
