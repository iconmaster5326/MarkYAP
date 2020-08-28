/**
 * @typedef PegJSLocation
 * @property {number} line
 * @property {number} column
 * @property {number} offset
 */

/**
 * @typedef PegJSSpan
 * @property {PegJSLocation} start
 * @property {PegJSLocation} end
 */

/**
 * A tag is a named command to a MarkYAP formatter.
 *
 * @property {string} name - The name of the tag.
 * May contain any non-whitespace, non-special characters.
 * @property {Array.<(OptArg|PosArg)>} args - The arguments for this tag.
 * @property {?PegJSSpan} location - The location of the tag, as given by PegJS.
 */
class Tag {
  /**
   * Create a new Tag.
   *
   * @param {string} name - The name of the tag.
   * @param {(Array.<(string|Tag|Paragraph|OptArg|PosArg)>|string|Tag|Paragraph|OptArg|PosArg)} [args=[]] - The arguments for this tag.
   * @param {?PegJSSpan} [location] - The location of the tag, as given by PegJS.
   */
  constructor(name, args = [], location) {
    this.name = name;
    this.args = args; // a list of PosArgs or OptArgs
    this.location = location;

    if (!(args instanceof Array)) {
      this.args = [args];
    }
    for (var i = 0; i < this.args.length; ++i) {
      var v = this.args[i];
      if (!(v instanceof PosArg || v instanceof OptArg)) {
        this.args[i] = new PosArg(v, false);
      }
    }
  }

  /**
   * Get this tag in a textual form.
   * @type {string}
   */
  get text() {
    var result = "\\" + this.name;
    for (var arg of this.args) {
      if (arg.raw) {
        result += "*";
      }

      if (arg instanceof PosArg) {
        result += "{" + arg.text + "}";
      } else if (arg instanceof OptArg) {
        result += "[" + arg.keyText + "=" + arg.valueText + "]";
      }
    }
    return result;
  }

  /**
   * Get a single positional or named argument.
   * If you get a named argument, and there are multiple named arguments with the same key,
   * the argument returned is arbitrary among them.
   *
   * @param {(number|string)} n The position of the aregument (if a number) or the key to find an argument via name by (if a string).
   * @returns {?(OptArg|PosArg)} The argument at that index or with that name, or null if not found.
   */
  argument(n) {
    if (typeof n == "number") {
      var posargs = this.positionalArguments;
      if (n < 0 || n >= posargs.length) {
        return null;
      } else {
        return this.positionalArguments[n];
      }
    } else if (typeof n == "string") {
      return this.firstNamedArgument(n);
    }
  }

  /**
   * Get all the positional arguments given to this tag.
   * @type {Array.<PosArg>}
   */
  get positionalArguments() {
    return this.args.filter((a) => a instanceof PosArg);
  }

  /**
   * Get all the named arguments given to this tag.
   * @type {Array.<OptArg>}
   */
  get namedArguments() {
    return this.args.filter((a) => a instanceof OptArg);
  }

  /**
   * Get a map from keys to named argument.
   * If there are multiple named arguments with the same key,
   * an arbitrary one is placed in this map.
   * @type {Object.<string,OptArg>}
   */
  get namedArgumentsMap() {
    return Object.fromEntries(this.namedArguments.map((a) => [a.keyText, a]));
  }

  /**
   * Finds the first named argument with a given key,
   * or else returns null if no such key was found.
   *
   * @param {string} name The key to look up.
   * @returns {?OptArg} The first argument with that key, or null.
   */
  firstNamedArgument(name) {
    for (var arg of this.namedArguments) {
      if (arg.keyText == name) {
        return arg;
      }
    }
    return null;
  }

  /**
   * Finds the last named argument with a given key,
   * or else returns null if no such key was found.
   *
   * @param {string} name The key to look up.
   * @returns {?OptArg} The last argument with that key, or null.
   */
  lastNamedArgument(name) {
    var result = null;
    for (var arg of this.namedArguments) {
      if (arg.keyText == name) {
        result = arg;
      }
    }
    return result;
  }

  /**
   * Finds all the named arguments in a tag with the given key.
   *
   * @param {string} name The key to look up.
   * @returns {Array.<OptArg>} A list of named arguments with that key.
   */
  allNamedArguments(name) {
    return this.namedArguments.filter((a) => a.keyText == name);
  }
}

/**
 * A positional argument in a tag, as given by `{}` syntax.
 *
 * @property {Array.<Paragraph>} value - The paragraphs enclosed within this argument.
 * @property {boolean} raw - If true, then whitespace should not be stripped from this argument.
 * @property {?PegJSSpan} location - The location of the argument, as given by PegJS.
 */
class PosArg {
  /**
   * Create a new PosArg.
   *
   * @param {(Array.<(string|Tag|Paragraph)>|string|Tag|Paragraph)} [value=[]] - The text within this argument.
   * @param {boolean} [raw=false] - If true, then whitespace should not be stripped from this argument.
   * @param {?PegJSSpan} [location] - The location of the tag, as given by PegJS.
   */
  constructor(value = [], raw = false, location) {
    this.value = value; // a list of Paragraphs
    this.raw = raw;
    this.location = location;

    if (!(value instanceof Array)) {
      this.value = [value];
    }
    for (var i = 0; i < this.value.length; ++i) {
      var v = this.value[i];
      if (!(v instanceof Paragraph)) {
        this.value[i] = new Paragraph(v, false);
      }
    }
  }

  /**
   * Get this argument's text as a single string.
   * @type {string}
   */
  get text() {
    return this.value.map((v) => v.text).join("\n\n");
  }

  /**
   * Finds the first tag with a given name,
   * or else returns null if no such tag was found.
   *
   * @param {string} name The tag to look up.
   * @returns {?Tag} The first tag with that name, or null.
   */
  findFirstTag(name) {
    for (var p of this.value) {
      var t = p.findFirstTag(name);
      if (t) {
        return t;
      }
    }
    return null;
  }

  /**
   * Finds the last tag with a given name,
   * or else returns null if no such tag was found.
   *
   * @param {string} name The tag to look up.
   * @returns {?Tag} The last tag with that name, or null.
   */
  findLastTag(name) {
    var result = null;
    for (var p of this.value) {
      var t = p.findLastTag(name);
      if (t) {
        result = t;
      }
    }
    return result;
  }

  /**
   * Returns an array of all the tags that have a given name.
   *
   * @param {string} name The name to search for.
   * @returns {Array.<Tag>} All tags with the given name.
   */
  findAllTags(name) {
    return this.value.flatMap((p) => p.findAllTags(name));
  }
}

/**
 * A named argument in a tag, as given by `[=]` syntax.
 *
 * @property {Array.<Paragraph>} key - The paragraphs enclosed within this argument's key.
 * @property {Array.<Paragraph>} value - The paragraphs enclosed within this argument's value.
 * @property {boolean} raw - If true, then whitespace should not be stripped from this argument's key or value.
 * @property {?PegJSSpan} location - The location of the tag, as given by PegJS.
 */
class OptArg {
  /**
   * Create a new OptArg.
   *
   * @param {(Array.<(string|Tag|Paragraph)>|string|Tag|Paragraph)} [key=[]] - The text within this argument's key.
   * @param {(Array.<(string|Tag|Paragraph)>|string|Tag|Paragraph)} [value=[]] - The text within this argument's value.
   * @param {boolean} [raw=false] - If true, then whitespace should not be stripped from this argument.
   * @param {?PegJSSpan} [location] - The location of the tag, as given by PegJS.
   */
  constructor(key = [], value = [], raw = false, location) {
    this.key = key; // a list of Paragraphs
    this.value = value; // a list of Paragraphs
    this.raw = raw;
    this.location = location;

    if (!(key instanceof Array)) {
      this.key = [key];
    }
    for (var i = 0; i < this.key.length; ++i) {
      var v = this.key[i];
      if (!(v instanceof Paragraph)) {
        this.key[i] = new Paragraph(v, false);
      }
    }

    if (!(value instanceof Array)) {
      this.value = [value];
    }
    for (var i2 = 0; i2 < this.value.length; ++i2) {
      var v2 = this.value[i2];
      if (!(v2 instanceof Paragraph)) {
        this.value[i2] = new Paragraph(v2, false);
      }
    }
  }

  /**
   * Get this argument's key's text as a single string.
   * @type {string}
   */
  get keyText() {
    return this.key.map((v) => v.text).join("\n\n");
  }

  /**
   * Get this argument's value's text as a single string.
   * @type {string}
   */
  get valueText() {
    return this.value.map((v) => v.text).join("\n\n");
  }

  /**
   * Finds the first tag in this argument's key with a given name,
   * or else returns null if no such tag was found.
   *
   * @param {string} name The tag to look up.
   * @returns {?Tag} The first tag with that name, or null.
   */
  findFirstTagInKey(name) {
    for (var p of this.key) {
      var t = p.findFirstTag(name);
      if (t) {
        return t;
      }
    }
    return null;
  }

  /**
   * Finds the last tag in this argument's key with a given name,
   * or else returns null if no such tag was found.
   *
   * @param {string} name The tag to look up.
   * @returns {?Tag} The last tag with that name, or null.
   */
  findLastTagInKey(name) {
    var result = null;
    for (var p of this.key) {
      var t = p.findLastTag(name);
      if (t) {
        result = t;
      }
    }
    return result;
  }

  /**
   * Returns an array of all the tags in this argument's key that have a given name.
   *
   * @param {string} name The name to search for.
   * @returns {Array.<Tag>} All tags with the given name.
   */
  findAllTagsInKey(name) {
    return this.key.flatMap((p) => p.findAllTags(name));
  }

  /**
   * Finds the first tag in this argument's value with a given name,
   * or else returns null if no such tag was found.
   *
   * @param {string} name The tag to look up.
   * @returns {?Tag} The first tag with that name, or null.
   */
  findFirstTagInValue(name) {
    for (var p of this.value) {
      var t = p.findFirstTag(name);
      if (t) {
        return t;
      }
    }
    return null;
  }

  /**
   * Finds the last tag in this argument's value with a given name,
   * or else returns null if no such tag was found.
   *
   * @param {string} name The tag to look up.
   * @returns {?Tag} The last tag with that name, or null.
   */
  findLastTagInValue(name) {
    var result = null;
    for (var p of this.value) {
      var t = p.findLastTag(name);
      if (t) {
        result = t;
      }
    }
    return result;
  }

  /**
   * Returns an array of all the tags in this argument's value that have a given name.
   *
   * @param {string} name The name to search for.
   * @returns {Array.<Tag>} All tags with the given name.
   */
  findAllTagsInValue(name) {
    return this.value.flatMap((p) => p.findAllTags(name));
  }
}

/**
 * A paragraph is a collection of text nodes and tags.
 * Documents and arguments may contain multiple paragraphs of text.
 *
 * @property {Array.<(string|Tag)>} children - The text and tags that make up a single paragraph.
 * @property {?PegJSSpan} location - The location of the paragraph, as given by PegJS.
 */
class Paragraph {
  /**
   * Create a new Paragraph.
   *
   * @param {(Array.<(string|Tag|Paragraph)>|string|Tag|Paragraph)} [children=[]] - The text within this paragraph.
   * @param {?PegJSSpan} [location] - The location of the tag, as given by PegJS.
   */
  constructor(children = [], location) {
    this.location = location;

    if (!(children instanceof Array)) {
      children = [children];
    }

    this.children = []; // a list of strings or Tags
    for (var child of children) {
      if (child instanceof Paragraph) {
        this.children.push(...child.children);
      } else {
        this.children.push(child);
      }
    }
  }

  /**
   * Get this paragraph's text as a single string.
   * @type {string}
   */
  get text() {
    return this.children
      .map((c) => (typeof c == "string" ? c : c.text))
      .join("");
  }

  /**
   * Finds the first tag in this paragraph with a given name,
   * or else returns null if no such tag was found.
   *
   * @param {string} name The tag to look up.
   * @returns {?Tag} The first tag with that name, or null.
   */
  findFirstTag(name) {
    for (var t of this.children) {
      if (t instanceof Tag && t.name == name) {
        return t;
      }
    }
    return null;
  }

  /**
   * Finds the last tag in this paragraph with a given name,
   * or else returns null if no such tag was found.
   *
   * @param {string} name The tag to look up.
   * @returns {?Tag} The last tag with that name, or null.
   */
  findLastTag(name) {
    var result = null;
    for (var t of this.children) {
      if (t instanceof Tag && t.name == name) {
        result = t;
      }
    }
    return result;
  }

  /**
   * Returns an array of all the tags in this paragraph
   * that have a given name.
   *
   * @param {string} name The name to search for.
   * @returns {Array.<Tag>} All tags with the given name.
   */
  findAllTags(name) {
    return this.children.filter((t) => t instanceof Tag && t.name == name);
  }
}

export { Tag, PosArg, OptArg, Paragraph };
