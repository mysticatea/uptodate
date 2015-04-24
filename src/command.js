import minimist from "minimist";
import uptodate from "./";
import showChangelogs from "./show-changelogs";

function printHelp() {
  console.log(`
Usage: uptodate [OPTIONS]

  It opens package.json and check its dependencies/devDependencies.
  If there are out-dated packages, it updates them and rewrite the package.json.

Options:
  -h, --help            Print this text.
  -v, --version         Print the version number.
  --ignore <NAMES>      Ignore package names (comma separated).
  --no-save             Don't rewrite package.json
  --no-show-changelog   Don't show changelogs on your default browser.

See Also: https://github.com/mysticatea/uptodate
`);
}

function printVersion() {
  console.log("v" + require("../package.json"));
}

function openChangelogs(options, callback) {
  return packages => {
    if (packages.length === 0) {
      console.log("OK, already up-to-date!");
      callback(null);
      return;
    }
    if (options.noShowChangelog) {
      console.log("DONE!");
      callback(null);
      return;
    }

    showChangelogs(packages.map(pkg => pkg.name))
      .then(() => {
        console.log("DONE!");
        callback(null);
      })
      .catch(callback);
  };
}

export default function main(args, callback) {
  const unknownOptions = [];
  const options = minimist(args, {
    string: ["ignore"],
    boolean: ["help", "version", "no-save", "no-show-changelog"],
    alias: {"help": "h", "version": "v"},
    unknown: arg => {
      if (arg[0] === "-") {
        unknownOptions.push(arg);
      }
    }
  });

  if (options.help || options._.length === 0) {
    printHelp();
    callback(null);
    return;
  }
  if (options.version) {
    printVersion();
    callback(null);
    return;
  }

  uptodate(options)
    .on("dependencies", dependencies => {
      console.log("Update dependencies:");
      dependencies.forEach(pkg => {
        console.log(`  ${pkg.name}  ${pkg.current} --> ${pkg.latest}`);
      });
    })
    .on("devDependencies", dependencies => {
      console.log("Update devDependencies:");
      dependencies.forEach(pkg => {
        console.log(`  ${pkg.name}  ${pkg.current} --> ${pkg.latest}`);
      });
    })
    .on("error", callback)
    .on("compete", openChangelogs(options, callback));
}

if (require.main === module) {
  main(process.args.slice(2), err => {
    if (err) {
      console.error("ERROR:", err.message);
      process.exit(1); //eslint-disable-line no-process-exit
    }
  });
}
