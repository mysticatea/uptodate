# uptodate

[![Build Status](https://travis-ci.org/mysticatea/uptodate.svg?branch=master)](https://travis-ci.org/mysticatea/uptodate)
[![Coverage Status](https://coveralls.io/repos/mysticatea/uptodate/badge.svg?branch=master)](https://coveralls.io/r/mysticatea/uptodate?branch=master)
[![npm version](https://badge.fury.io/js/uptodate.svg)](http://badge.fury.io/js/uptodate)

A CLI tool to update dependencies in your package.json.

- This tool rewrites package.json.
- This tool shows changelog of updated dependent modules after update.

## Installation

```
npm install -g uptodate
```

## Usage

```
Usage: uptodate [OPTIONS]

  It opens package.json and check its dependencies/devDependencies.
  If there are out-dated packages, it updates them and rewrite the package.json.

Options:
  -h, --help            Print this text.
  -v, --version         Print the version number.
  --ignore <NAMES>      Ignore package names (comma separated).
  --no-save             Don't rewrite package.json
  --no-show-changelog   Don't show changelogs on your default browser.
```

## Example

```
uptodate
```

```
uptodate --ignore foo,bar,yay --no-show-changelog
```

## Node API

```
var uptodate = require("uptodate");
```

### uptodate(options, callback)

Do the process as same as `uptodate` command.

* **options** `object` -- Optional.
  * **cwd** `string` -- A directory path. This opens package.json of here.
    By default, `process.cwd()`.
  * **options.ignore** `string[]` -- Package names. This ignores the packages
    even if is out-dated.
  * **options.noSave** `boolean` -- A flag that to not rewrite package.json.
* **callback** `(err: Error|null, result: object|null) => void` -- Optional.
  A callback that will be called at done.
  `err` is not `null` if failed.
  `result` is an object. Its keys are the updated package names. Its each value
  is an instance of
  `{oldVersion: string, newVersion: string, changelogUri: string}`.
