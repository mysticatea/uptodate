import {EventEmitter} from "events";
import {readPackageJson} from "./package-json";
import {getOutdated, install} from "./npm-commands";

const has = Function.call.bind(Object.prototype.hasOwnProperty);

function toNameWithVer(info) {
  return info.name + "@" + info.latest;
}

export default function uptodate(options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }

  const {
    cwd = process.cwd(),
    ignore = [],
    noSave = false
  } = options;

  const emitter = new EventEmitter();
  let deps, devDeps, packages;
  readPackageJson(cwd)
    .then(info => {
      deps = (info && info.dependencies) || {};
      devDeps = (info && info.devDependencies) || {};

      return getOutdated(ignore);
    })
    .then(_packages => {
      packages = _packages;

      // For dependencies
      const depPackages = packages.filter(pkg => has(deps, pkg.name));
      if (depPackages.length > 0) {
        emitter.emit("dependencies", depPackages);
        return install(depPackages.map(toNameWithVer), "production", noSave);
      }
    })
    .then(() => {
      // For devDependencies
      const depPackages = packages.filter(pkg => has(devDeps, pkg.name));
      if (depPackages.length > 0) {
        emitter.emit("devDependencies", depPackages);
        return install(depPackages.map(toNameWithVer), "development", noSave);
      }
    })
    .then(
      () => {
        emitter.emit("complete", packages);
        if (callback != null) {
          callback(null, packages);
        }
      },
      err => {
        emitter.emit("error", err);
        if (callback != null) {
          callback(err, null);
        }
      }
    );

  return emitter;
}
