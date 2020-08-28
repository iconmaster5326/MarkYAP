class Tag {
  constructor(name, args, location) {
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
}

class PosArg {
  constructor(value, raw, location) {
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

  get text() {
    return this.value.map((v) => v.text).join("\n\n");
  }
}

class OptArg {
  constructor(key, value, raw, location) {
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

  get keyText() {
    return this.key.map((v) => v.text).join("\n\n");
  }

  get valueText() {
    return this.value.map((v) => v.text).join("\n\n");
  }
}

class Paragraph {
  constructor(children, location) {
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

  get text() {
    return this.children
      .map((c) => (typeof c == "string" ? c : c.text))
      .join(" ");
  }
}

export { Tag, PosArg, OptArg, Paragraph };
