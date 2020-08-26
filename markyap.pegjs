{
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

  class RawString {
  	constructor(value) {
      this.value = value; // a string
    }
  }

  function paragraphify(values, location) {
    var result = [];
    var currentString = "";
    var currentParagraph = [];
    for (var e of values) {
        if (typeof e == "string") {
            currentString += e;
            while (true) {
                var i = currentString.indexOf("\n\n");
                if (i == -1) break;
                var s = currentString.substring(0, i).trim();
                if (s) {
                    currentParagraph.push(s);
                }
                result.push(currentParagraph);
                currentParagraph = [];
                currentString = currentString.substring(i+1);
            }
        } else {
            var s = currentString.trim()
            if (s) {
                currentParagraph.push(s);
                currentString = "";
            }
            currentParagraph.push(e);
        }
    }
    var s = currentString.trim()
    if (s) {
        currentParagraph.push(s);
    }
    if (currentParagraph) {
        result.push(new Paragraph(currentParagraph));
    }
    return result;
  }

  function postprocessList(values) {
      for (var i = 0; i < values.length; i++) {
          if (values[i] instanceof RawString) {
              values[i] = values[i].value;
          } else if (values[i] instanceof Paragraph) {
              postprocessList(values[i].children);
          } else if (values[i] instanceof PosArg) {
              postprocessList(values[i].value);
          } else if (values[i] instanceof OptArg) {
              postprocessList(values[i].key);
              postprocessList(values[i].value);
          } else if (values[i] instanceof Tag) {
              postprocessList(values[i].args);
          }
      }
  }
}

document = value:(literalBackslash / rawTextTag / tag / any / "\\")* {
    var doc = paragraphify(value, location());
    postprocessList(doc);
    return doc;
}
literalBackslash = "\\" value:[\\\{\}\[\]\=\*\(\)\"] {
    return value;
}

tag = "\\" whitespace? name:identifier args:(whitespace? (positionalArgument / optionalArgument / rawPositionalArgument / rawOptionalArgument))* {
    return new Tag(name, args.map(x => x[1]), location());
}
rawTextTag = "\\" whitespace? arg:rawPositionalArgument {
    return arg.value[0].children[0];
}

positionalArgument = "{" value:positionalArgumentInternals "}" {
    return new PosArg(value, false, location());
}
positionalArgumentInternals = value:(literalBackslash / rawTextTag / tag / anyButPositionalArgumentEnd)* {
    return paragraphify(value, location());
}

optionalArgument = "[" key:optionalArgumentInternals1 value:("=" optionalArgumentInternals2)? "]" {
    return new OptArg(key, false, value == null ? [] : value[1], location());
}
optionalArgumentInternals1 = value:(literalBackslash / rawTextTag / tag / anyButOptionalArgumentEnd1)* {
    return paragraphify(value, location());
}
optionalArgumentInternals2 = value:(literalBackslash / rawTextTag / tag / anyButOptionalArgumentEnd2)* {
    return paragraphify(value, location());
}

rawPositionalArgument = "*{" value:rawPositionalArgumentInternals "}" {
    return new PosArg(value, true, location());
}
rawPositionalArgumentInternals = value:(literalBackslash / anyButPositionalArgumentEnd / "\\")* {
    return [new Paragraph([new RawString(value.join(""))], location())];
}

rawOptionalArgument = "*[" key:rawOptionalArgumentInternals1 value:("=" rawOptionalArgumentInternals2)? "]" {
    return new OptArg(key, true, value == null ? [] : value[1], location());
}
rawOptionalArgumentInternals1 = value:(literalBackslash / anyButOptionalArgumentEnd1 / "\\")* {
    return [new Paragraph([new RawString(value.join(""))], location())];
}
rawOptionalArgumentInternals2 = value:(literalBackslash / anyButOptionalArgumentEnd2 / "\\")* {
    return [new Paragraph([new RawString(value.join(""))], location())];
}

identifier = $ [^ \t\n\r\\\{\}\[\]\=\*\(\)\"]+
any = $ [^\\]+
anyButPositionalArgumentEnd = $ [^\\\}]+
anyButOptionalArgumentEnd1 = $ [^\\\]\=]+
anyButOptionalArgumentEnd2 = $ [^\\\]]+
whitespace = [ \t\n\r]+
