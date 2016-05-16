# babel-plugin-namespace

[![Build Status][travis-image]][travis-url] [![npm][npm-badge-version]][npm-url] [![downloads][npm-badge-dm]][npm-url]

A [babel][] plugin to enable namespacing and rewrite these namespace as an alias for directories as different directories during the Babel process.

## Description

Instead of using relative paths in your project, you'll be able to use a namespace to allow you to require a dependency in a way that is more loosely coupled to the directory structure on disk.

**Note:**

- In this plugin when say **namespace**, it's actually just a **module alias** to translate path of your module from the directory structure on disk. So please don't be **confused** with it.
- This plugin also work with `require()` function.
- If you're using [eslint-plugin-import][eslint-plugin-import], you should use [eslint-import-resolver-babel-namespace][eslint-babel-namespace] to avoid having false errors.

## Usage Instructions

### Requirements

This is a [Babel][babel] plugin so it requires Babel v6 to run.

### Installation

Install the plugin

```
$ npm install -D babel-plugin-namespace
```

### Usage

Given the directory structure:

```
app
|__ .babelrc
|__ foo
|   |__ bar
|       |__baz.js
|__ src
|   |__ models
|       |__ User.js
|   |__ controllers
|       |__ User.js
|__ package.json
```

Specify the plugin in your `.babelrc` with the custom configuration.

```json
{
  "plugins": [
    "namespace"
  ]
}
```

**In package.json:**

The most **important** things in your package.json is the *name* field

```json
{
  "name": ["my-package"]
}
```

Example:

**In src/controllers/User.js:**

```javascript
// Instead of using this;
import UserModel from '../models/User';

// Use that:
import UserModel from 'my-package/models/User';

// => resolves: '../models/User.js';
// NOTE: "my-package" is come from your package.json
```

```javascript
// Instead of using this;
import baz from '../../foo/bar/baz';

// Use that:
import baz from 'my-package/foo/bar/baz';

// => resolves: '../../foo/bar/baz.js';
// NOTE: "foo" directory is created by "includes" field from our configuration
```

If you've a very, very long package name. This plugin also supports sign expansion.

- Tilde (`~`) (*Use at your own risk*)
```javascript
import baz from '~/foo/bar/baz';

// => resolves: '../../foo/bar/baz.js';

// You can also remove the first path separator
import baz from '~foo/bar/baz';

// => resolves: '../../foo/bar/baz.js';
```

- Colon (`:`)
```javascript
import baz from ':/foo/bar/baz';

// => resolves: '../../foo/bar/baz.js';

// You can also remove the first path separator
import baz from ':foo/bar/baz';

// => resolves: '../../foo/bar/baz.js';
```

### Options

Use Babel's plugin options by replacing the plugin string with an array of the plugin name and an object with the options:

```js
{
  "plugins": [
    ["namespace", {
      "disableSync": false,
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

These options are currently available:

Field         | Type           | Default        | Description
--------------|----------------|----------------|------------
`disableSync` | `Boolean`      | `false`        | If `true`, doesn’t actually *includes* all directories in the first depth of your project root directory. See: `includes`
`sources`     | `String|Array` | `src`          | The lists of the source directory. The plugin will translate all values as a source path of the package name (e.g. Pakage name: `"my-package"`; Source Directory: `"src"`; Import Syntax: `import "my-package/foo"`; Transformed: `import "./src/foo"`).
`includes`    | `String|Array` | depth + 1      | The lists of the included directories. The plugin will translate all values as a suffix of the package name (e.g. Pakage name: `"my-package"`; Include Directory: `"tests"`; Import Syntax: `import "my-package/tests"`; Transformed: `import "./tests"`). By default this plugin will fetch all directories in the first depth of your project root directory. You may want to disable this option by changing the `disableSync` to `true`.
`excludes`    | `String|Array` | `node_modules` | Exclude all of these directories from the source map generator. This option is still *Buggy*, use at your own risk.
`namespaces`  | `Object`       | `{}`           | The keys of the `namespaces` object will be used to match against as an import statement. To use a namespace in a file, simply place the *name* of the namespace in your import statement and continue writing the path from there.

## Why use babel-plugin-namespace?

It's up to you. There's nothing wrong with the current import system. Regardless, you may still consider it useful to namespace your modules under a name of your choosing, such as `M` or `$`, freeing up those "global" modules for use without conflicts.

## License

MIT, see [LICENSE](LICENSE) for details.

[npm-badge-version]: https://img.shields.io/npm/v/babel-plugin-namespace.svg
[npm-badge-dm]: https://img.shields.io/npm/dm/babel-plugin-namespace.svg
[npm-url]: https://npmjs.com/package/babel-plugin-namespace
[travis-image]: https://travis-ci.org/yudhasetiawan/babel-plugin-namespace.svg?branch=master
[travis-url]: https://travis-ci.org/yudhasetiawan/babel-plugin-namespace
[eslint-babel-namespace]: https://npmjs.com/package/eslint-import-resolver-babel-namespace
[eslint-plugin-import]: https://npmjs.com/package/eslint-plugin-import
[babel]: https://babeljs.io
