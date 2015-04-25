import btoa from "btoa";
import open from "opener";
import {readRepositoryName} from "./package-json";
import Promise from "./promise";

const PREFIX = "https://mysticatea.github.io/uptodate/changelog-viewer/?";

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
