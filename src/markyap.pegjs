{
  // imports are declared in the gulpfile, because pegjs is poop and doesn't support ES6 modules

  class RawString {
    constructor(value) {
      this.value = value; // a string
    }
  }

  function paragraphify(values, location) {
    var result = [];
    var currentString = "";
    var currentParagraph = [];

    // Compress down newlines
    for (var i = 0; i < values.length; ++i) {
      if (typeof values[i] == "string") {
        values[i] = values[i].replace(/\n\n+/g, "\n\n");
      }
    }

    // Split up strings into paragraphs if they are separated by two or more newlines
    for (var e of values) {
      if (typeof e == "string") {
        currentString += e;
        while (true) {
          var i = currentString.indexOf("\n\n");
          if (i == -1) break;
          var s = currentString.substring(0, i);
          if (s) {
            currentParagraph.push(s);
          }
          result.push(currentParagraph);
          currentParagraph = [];
          currentString = currentString.substring(i + 1);
        }
      } else {
        if (currentString) {
          currentParagraph.push(currentString);
          currentString = "";
        }
        currentParagraph.push(e);
      }
    }

    // Ensure the trailing string/paragraph is in the result
    if (currentString) {
      currentParagraph.push(currentString);
    }
    if (currentParagraph) {
      result.push(new Paragraph(currentParagraph));
    }

    // Compress down spaces
    for (var i = 0; i < result.length; ++i) {
      if (typeof result[i] == "string") {
        result[i] = result[i].replace(/\s+/g, " ");
      }
    }

    // Trim beginning and end of array
    if (result.length == 1) {
      if (typeof result[0] == "string") {
        result[0] = result[0].trim();
      }
    } else {
      for (var i = 0; i < result.length; ++i) {
        if (typeof result[i] == "string") {
          if (i == 0) {
            result[i] = result[i].trimBegin();
          } else if (i == result.length - 1) {
            result[i] = result[i].trimEnd();
          }
        }
      }
    }

    // All done
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

document
  = value:(literalBackslash / rawTextTag / tag / any / "\\")* {
      var doc = paragraphify(value, location());
      postprocessList(doc);
      return doc;
    }

literalBackslash = "\\" value:[\\\{\}\[\]\=\*\(\)\"] { return value; }

tag
  = "\\"
    whitespace?
    name:identifier
    args:(
      whitespace?
        (
          positionalArgument
          / optionalArgument
          / rawPositionalArgument
          / rawOptionalArgument
        )
    )* {
      return new Tag(
        name,
        args.map((x) => x[1]),
        location()
      );
    }

rawTextTag
  = "\\" whitespace? arg:rawPositionalArgument {
      return arg.value[0].children[0];
    }

positionalArgument
  = "{" value:positionalArgumentInternals "}" {
      return new PosArg(value, false, location());
    }

positionalArgumentInternals
  = value:(literalBackslash / rawTextTag / tag / anyButPositionalArgumentEnd)* {
      return paragraphify(value, location());
    }

optionalArgument
  = "["
    key:optionalArgumentInternals1
    value:("=" optionalArgumentInternals2)?
    "]" {
      return new OptArg(key, false, value == null ? [] : value[1], location());
    }

optionalArgumentInternals1
  = value:(literalBackslash / rawTextTag / tag / anyButOptionalArgumentEnd1)* {
      return paragraphify(value, location());
    }

optionalArgumentInternals2
  = value:(literalBackslash / rawTextTag / tag / anyButOptionalArgumentEnd2)* {
      return paragraphify(value, location());
    }

rawPositionalArgument
  = "*{" value:rawPositionalArgumentInternals "}" {
      return new PosArg(value, true, location());
    }

rawPositionalArgumentInternals
  = value:(literalBackslash / anyButPositionalArgumentEnd / "\\")* {
      return [new Paragraph([new RawString(value.join(""))], location())];
    }

rawOptionalArgument
  = "*["
    key:rawOptionalArgumentInternals1
    value:("=" rawOptionalArgumentInternals2)?
    "]" {
      return new OptArg(key, true, value == null ? [] : value[1], location());
    }

rawOptionalArgumentInternals1
  = value:(literalBackslash / anyButOptionalArgumentEnd1 / "\\")* {
      return [new Paragraph([new RawString(value.join(""))], location())];
    }

rawOptionalArgumentInternals2
  = value:(literalBackslash / anyButOptionalArgumentEnd2 / "\\")* {
      return [new Paragraph([new RawString(value.join(""))], location())];
    }

identifier = $[^ \t\n\r\\\{\}\[\]\=\*\(\)\"]+

any = $[^\\]+

anyButPositionalArgumentEnd = $[^\\\}]+

anyButOptionalArgumentEnd1 = $[^\\\]\=]+

anyButOptionalArgumentEnd2 = $[^\\\]]+

whitespace = [ \t\n\r]+
