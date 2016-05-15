# babel-plugin-namespace (WIP)

[![Build Status][travis-image]][travis-url] [![npm][npm-badge-version]][npm-url] [![downloads][npm-badge-dm]][npm-url]

> **WIP:** I'll try to remove this flag as soon as possible. :ok_hand:

> So keep your eyes open, please! :see_no_evil:

A [babel](http://babeljs.io) plugin to enable namespacing and rewrite these namespace as an alias for directories as different directories during the Babel process.

## Description

Instead of using relative paths in your project, you'll be able to use a namespace. Here an simple example:

**Be Carefull:** This plugin also work with `require()` function.

## Installation

Install the plugin

```
$ npm install -D babel-plugin-namespace
```

Specify the plugin in your `.babelrc` with the custom mapping.
```json
{
  "plugins": [
    ["namespace", {
      "sources": [
        "src"
      ],
      "includes": [
        "foo"
      ],
      "excludes": [
        "node_modules"
      ],
      "namespaces": {
        "test": "tests",
        "foo/bar/baz": "path/to/foo/bar/baz",
      }
    }]
  ]
}
```

If you're using [eslint-plugin-import][eslint-plugin-import], you should use [eslint-import-resolver-babel-namespace][eslint-babel-namespace] to avoid having false errors.

## Usage

Given the directory structure:

```
/root
  .babelrc
  /foo
    /bar
      baz.js
  /src
    /models
      User.js
    /controllers
      User.js
  package.json
```

**In package.json:**

*The most important things in your package.json is the name field*

```json
{
  "name": ["my-package-name"]
}
```

**In .babelrc:**

```json
{
  "presets": ["es2015"],
  "plugins": [
    "namespace"
  ]
}
```

**In src/controllers/User.js:**

```javascript
// Instead of using this;
import UserModel from '../models/User';
// Use that:
import UserModel from 'my-package-name/models/User';
// => resolves: '../models/User.js';
// NOTE: "my-package-name" is come from your package.json
```

```javascript
// Instead of using this;
import baz from '../../foo/bar/baz';
// Use that:
import baz from 'my-package-name/foo/bar/baz';
// => resolves: '../../foo/bar/baz.js';
// NOTE: "foo" directory is created by "includes" field from our configuration
```

## License

MIT, see [LICENSE](LICENSE) for details.

[npm-badge-version]: https://img.shields.io/npm/v/babel-plugin-namespace.svg
[npm-badge-dm]: https://img.shields.io/npm/dm/babel-plugin-namespace.svg
[npm-url]: https://npmjs.com/package/babel-plugin-namespace
[travis-image]: https://travis-ci.org/yudhasetiawan/babel-plugin-namespace.svg?branch=master
[travis-url]: https://travis-ci.org/yudhasetiawan/babel-plugin-namespace
[eslint-babel-namespace]: https://npmjs.com/package/eslint-import-resolver-babel-namespace
[eslint-plugin-import]: https://npmjs.com/package/eslint-plugin-import
