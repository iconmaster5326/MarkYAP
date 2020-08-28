import markyap from "../src/index.js";
import assert from "assert";

describe("MarkYAP", function () {
  describe("text() functions", function () {
    it("basic string", function () {
      var p = new markyap.Paragraph(["hello", "world"]);
      assert.strictEqual(p.text, "hello world");
    });
  });

  describe("parser", function () {
    it("basic string", function () {
      var s = "hello, world!";
      var result = markyap.parse(s);
      assert.ok(result instanceof Array);
      assert.strictEqual(result.length, 1);
      var p = result[0];
      assert.ok(p instanceof markyap.Paragraph);
      assert.strictEqual(p.children.length, 1);
      var child = p.children[0];
      assert.strictEqual(typeof child, "string");
      assert.strictEqual(child, s);
    });
  });
});
