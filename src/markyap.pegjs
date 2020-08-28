// imports are declared in the gulpfile, because pegjs is poop and doesn't support ES6 modules

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
