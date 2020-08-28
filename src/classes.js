class Tag {
  constructor(name, args, location) {
    this.name = name;
    this.args = args; // a list of PosArgs or OptArgs
    this.location = location;
  }

  get text() {
    var result = "\\" + name;
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
    this.children = children; // a list of strings, RawStrings, or Tags
    this.location = location;
  }

  get text() {
    return this.children
      .map((c) => (typeof c == "string" ? c : c.text))
      .join(" ");
  }
}

export { Tag, PosArg, OptArg, Paragraph };
