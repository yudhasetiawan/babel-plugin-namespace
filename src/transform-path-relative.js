/**
 * RELATIVE PATH TRANSFORM
 * =======================
 */
import path from 'path';
import debugInstance from 'debug';
import { resolve, resolveCwd } from './utils';

const debug = debugInstance('babel:plugin:namespace:transform-path-relative');

/**
 * Returns the relative path
 *
 * @param {String} currentFile
 * @param {String} module
 *
 * @return {String}
 */
const pathToRelative = (currentFile = '', module) => {
    /**
     * babel uses 'unknown' as a special value for filename when the transformed source can't be
     * traced to a file (e.g., transformed string)
     *
     * @link https://github.com/babel/babel/blob/d2e7e6a/packages/babel-core/src/transformation/file/options/config.js
     */
    if (currentFile && currentFile === 'unknown') {
        debug('Warning: missing source path.');
    }

    // Support npm modules instead of directories
    if (/^(npm:)/.test(module)) {
        const [, npmModuleName] = module.split('npm:');

        debug('The current file is npm modules: "%s"', npmModuleName);

        return npmModuleName;
    }

    const sourceDir = resolveCwd(path.dirname(currentFile));
    const modulePath = resolve(path.normalize(module));
    let moduleMapped = path.relative(sourceDir, modulePath);

    debug('Convert the current file to relative: "%s" (%s)', sourceDir, modulePath);

    if (!/^\./.test(moduleMapped)) {
        moduleMapped = `./${moduleMapped}`;
    }

    debug('The relative path of the current file is: "%s"', moduleMapped);

    return moduleMapped;
};

export default pathToRelative;
