/**
 * NAMESPACE TRANSFORM
 * ===================
 */
import path from 'path';
import debugInstance from 'debug';
import pathToRelative from './transform-path-relative';
import { getPackageConfig, isPathExists } from './utils';

const debug = debugInstance('babel:plugin:namespace:transform-namespace');

/**
 * Translate the module namespace
 *
 * @param {String} sourceModule
 * @param {String} sourceFile
 * @param {Object} filesMap
 *
 * @return {String}
 */
const transformModuleNamespace = (sourceModule, sourceFile, filesMap) => {
    // should skip if the path is relative or absolute
    if (sourceModule && (path.isAbsolute(sourceModule) || /^(\.)/.test(sourceModule))) {
        return null;
    }

    const packageConfig = getPackageConfig();

    // TODO: Replace with "signDirectoryExpansion"
    if (/^(:|~)/.test(sourceModule)) {
        sourceModule = path.join( // eslint-disable-line no-param-reassign
            packageConfig.name, sourceModule.substr(1)
        );
    }

    const moduleSplit = sourceModule.split('/');
    let sourceModulePath;

    if (!moduleSplit.length) {
        return null;
    }

    debug('Start to map a module alias: "%s"', sourceModule);

    /**
     * This loop will check the sources map in reverse mode
     */
    while (moduleSplit.length) {
        const module = moduleSplit.join('/');

        if (filesMap.hasOwnProperty(module)) {
            sourceModulePath = filesMap[module];

            break;
        }

        moduleSplit.pop();
    }

    // No mapping available
    if (!moduleSplit.length || !sourceModulePath) {
        debug('Module alias not found: "%s"', sourceModule);

        return null;
    }

    let modulePath = moduleSplit.join('/');

    if (Array.isArray(sourceModulePath)) {
        let isPathFound = false;

        sourceModulePath.forEach((sourcePath) => {
            const newPath = sourceModule.replace(modulePath, sourcePath);

            if (isPathExists(sourcePath) && isPathExists(newPath)) {
                modulePath = newPath;
                isPathFound = true;

                return;
            }
        });

        if (!isPathFound) {
            debug('Module: "%s" (not be found)', sourceModule);

            return null;
        }
    } else {
        modulePath = sourceModule.replace(modulePath, sourceModulePath);
    }

    debug('Module alias: "%s" ("%s")', sourceModule, modulePath);

    return pathToRelative(sourceFile, modulePath);
};

export default transformModuleNamespace;
