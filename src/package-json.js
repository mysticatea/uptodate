import {readFile} from "fs";
import {join} from "path";
import getGitHubUrl from "github-url-from-git";
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

const REPO_NAME = /^https:\/\/github\.com\/(.+)$/;
export function readRepositoryName(cwd, packageName) {
  return readPackageJson(join(cwd, "node_modules", packageName))
    .then(info => {
      const repository = info && info.repository;
      const gitUrl = repository && repository.url;
      const githubUrl = gitUrl && getGitHubUrl(gitUrl);
      const m = githubUrl && REPO_NAME.exec(githubUrl);
      return m && m[1];
    })
    .catch(() => {
      return null;
    });
}
