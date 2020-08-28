import { Tag, PosArg, OptArg, Paragraph } from "../src/classes.js";

class RawString {
  constructor(value) {
    this.value = value; // a string
  }
}

function paragraphify(values /*, location*/) {
  var i;
  var result = [];
  var currentString = "";
  var currentParagraph = [];

  // Compress down newlines
  for (i = 0; i < values.length; ++i) {
    if (typeof values[i] == "string") {
      values[i] = values[i].replace(/\n\n+/g, "\n\n");
    }
  }

  // Split up strings into paragraphs if they are separated by two or more newlines
  for (var e of values) {
    if (typeof e == "string") {
      currentString += e;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        i = currentString.indexOf("\n\n");
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
  for (i = 0; i < result.length; ++i) {
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
    for (i = 0; i < result.length; ++i) {
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

export { RawString, paragraphify, postprocessList };
