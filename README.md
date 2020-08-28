# MarkYAP

MarkYAP (short for "markup, yet another permutation") is a format for formatting rich text in an extensible, consistent, and readable manner.

Features include:

- It looks like LaTeX format! But it's not!
- Markup tag can be given both positional and optional arguments!
- Support for embedding unformatted text!
- Extensible to all your markup needs!

## Specification

All formatting tags in MarkYAP begin with a `\`:

```latex
hello \tag world! \othertag
```

A basic tag has a name, which may be composed of any non-whitespace, non-special characters. The special characters in MarkYAP are the following:

```
\ { } [ ] ( ) = * "
```

They may be prepended with a backslash to escape them; however, this is optional depending on where in the document the character lies. Note that `(`, `)`, and `"` are currently unused, so you don't have to bother escaping them, but are reserved for future use.

```latex
{ these braces will be put literally in the output }
\but { these will not }
\although \{ these will! \}
```

A tag can have zero or more arguments. These arguments can be positional or named. Positional arguments are given using `{}` syntax:

```latex
hello \b{world}!
3*2 is \times{3}{2}. Neat.
```

Named arguments are given using `[=]` syntax, and the two types of arguments may be freely interchanged:

```latex
\table[rows=5][cols=6]{
    \row{Hello!}[span=6]
}
```

Finally, any argument can be preceded with a `*` in order to disable the parsing of tags and preserve all whitespace:

```latex
Here is a single bold space: \b*{ }. Wow!
If you want a comment, use \tag*{\#}.
Did you know this works for \font*[spacing=    ]{optional arguments} too?
```

Speaking of `*`, there also exists a special form of tag that simply pastes the text in your document as-is, but ensures all whitespace is preserved:

```latex
\*{ = raw text here = }
```

And that is all the syntax of MarkYAP. Moreover, the set of predefined tags is almost nonexistent, as MarkYAP is designed for use in DSLs and other places where you have a lot of rich text but also a lot of information to encode, where Markdown or similar just won't cut it.
