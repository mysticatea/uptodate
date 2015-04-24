import {spawn} from "child_process";
import getUrl from "github-url-from-git";
import which from "which";
import Promise from "./promise";

//------------------------------------------------------------------------------
function toMap(list) {
  let map = Object.create(null);
  list.forEach(item => { map[item] = true; });
  return map;
}

//------------------------------------------------------------------------------
function whichNpm() {
  if (whichNpm.cache == null) {
    whichNpm.cache = new Promise((resolve, reject) => {
      which("npm", (err, result) => {
        if (err == null) {
          resolve(result);
        }
        else {
          reject(err);
        }
      });
    });
  }
  return whichNpm.cache;
}
whichNpm.cache = null;

//------------------------------------------------------------------------------
function execNpm(args, cwd) {
  return new Promise((resolve, reject) => {
    whichNpm()
      .then(npm => {
        var result = "";
        var cp = spawn(npm, args, {cwd});
        cp.on("exit", () => resolve(result));
        cp.on("error", reject);
        cp.stdout.setEncoding("utf8");
        cp.stdout.on("data", chunk => result += chunk);
      })
      .catch(reject);
  });
}

//------------------------------------------------------------------------------
const ROW_PATTERN = /^([a-z\-@]+)\s+(\S+)\s+(\S+)\s+(\S+)/m;
export function getOutdated(ignoreList) {
  var ignoreMap = toMap(ignoreList);
  return execNpm(["outdated", "--no-color"]).then(result => {
    let m;
    const retv = [];

    ROW_PATTERN.lastIndex = 0;
    while ((m = ROW_PATTERN.exec(result)) != null) {
      const item = {
        name: m[1],
        current: m[2],
        wanted: m[3],
        latest: m[4]
      };
      if (typeof ignoreMap[item.name] === "undefined") {
        retv.push(item);
      }
    }

    return retv;
  });
}

//------------------------------------------------------------------------------
export function install(packageNames, kind, noSave) {
  if (packageNames.length === 0) {
    return Promise.resolve(null);
  }

  // Make args
  const args = ["install"];
  if (!noSave) {
    switch (kind) {
      case "production":
        args.push("--save");
        break;
      case "dev":
      case "development":
        args.push("--save-dev");
        break;
    }
  }
  args.push.apply(args, packageNames);

  // Execute
  return execNpm(args);
}

//------------------------------------------------------------------------------
const REPO_NAME = /^https:\/\/github\.com\/(.+)$/;
export function getRepoName(packageName) {
  return execNpm(["view", packageName, "repository.url"])
    .then(repo => {
      const url = getUrl(repo);
      const m = REPO_NAME.exec(url);
      return m && m[1];
    })
    .catch(() => null);
}
