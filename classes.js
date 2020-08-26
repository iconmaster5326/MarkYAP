class Tag {
  constructor(name, args, location) {
    this.name = name;
    this.args = args; // a list of PosArgs or OptArgs
    this.location = location;
  }
}

class PosArg {
  constructor(value, raw, location) {
    this.value = value; // a list of Paragraphs
    this.raw = raw;
    this.location = location;
  }
}

class OptArg {
  constructor(key, value, raw, location) {
    this.key = key; // a list of Paragraphs
    this.value = value; // a list of Paragraphs
    this.raw = raw;
    this.location = location;
  }
}

class Paragraph {
  constructor(children, location) {
    this.children = children; // a list of strings, RawStrings, or Tags
    this.location = location;
  }
}

export { Tag, PosArg, OptArg, Paragraph };
