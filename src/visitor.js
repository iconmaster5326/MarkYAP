import { Tag, PosArg, OptArg, Paragraph } from "./classes.js";

/**
 * @typedef VisitorOptions
 * @property {Function} [visitText] Called when the visitor encounters plain text.
 * @property {Object.<string,Function>} [visitTag] A map from tag names to handler functions. Called when the visitor encounters a tag with a given name.
 * @property {Function} [visitUnknownTag] Called when the visitor encounters a node not described in `visitTag`.
 * @property {Function} [visitParagraph] Called when the visitor encounters a paragraph.
 */

class Replace {
  constructor(what) {
    this.what = what;
  }
}
class Delete {}

/**
 * This implements the visitor design pattern for traversing MarkYAP documents.
 *
 * In the {@link VisitorOptions} object, you maye specify several callbacks for entities in the MarkYAP document.
 * The return value from your callbacks can also mutate the document.
 * Use the {@link replace} and {@link delete} methods to specify what mutations to execute.
 *
 * @property {VisitorOptions} options The callbacks and options for this visitor.
 */
class Visitor {
  /**
   * Create a new Visitor.
   * @param {VisitorOptions} options The callbacks and options for this visitor.
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Indicates, as a return value from a callback,
   * that you want to replace this node with another.
   *
   * @param {*} what What to replace this node with.
   */
  static replace(what) {
    return new Replace(what);
  }

  /**
   * Indicates, as a return value from a callback,
   * that you want to delete this node if it is part of an array.
   */
  static delete() {
    return new Delete();
  }

  /**
   * Traverse a tag, paragraph, argument, or an array of any of the above.
   *
   * @param {(string|Tag|Paragraph|PosArg|OptArg|Array.<(string|Tag|Paragraph|PosArg|OptArg)>)} document The item to trasverse.
   */
  visit(document) {
    if (document instanceof Array) {
      for (var i = 0; i < document.length; ++i) {
        var v = document[i];
        var result = this.visit(v);
        if (result instanceof Replace) {
          document[i] = result.what;
        } else if (result instanceof Delete) {
          document.splice(i, 1);
          --i;
        }
      }
    } else if (typeof document == "string") {
      if (this.options.visitText) {
        return this.options.visitText(document);
      }
    } else if (document instanceof Tag) {
      this.visit(document.args);

      if (this.options.visitTag && document.name in this.options.visitTag) {
        return this.options.visitTag[document.name](document);
      } else if (this.options.visitUnknownTag) {
        return this.options.visitUnknownTag(document);
      }
    } else if (document instanceof PosArg) {
      this.visit(document.value);
    } else if (document instanceof OptArg) {
      this.visit(document.key);
      this.visit(document.value);
    } else if (document instanceof Paragraph) {
      this.visit(document.children);

      if (this.options.visitParagraph) {
        return this.options.visitParagraph(document);
      }
    }
  }
}

export { Visitor };
