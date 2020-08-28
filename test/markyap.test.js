import markyap from "../src/index.js";
import chai from "chai";

describe("MarkYAP", function () {
  describe("constructors", function () {
    describe("Tag", function () {
      it("default", function () {
        var v = new markyap.Tag("name", []);
        chai.expect(v.name).to.be.equal("name");
        chai.expect(v.args).to.be.an("array").and.empty;
      });

      it("string", function () {
        var v = new markyap.Tag("name", "body");
        chai.expect(v.name).to.be.equal("name");
        chai.expect(v.args).to.be.an("array").with.length(1);
        chai.expect(v.args[0]).to.be.an.instanceOf(markyap.PosArg);
        chai.expect(v.args[0].value).to.be.an("array").with.length(1);
        chai.expect(v.args[0].value[0]).to.be.an.instanceOf(markyap.Paragraph);
        chai
          .expect(v.args[0].value[0].children)
          .to.be.an("array")
          .with.length(1);
        chai
          .expect(v.args[0].value[0].children[0])
          .to.be.a("string")
          .and.equal("body");
      });
    });
  });

  describe("text() functions", function () {
    function test(name, input, output) {
      it(name, function () {
        chai.expect(input.text).to.be.equal(output);
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
      chai.expect(result).to.be.an("array").with.length(1);
      chai.expect(result[0]).to.be.an.instanceOf(markyap.Paragraph);
      chai.expect(result[0].children).to.be.an("array").with.length(1);
      chai.expect(result[0].children[0]).to.be.a("string").and.equal(s);
    });
  });
});
