import assert from "power-assert";
import {opener} from "./lib/override-opener";
import BufferStream from "./lib/buffer-stream";
import {setupWorkspace,
        teardownWorkspace,
        readPackageJson,
        readActualVersions,
        TEST_PACKAGE1,
        TEST_PACKAGE2,
        TEST_PACKAGE3} from "./lib/workspace";
import command0 from "../src/command";
import Promise from "../src/promise";

function command(args, metaOptions = {stdout: new BufferStream()}) {
  return new Promise((resolve, reject) => {
    command0(args, metaOptions, err => err ? reject(err) : resolve());
  });
}

describe("uptodate command", () => {
  beforeEach(() => {
    opener.calls = [];
    return setupWorkspace();
  });
  afterEach(() => {
    return teardownWorkspace();
  });

  it("should rewrite package.json", () => {
    return command([])
      .then(() => readPackageJson())
      .then(info => {
        assert(info.dependencies[TEST_PACKAGE1] === "^2.0.0");
        assert(info.dependencies[TEST_PACKAGE2] === "^2.0.0");
        assert(info.devDependencies[TEST_PACKAGE3] === "^2.0.0");
      });
  });

  it("should update packages actually.", () => {
    return command([])
      .then(() => readActualVersions())
      .then(versions => {
        assert(versions[TEST_PACKAGE1] === "2.0.0");
        assert(versions[TEST_PACKAGE2] === "2.0.0");
        assert(versions[TEST_PACKAGE3] === "2.0.0");
      });
  });

  it("should open changelogs.", () => {
    return command([])
      .then(() => {
        assert(opener.calls.length === 1);
        assert(/\?JTQwbXlzdGljYXRlYSUyRnVwdG9kYXRlLXRlc3QtcGFja2FnZTEsJTQwbXlzdGljYXRlYSUyRnVwdG9kYXRlLXRlc3QtcGFja2FnZTIsJTQwbXlzdGljYXRlYSUyRnVwdG9kYXRlLXRlc3QtcGFja2FnZTM=/.test(opener.calls[0].url));
      });
  });

  describe("with --help option", () => {
    it("should show help text.", () => {
      const stdout = new BufferStream();
      return command(["--help"], {stdout})
        .then(() => {
          assert(/Usage:/.test(stdout.value));
        })
        .catch(err => {
          console.error(err);
          throw err;
        });
    });
  });

  describe("with --version option", () => {
    it("should show version number.", () => {
      const stdout = new BufferStream();
      return command(["--version"], {stdout})
        .then(() => {
          assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(stdout.value));
        });
    });
  });

  describe("with --ignore option", () => {
    it("should not update the specified packages. (single)", () => {
      return command(["--ignore", TEST_PACKAGE2])
        .then(() => readPackageJson())
        .then(info => {
          assert(info.dependencies[TEST_PACKAGE1] === "^2.0.0");
          assert(info.dependencies[TEST_PACKAGE2] === "^1.0.0");
          assert(info.devDependencies[TEST_PACKAGE3] === "^2.0.0");
        })
        .then(() => readActualVersions())
        .then(versions => {
          assert(versions[TEST_PACKAGE1] === "2.0.0");
          assert(versions[TEST_PACKAGE2] === "1.0.0");
          assert(versions[TEST_PACKAGE3] === "2.0.0");
        });
    });

    it("should not update the specified packages. (multi)", () => {
      return command(["--ignore", TEST_PACKAGE2 + "," + TEST_PACKAGE3])
        .then(() => readPackageJson())
        .then(info => {
          assert(info.dependencies[TEST_PACKAGE1] === "^2.0.0");
          assert(info.dependencies[TEST_PACKAGE2] === "^1.0.0");
          assert(info.devDependencies[TEST_PACKAGE3] === "^1.0.0");
        })
        .then(() => readActualVersions())
        .then(versions => {
          assert(versions[TEST_PACKAGE1] === "2.0.0");
          assert(versions[TEST_PACKAGE2] === "1.0.0");
          assert(versions[TEST_PACKAGE3] === "1.0.0");
        });
    });

    it("should not update the specified packages. (all)", () => {
      return command(["--ignore", [TEST_PACKAGE1, TEST_PACKAGE2, TEST_PACKAGE3].join(",")])
        .then(() => readPackageJson())
        .then(info => {
          assert(info.dependencies[TEST_PACKAGE1] === "^1.0.0");
          assert(info.dependencies[TEST_PACKAGE2] === "^1.0.0");
          assert(info.devDependencies[TEST_PACKAGE3] === "^1.0.0");
        })
        .then(() => readActualVersions())
        .then(versions => {
          assert(versions[TEST_PACKAGE1] === "1.0.0");
          assert(versions[TEST_PACKAGE2] === "1.0.0");
          assert(versions[TEST_PACKAGE3] === "1.0.0");
        });
    });
  });

  describe("with --no-save option", () => {
    it("should update packages actually, but not rewrite package.json.", () => {
      return command(["--no-save"])
        .then(() => readPackageJson())
        .then(info => {
          assert(info.dependencies[TEST_PACKAGE1] === "^1.0.0");
          assert(info.dependencies[TEST_PACKAGE2] === "^1.0.0");
          assert(info.devDependencies[TEST_PACKAGE3] === "^1.0.0");
        })
        .then(() => readActualVersions())
        .then(versions => {
          assert(versions[TEST_PACKAGE1] === "2.0.0");
          assert(versions[TEST_PACKAGE2] === "2.0.0");
          assert(versions[TEST_PACKAGE3] === "2.0.0");
        });
    });
  });

  describe("with --no-show-changelog option", () => {
    it("should not open changelogs.", () => {
      return command(["--no-show-changelog"])
        .then(() => {
          assert(opener.calls.length === 0);
        });
    });
  });

  describe("with an unknown option", () => {
    it("should fail when an unknown option is given.", () => {
      return command(["--unknown"])
        .then(() => { throw new Error("should fail"); }, () => "OK");
    });
  });
});
