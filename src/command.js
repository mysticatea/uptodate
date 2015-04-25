#!/usr/bin/env node

import minimist from "minimist";
import uptodate from "./";
import showChangelogs from "./show-changelogs";

function printHelp(stdout) {
  stdout.write(`
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

function printVersion(stdout) {
  stdout.write(`v${require("../package.json").version}\n`);
}

function parseIgnoreList(ignore) {
  const retv = [];

  (function parse(x) {
    if (typeof x === "string") {
      const list = x.split(",");
      retv.push(...list);
    }
    else if (Array.isArray(x)) {
      x.forEach(parse);
    }
  })(ignore);

  return retv;
}

function openChangelogs(options, stdout, callback) {
  return (err, packages) => {
    if (err != null) {
      callback(err);
      return;
    }
    if (packages.length === 0) {
      stdout.write("OK, already up-to-date!\n");
      callback(null);
      return;
    }
    if (!options.showChangelog) {
      stdout.write("DONE!\n");
      callback(null);
      return;
    }

    stdout.write("Now Opening changelogs...\n");
    showChangelogs(process.cwd(), packages.map(pkg => pkg.name))
      .then(() => {
        stdout.write("DONE!\n");
        callback(null);
      })
      .catch(callback);
  };
}

export default function main(args, metaOptions, callback) {
  const {stdout = process.stdout} = metaOptions || {};
  const unknownOptions = [];
  const options = minimist(args, {
    string: ["ignore"],
    boolean: ["help", "version", "save", "show-changelog"],
    alias: {
      "help": "h",
      "version": "v",
      "show-changelog": "showChangelog"
    },
    default: {
      "save": true,
      "show-changelog": true
    },
    unknown: arg => {
      if (arg[0] === "-") {
        unknownOptions.push(arg);
      }
    }
  });

  if (unknownOptions.length > 0) {
    callback(new Error("Unknown option(s): " + unknownOptions.join(", ")));
    return;
  }

  if (options.help) {
    printHelp(stdout);
    callback(null);
    return;
  }
  if (options.version) {
    printVersion(stdout);
    callback(null);
    return;
  }

  stdout.write("Now checking...\n");
  const emitter = uptodate(
    {
      ignore: parseIgnoreList(options.ignore),
      noSave: !options.save
    },
    openChangelogs(options, stdout, callback));

  emitter.on("dependencies", dependencies => {
    stdout.write("Update dependencies:\n");
    dependencies.forEach(pkg => {
      stdout.write(`  ${pkg.name}  ${pkg.current} --> ${pkg.latest}\n`);
    });
  });
  emitter.on("devDependencies", dependencies => {
    stdout.write("Update devDependencies:\n");
    dependencies.forEach(pkg => {
      stdout.write(`  ${pkg.name}  ${pkg.current} --> ${pkg.latest}\n`);
    });
  });
}

if (require.main === module) {
  main(process.argv.slice(2), null, err => {
    if (err) {
      console.error("ERROR:", err.message);
      process.exit(1); //eslint-disable-line no-process-exit
    }
  });
}
