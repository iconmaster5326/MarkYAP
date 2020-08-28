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

      it("string list", function () {
        var v = new markyap.Tag("name", ["arg1", "arg2"]);
        chai.expect(v.name).to.be.equal("name");
        chai.expect(v.args).to.be.an("array").with.length(2);

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
          .and.equal("arg1");

        chai.expect(v.args[1]).to.be.an.instanceOf(markyap.PosArg);
        chai.expect(v.args[1].value).to.be.an("array").with.length(1);
        chai.expect(v.args[1].value[0]).to.be.an.instanceOf(markyap.Paragraph);
        chai
          .expect(v.args[1].value[0].children)
          .to.be.an("array")
          .with.length(1);
        chai
          .expect(v.args[1].value[0].children[0])
          .to.be.a("string")
          .and.equal("arg2");
      });
    });

    describe("PosArg", function () {
      it("default", function () {
        var v = new markyap.PosArg([]);
        chai.expect(v.raw).to.be.false;
        chai.expect(v.value).to.be.an("array").and.empty;
      });

      it("string", function () {
        var v = new markyap.PosArg("hello world");
        chai.expect(v.raw).to.be.false;
        chai.expect(v.value).to.be.an("array").and.with.length(1);
        chai.expect(v.value[0]).to.be.instanceOf(markyap.Paragraph);
        chai.expect(v.value[0].children).to.be.an("array").and.with.length(1);
        chai
          .expect(v.value[0].children[0])
          .to.be.a("string")
          .and.equal("hello world");
      });

      it("string list", function () {
        var v = new markyap.PosArg(["hello", "world"]);
        chai.expect(v.raw).to.be.false;
        chai.expect(v.value).to.be.an("array").and.with.length(2);
        chai.expect(v.value[0]).to.be.instanceOf(markyap.Paragraph);

        chai.expect(v.value[0].children).to.be.an("array").and.with.length(1);
        chai
          .expect(v.value[0].children[0])
          .to.be.a("string")
          .and.equal("hello");

        chai.expect(v.value[1].children).to.be.an("array").and.with.length(1);
        chai
          .expect(v.value[1].children[0])
          .to.be.a("string")
          .and.equal("world");
      });

      it("nested string list", function () {
        var v = new markyap.PosArg([
          ["hello", "1"],
          ["world", "2"],
        ]);
        chai.expect(v.raw).to.be.false;
        chai.expect(v.value).to.be.an("array").and.with.length(2);
        chai.expect(v.value[0]).to.be.instanceOf(markyap.Paragraph);

        chai.expect(v.value[0].children).to.be.an("array").and.with.length(2);
        chai
          .expect(v.value[0].children[0])
          .to.be.a("string")
          .and.equal("hello");
        chai.expect(v.value[0].children[1]).to.be.a("string").and.equal("1");

        chai.expect(v.value[1].children).to.be.an("array").and.with.length(2);
        chai
          .expect(v.value[1].children[0])
          .to.be.a("string")
          .and.equal("world");
        chai.expect(v.value[1].children[1]).to.be.a("string").and.equal("2");
      });
    });
  });

  describe("text() functions", function () {
    function test(name, input, output) {
      it(name, function () {
        chai.expect(input.text).to.be.equal(output);
      });
    }

    test("basic string", new markyap.Paragraph(["hello world"]), "hello world");
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
