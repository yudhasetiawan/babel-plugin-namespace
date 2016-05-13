/**
 * BUILT-IN CONSTANTS
 * ==================
 */
import fs from 'fs';
import appRootPath from 'app-root-path';

let excludedPaths = [];

/**
 * Can we strip this?
 * Because travis will detect lib as the build destination directory
 */
if (process.env.BABEL_NAMESPACE_TEST_RUNNER) {
    excludedPaths = fs.readdirSync(appRootPath.path).filter((pathName) => {
        // Is it hidden file?
        if (/^(\.|src|tests)/.test(pathName)) {
            return false;
        }

        try {
            const stats = fs.statSync(appRootPath.resolve(pathName));

            return stats.isDirectory();
        } catch (err) {
            return false;
        }
    });
}

/**
 * Is it necessary?
 */
const EXCLUDES_PATH = excludedPaths.concat(['node_modules']);

/**
 * TODO:
 * - Implement the CommonJS Packages spec details a few ways that can indicate the structure
 *   of the package using a "directories" field. If you look at npm's package.json, you'll see that
 *   it has directories for doc, lib, and man.
 */
const SOURCES_PATH = [
    'src',
];

export {
    EXCLUDES_PATH,
    SOURCES_PATH,
};
