# uptodate

[![Join the chat at https://gitter.im/mysticatea/uptodate](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mysticatea/uptodate?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/mysticatea/uptodate.svg?branch=master)](https://travis-ci.org/mysticatea/uptodate)
[![Coverage Status](https://coveralls.io/repos/mysticatea/uptodate/badge.svg?branch=master)](https://coveralls.io/r/mysticatea/uptodate?branch=master)
[![npm version](https://badge.fury.io/js/uptodate.svg)](http://badge.fury.io/js/uptodate)

A CLI tool to update dependencies in your package.json.

## Installation

```
npm install -g uptodate
```

## Usage

```
Usage: uptodate [OPTIONS]

  It opens a package.json and checks its dependencies/devDependencies.
  If there are out-dated packages, it updates them and rewrites the package.json
  Lastly, it takes changelogs from GitHub if is possible, and shows summary of
  them in a browser.

Options:
  -h, --help            Print this text.
  -v, --version         Print the version number.
  --ignore <NAMES>      Ignore package names (comma separated).
  --no-save             Don't rewrite package.json.
  --no-show-changelog   Don't show changelogs in a browser.
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

It opens a package.json and checks its dependencies/devDependencies.
If there are out-dated packages, it updates them and rewrites the package.json.

- **options** `object` -- Optional.
  - **options.cwd** `string` -- A directory path. This opens package.json of here.
    By default, `process.cwd()`.
  - **options.ignore** `string[]` -- Package names. This ignores the packages
    even if is out-dated.
  - **options.noSave** `boolean` -- A flag that to not rewrite package.json.
- **callback** `(err: Error|null, result: object[]|null) => void` -- Optional.
  A callback that will be called at done.
  `err` is not `null` if failed.
  `result` is an array. Its each value is an instance of
  `{name: string, current: string, latest: string}`.
  - `name` is the package name.
  - `current` is a version text before updating.
  - `latest` is a version text after updating probably.
