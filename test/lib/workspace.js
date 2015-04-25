import {readFile, writeFile} from "fs";
import {join} from "path";
import mkdirp from "mkdirp";
import rimraf from "rimraf";
import assert from "power-assert";
import {install} from "../../src/npm-commands";
import Promise from "../../src/promise";

export const TEST_PACKAGE1 = "@mysticatea/uptodate-test-package1";
export const TEST_PACKAGE2 = "@mysticatea/uptodate-test-package2";
export const TEST_PACKAGE3 = "@mysticatea/uptodate-test-package3";

const DEFAULT_CWD = join(__dirname, "../../");
const WS_DIR = join(__dirname, "../../test-ws/");
const PKG_JSON = join(WS_DIR, "package.json");

function makeWorkspaceDir(n = 32) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      mkdirp(WS_DIR, err => {
        if (err) {
          if (n > 0) {
            makeWorkspaceDir(n - 1).then(resolve, reject);
          }
          else {
            reject(err);
          }
        }
        else {
          resolve();
        }
      });
    }, 100);
  });
}

function removeWorkspaceDir(n = 32) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      rimraf(WS_DIR, err => {
        if (err) {
          if (n > 0) {
            removeWorkspaceDir(n - 1).then(resolve, reject);
          }
          else {
            reject(err);
          }
        }
        else {
          resolve();
        }
      });
    }, 100);
  });
}

function writePackageJson(value) {
  return new Promise((resolve, reject) => {
    try {
      writeFile(
        PKG_JSON,
        JSON.stringify(value, null, 2),
        err => err ? reject(err) : resolve());
    }
    catch (err) {
      reject(err);
    }
  });
}

export function readPackageJson(path = PKG_JSON) {
  return new Promise((resolve, reject) => {
    readFile(
      path,
      {encoding: "utf8"},
      (err, value) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          resolve(JSON.parse(value));
        }
        catch (err2) {
          reject(err2);
        }
      });
  });
}

function readActualVersion(packageName) {
  return readPackageJson(
      join(WS_DIR, "node_modules", packageName, "package.json")
    )
    .then(info => info.version);
}

export function readActualVersions() {
  return Promise.all([
      readActualVersion(TEST_PACKAGE1),
      readActualVersion(TEST_PACKAGE2),
      readActualVersion(TEST_PACKAGE3)
    ])
    .then(function(versions) {
      return {
        [TEST_PACKAGE1]: versions[0],
        [TEST_PACKAGE2]: versions[1],
        [TEST_PACKAGE3]: versions[2]
      };
    });
}

export function setupWorkspace() {
  return makeWorkspaceDir()
    .then(() => {
      process.chdir(WS_DIR);
      return writePackageJson({name: "test", private: true});
    })
    .then(() => {
      return install([TEST_PACKAGE1 + "@1.0.0", TEST_PACKAGE2 + "@1.0.0"]);
    })
    .then(() => {
      return install([TEST_PACKAGE3 + "@1.0.0"], "development");
    })
    .then(() => {
      return readPackageJson();
    })
    .then(info => {
      assert.deepEqual(info, {
        name: "test",
        private: true,
        dependencies: {
          [TEST_PACKAGE1]: "^1.0.0",
          [TEST_PACKAGE2]: "^1.0.0"
        },
        devDependencies: {
          [TEST_PACKAGE3]: "^1.0.0"
        }
      });
      return readActualVersions();
    })
    .then(versions => {
      assert.deepEqual(versions, {
        [TEST_PACKAGE1]: "1.0.0",
        [TEST_PACKAGE2]: "1.0.0",
        [TEST_PACKAGE3]: "1.0.0"
      });
    });
}

export function teardownWorkspace() {
  process.chdir(DEFAULT_CWD);
  return removeWorkspaceDir();
}
