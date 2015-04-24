import {readFile} from "fs";
import {join} from "path";
import Promise from "./promise";

export function readPackageJson(cwd) {
  return new Promise((resolve, reject) => {
    const filePath = join(cwd, "package.json");

    readFile(filePath, {encoding: "utf8"}, (err, data) => {
      if (err != null) {
        reject(err);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(data);
      }
      catch (err2) {
        reject(err2);
        return;
      }

      resolve(parsed);
    });
  });
}
