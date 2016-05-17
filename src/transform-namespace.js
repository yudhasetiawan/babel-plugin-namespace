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
    if (!sourceModule) {
        return null;
    }

    let module = path.normalize(sourceModule);

    // should skip if the path is relative or absolute
    if (path.isAbsolute(module) || /^(\.)/.test(module)) {
        return null;
    }

    const packageConfig = getPackageConfig();

    // TODO: Replace with "signDirectoryExpansion"
    if (/^(:|~)/.test(module)) {
        module = path.join(packageConfig.name, module.substr(1));
    }

    const moduleSplit = module.split('/');
    let sourceModulePath;

    debug('Start to map a module alias: "%s"', module);

    /**
     * This loop will check the sources map in reverse mode
     */
    while (moduleSplit.length) {
        const part = moduleSplit.join('/');

        if (filesMap.hasOwnProperty(part)) {
            sourceModulePath = filesMap[part];

            break;
        }

        moduleSplit.pop();
    }

    // No mapping available
    if (!moduleSplit.length || !sourceModulePath) {
        debug('Module alias not found: "%s"', module);

        return null;
    }

    let modulePath = moduleSplit.join('/');

    if (Array.isArray(sourceModulePath)) {
        let isPathFound = false;

        sourceModulePath.forEach((sourcePath) => {
            const newPath = module.replace(modulePath, sourcePath);

            if (isPathExists(sourcePath) && isPathExists(newPath)) {
                modulePath = newPath;
                isPathFound = true;

                return;
            }
        });

        if (!isPathFound) {
            debug('Module: "%s" (not be found)', module);

            return null;
        }
    } else {
        modulePath = module.replace(modulePath, sourceModulePath);
    }

    debug('Module alias: "%s" ("%s")', module, modulePath);

    return pathToRelative(sourceFile, modulePath);
};

export default transformModuleNamespace;
