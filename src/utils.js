/**
 * UTILITIES
 * =========
 */
import fs from 'fs';
import path from 'path';
import debugInstance from 'debug';
import appRootPath from 'app-root-path';

const debug = debugInstance('babel:plugin:namespace:helper');

/**
 * TODO:
 * - Implement this logic to "transformModuleNamespace" function
 * - Implement the CommonJS Packages spec details a few ways that you can indicate the structure
 *   of the package using a "directories" object. If you look at npm's package.json, you'll see
 *   that it has directories for doc, lib, and man.
 *
 * We can always use / as a path separator, even on Windows.
 * @link http://bytes.com/forum/thread23123.html
 *
 * Blacklists sign:
 * - @ => @see https://docs.npmjs.com/misc/scope
 *
 * sign => ~
 *
 * - (~) will translate to PROJECT_SOURCE
 * - (~/) will translate to PROJECT_ROOT
 * - (~/foo) will translate to PROJECT_ROOT/foo
 * - (~me/foo) will translate to The subdirectory me/foo of the PROJECT_SOURCE (PROJECT_SOURCE/foo)
 *
 * @link http://www.gnu.org/software/bash/manual/html_node/Tilde-Expansion.html
 *
 * @param {String} value The path to translate
 * @param {String} parentDirectory The parent directory of the given path
 * @param {String} sign The sign symbol
 *
 * @return {String}
 */
/* istanbul ignore next: not yet :) */
const signDirectoryExpansion = (value, parentDirectory, sign = '~') => {
    if (!value) {
        return null;
    }

    // @see https://docs.npmjs.com/misc/scope
    if (/^(@)/.test(sign)) {
        return null;
    }

    if (value[0] !== sign) {
        return null;
    }

    value = value.substr(1); // eslint-disable-line no-param-reassign

    if (/^\//.test(value)) {
        return path.join(appRootPath, value);
    }

    return path.join(parentDirectory, value);
};

/**
 * Resolve the given filename to current project root directory
 *
 * @param {String} filename The filename to resolve
 *
 * @return {String}
 */
const resolve = (filename = '') => {
    // Support npm modules instead of directories
    if (/^(npm:)/.test(filename)) {
        return filename;
    }

    if (filename && path.isAbsolute(filename)) {
        debug('The filename is absolute: %', filename);

        return filename;
    }

    const resolveFilename = appRootPath.resolve(filename);

    return resolveFilename;
};

/**
 * Resolve the given filename to current working directory
 *
 * @param {String} filename The filename to resolve
 *
 * @return {String}
 */
const resolveCwd = (filename = '') => {
    // Support npm modules instead of directories
    /* istanbul ignore if: ??? */
    if (/^(npm:)/.test(filename)) {
        return filename;
    }

    if (filename && path.isAbsolute(filename)) {
        debug('The filename is absolute: %', filename);

        return filename;
    }

    const resolveFilename = path.resolve(process.cwd(), filename);

    return resolveFilename;
};

/**
 * Returns the package configuration
 *
 * @return {Object}
 */
const getPackageConfig = () => {
    let packageConfig;

    try {
        packageConfig = require(resolve('package.json')); // eslint-disable-line global-require
    } catch (e) {
        /* istanbul ignore next */
        packageConfig = {};
    }

    return packageConfig;
};

/**
 *
 *
 * @param {Array} directories The directory lists
 *
 * @return {Array}
 */
const splitFlatPath = (directories = []) => {
    const results = directories
        .filter((pathName) => pathName && pathName.length > 0)
        .map((pathName) => pathName.split(path.delimiter));

    return [].concat.apply([], results);
};

/**
 * Indicates whether the given path is exists
 *
 * @param {String} sourcePath The path to check
 *
 * @return {String}
 */
const isPathExists = (sourcePath) => {
    try {
        const stats = fs.statSync(resolve(sourcePath));

        return stats.isFile() || stats.isDirectory();
    } catch (error) {
        const basename = path.basename(sourcePath);

        try {
            return fs.readdirSync(path.dirname(sourcePath))
                .filter((pathName) => pathName.indexOf(basename) >= 0)
                .length > 0;
        } catch (errorStack) {
            return false;
        }
    }
};

export {
    signDirectoryExpansion,
    resolve,
    resolveCwd,
    getPackageConfig,
    splitFlatPath,
    isPathExists,
};
