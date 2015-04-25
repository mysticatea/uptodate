import btoa from "btoa";
import open from "opener";
import {join} from "path";
import {readRepositoryName} from "./package-json";
import Promise from "./promise";

const PREFIX = `file://${join(__dirname, "./view.html")}?`;

export default function showChangelogs(cwd, packageNames) {
  const repoNamePromises = packageNames.map(name =>
    readRepositoryName(cwd, name).then(repo =>
      encodeURIComponent(repo ? `${name}:${repo}` : name))
  );
  return Promise.all(repoNamePromises)
    .then(names => {
      return new Promise((resolve, reject) => {
        open(
          PREFIX + btoa(names.join(",")),
          {detached: true, stdio: "ignore"},
          err => err ? reject(err) : resolve()
        );
      });
    });
}
