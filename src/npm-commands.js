import {spawn} from "child_process";
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
        let buf = "";
        const cp = spawn(npm, args, {cwd, stdio: ["ignore", "pipe", "ignore"]});
        cp.on("exit", code => {
          if (code === 0) {
            resolve(buf);
          }
          else {
            reject(new Error(`non-zero exit(${code})`));
          }
        });
        cp.on("error", reject);
        cp.stdout.on("data", chunk => buf += chunk.toString());
      })
      .catch(reject);
  });
}

//------------------------------------------------------------------------------
const ROW_PATTERN = /^([a-z0-9\-@\/]+)\s+([a-zA-Z0-9\.\-\+]+)\s+([a-zA-Z0-9\.\-\+]+)\s+([a-zA-Z0-9\.\-\+]+)/mg;
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

    retv.sort((a, b) =>
      a.name < b.name ? -1 :
      a.name > b.name ? +1 :
      /* otherwise */ 0
    );
    return retv;
  });
}

//------------------------------------------------------------------------------
export function install(packageNames, kind = "production", noSave = false) {
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
      case "development":
      case "dev":
        args.push("--save-dev");
        break;
    }
  }
  args.push.apply(args, packageNames);

  // Execute
  return execNpm(args);
}
