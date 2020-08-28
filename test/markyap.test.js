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

  describe("Tag", function () {
    describe("argument", function () {
      it("positional", function () {
        var t = new markyap.Tag("name", [
          new markyap.PosArg("1"),
          new markyap.PosArg("2"),
          new markyap.OptArg("3"),
          new markyap.PosArg("4"),
          new markyap.OptArg("5"),
          new markyap.OptArg("6"),
          new markyap.PosArg("7"),
        ]);

        chai.expect(t.argument(0)).to.be.equal(t.args[0]);
        chai.expect(t.argument(1)).to.be.equal(t.args[1]);
        chai.expect(t.argument(2)).to.be.equal(t.args[3]);
        chai.expect(t.argument(3)).to.be.equal(t.args[6]);

        chai.expect(t.argument(-1)).to.be.null;
        chai.expect(t.argument(4)).to.be.null;
      });

      it("named", function () {
        var t = new markyap.Tag("name", [
          new markyap.PosArg("1"),
          new markyap.PosArg("2"),
          new markyap.OptArg("3"),
          new markyap.PosArg("4"),
          new markyap.OptArg("5"),
          new markyap.OptArg("6"),
          new markyap.PosArg("7"),
        ]);

        chai.expect(t.argument("3")).to.be.equal(t.args[2]);
        chai.expect(t.argument("5")).to.be.equal(t.args[4]);
        chai.expect(t.argument("6")).to.be.equal(t.args[5]);

        chai.expect(t.argument("")).to.be.null;
        chai.expect(t.argument("1")).to.be.null;
        chai.expect(t.argument("a")).to.be.null;
        chai.expect(t.argument("3 ")).to.be.null;
      });
    });

    it("positionalArguments", function () {
      var t = new markyap.Tag("name", [
        new markyap.PosArg("1"),
        new markyap.PosArg("2"),
        new markyap.OptArg("3"),
        new markyap.PosArg("4"),
        new markyap.OptArg("5"),
        new markyap.OptArg("6"),
        new markyap.PosArg("7"),
      ]);

      chai
        .expect(t.positionalArguments)
        .to.be.an("array")
        .with.length(4)
        .and.has.ordered.members([t.args[0], t.args[1], t.args[3], t.args[6]]);
    });

    it("namedArguments", function () {
      var t = new markyap.Tag("name", [
        new markyap.PosArg("1"),
        new markyap.PosArg("2"),
        new markyap.OptArg("3"),
        new markyap.PosArg("4"),
        new markyap.OptArg("5"),
        new markyap.OptArg("6"),
        new markyap.PosArg("7"),
      ]);

      chai
        .expect(t.namedArguments)
        .to.be.an("array")
        .with.length(3)
        .and.has.ordered.members([t.args[2], t.args[4], t.args[5]]);
    });

    it("namedArgumentsMap", function () {
      var t = new markyap.Tag("name", [
        new markyap.PosArg("1"),
        new markyap.PosArg("2"),
        new markyap.OptArg("3"),
        new markyap.PosArg("4"),
        new markyap.OptArg("5"),
        new markyap.OptArg("6"),
        new markyap.PosArg("7"),
      ]);

      var argmap = t.namedArgumentsMap;
      chai
        .expect(argmap)
        .to.be.an("object")
        .with.all.keys("3", "5", "6")
        .and.not.any.keys("1", "2", "4", "7");
      chai.expect(argmap["3"]).to.equal(t.args[2]);
      chai.expect(argmap["5"]).to.equal(t.args[4]);
      chai.expect(argmap["6"]).to.equal(t.args[5]);
    });

    it("firstNamedArgument", function () {
      var t = new markyap.Tag("name", [
        new markyap.OptArg("a"),
        new markyap.OptArg("b"),
        new markyap.OptArg("c"),
        new markyap.OptArg("b"),
      ]);

      chai.expect(t.firstNamedArgument("a")).to.be.equal(t.args[0]);
      chai.expect(t.firstNamedArgument("b")).to.be.equal(t.args[1]);
      chai.expect(t.firstNamedArgument("c")).to.be.equal(t.args[2]);

      chai.expect(t.firstNamedArgument("")).to.be.null;
      chai.expect(t.firstNamedArgument("1")).to.be.null;
      chai.expect(t.firstNamedArgument("d")).to.be.null;
      chai.expect(t.firstNamedArgument("a ")).to.be.null;
    });

    it("lastNamedArgument", function () {
      var t = new markyap.Tag("name", [
        new markyap.OptArg("a"),
        new markyap.OptArg("b"),
        new markyap.OptArg("c"),
        new markyap.OptArg("b"),
      ]);

      chai.expect(t.lastNamedArgument("a")).to.be.equal(t.args[0]);
      chai.expect(t.lastNamedArgument("b")).to.be.equal(t.args[3]);
      chai.expect(t.lastNamedArgument("c")).to.be.equal(t.args[2]);

      chai.expect(t.lastNamedArgument("")).to.be.null;
      chai.expect(t.lastNamedArgument("1")).to.be.null;
      chai.expect(t.lastNamedArgument("d")).to.be.null;
      chai.expect(t.lastNamedArgument("a ")).to.be.null;
    });

    it("allNamedArguments", function () {
      var t = new markyap.Tag("name", [
        new markyap.OptArg("a"),
        new markyap.OptArg("b"),
        new markyap.OptArg("c"),
        new markyap.OptArg("b"),
      ]);

      chai
        .expect(t.allNamedArguments("a"))
        .to.be.an("array")
        .with.length(1)
        .and.has.ordered.members([t.args[0]]);

      chai
        .expect(t.allNamedArguments("b"))
        .to.be.an("array")
        .with.length(2)
        .and.has.ordered.members([t.args[1], t.args[3]]);

      chai.expect(t.allNamedArguments("d")).to.be.an("array").and.empty;
    });
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

    it("space compression", function () {
      var result = markyap.parse("hello     world!");
      chai.expect(result).to.be.an("array").with.length(1);
      chai.expect(result[0].text).to.equal("hello world!");
    });

    it("newline compression", function () {
      var result = markyap.parse("hello\n\n\n\n\n\n\n\n\n\nworld!");
      chai.expect(result).to.be.an("array").with.length(2);
      chai.expect(result[0].text).to.equal("hello");
      chai.expect(result[1].text).to.equal("world!");
    });

    it("raw text tag", function () {
      var result = markyap.parse("a\\*{ b }c");
      chai.expect(result).to.be.an("array").with.length(1);
      chai.expect(result[0].text).to.equal("a b c");
    });

    it("tags", function () {
      var result = markyap.parse("\\a \\b{c} \\d[e=f] \\g{h}[i]");
      chai.expect(result).to.be.an("array").with.length(1);
      chai.expect(result[0].text).to.equal("\\a \\b{c} \\d[e=f] \\g{h}[i=]");
    });
  });
});
