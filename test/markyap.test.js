import markyap from "../src/index.js";
import chai from "chai";

describe("MarkYAP", function () {
  describe("constructors", function () {
    describe("Tag", function () {
      it("default", function () {
        var v = new markyap.Tag("name", []);
        chai.assert.deepEqual(v.name, "name");
        chai.assert.deepEqual(v.args, []);
      });

      it("string", function () {
        var v = new markyap.Tag("name", "body");
        chai.assert.deepEqual(v.name, "name");
        chai.assert.strictEqual(v.args.length, 1);
        chai.assert.ok(v.args[0] instanceof markyap.PosArg);
        chai.assert.strictEqual(v.args[0].value.length, 1);
        chai.assert.ok(v.args[0].value[0] instanceof markyap.Paragraph);
        chai.assert.strictEqual(v.args[0].value[0].children.length, 1);
        chai.assert.strictEqual(
          typeof v.args[0].value[0].children[0],
          "string"
        );
        chai.assert.strictEqual(v.args[0].value[0].children[0], "body");
      });
    });
  });

  describe("text() functions", function () {
    function test(name, input, output) {
      it(name, function () {
        chai.assert.strictEqual(input.text, output);
      });
    }

    test(
      "basic string",
      new markyap.Paragraph(["hello", "world"]),
      "hello world"
    );
    test(
      "tag",
      new markyap.Tag("tag", [
        new markyap.PosArg([new markyap.Paragraph(["arg1"])], false),
        new markyap.OptArg(
          [new markyap.Paragraph(["arg2"])],
          [new markyap.Paragraph(["arg3"])],
          false
        ),
        new markyap.PosArg([new markyap.Paragraph(["arg4"])], true),
        new markyap.OptArg(
          [new markyap.Paragraph(["arg5"])],
          [new markyap.Paragraph(["arg6"])],
          true
        ),
      ]),
      "\\tag{arg1}[arg2=arg3]*{arg4}*[arg5=arg6]"
    );
  });

  describe("parser", function () {
    it("basic string", function () {
      var s = "hello, world!";
      var result = markyap.parse(s);
      chai.assert.ok(result instanceof Array);
      chai.assert.strictEqual(result.length, 1);
      var p = result[0];
      chai.assert.ok(p instanceof markyap.Paragraph);
      chai.assert.strictEqual(p.children.length, 1);
      var child = p.children[0];
      chai.assert.strictEqual(typeof child, "string");
      chai.assert.strictEqual(child, s);
    });
  });
});
