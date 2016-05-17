/**
 * SOURCE MAP GENERATOR
 * ====================
 */
import fs from 'fs';
import debugInstance from 'debug';
import appRootPath from 'app-root-path';
import { concat, isArray, isString } from 'lodash';
import { getPackageConfig, splitFlatPath, resolve } from './utils';
import { SOURCES_PATH, EXCLUDES_PATH } from './constants';

const debug = debugInstance('babel:plugin:namespace:generate-source-maps');

/**
 * Returns the generated source maps.
 *
 * @param {Object} options The babel state options
 *
 * @return {Object}
 */
const generateSourceMaps = (options = {}) => {
    const patternSeparator = /[,\s]/;
    const results = {};
    const packageConfig = getPackageConfig();
    const { namespaces } = options;
    const namespacePaths = [];
    const { disableSync = false } = options;
    let { includes = [], sources = SOURCES_PATH || [], excludes = [] } = options;

    debug('Start to create a file map');

    // Specially for the package name we use an array
    if (isString(sources)) {
        sources = sources.split(patternSeparator).filter((pathName) => !!pathName);
    }

    if (isString(includes)) {
        includes = includes.split(patternSeparator).filter((pathName) => !!pathName);
    }

    if (isString(excludes)) {
        excludes = excludes.split(patternSeparator).filter((pathName) => !!pathName);
    }

    excludes = splitFlatPath(concat(excludes, EXCLUDES_PATH));
    includes = splitFlatPath(includes.filter((pathName) => excludes.indexOf(pathName) === -1));
    sources = splitFlatPath(
        sources.filter((pathName) => excludes.indexOf(pathName) === -1
            && includes.indexOf(pathName) === -1)
    );

    if (namespaces) {
        for (const namespace in namespaces) {
            if (!namespaces.hasOwnProperty(namespace)) {
                continue;
            }

            const namespacePath = namespaces[namespace];

            if (!namespacePath) {
                continue;
            }

            if (isArray(namespacePath)) {
                process.stdout.write('Warning: A namespace must be a string');

                continue;
            }

            const sourcesIndexPath = sources.indexOf(namespacePath);

            // We have duplicate pathname. So let's remove them from sources path
            if (sourcesIndexPath >= 0) {
                sources.splice(sourcesIndexPath, 1);
            }

            namespacePaths.push(namespacePath);

            results[namespace] = namespacePath;
        }
    }

    if (!includes.length && !disableSync) {
        debug(
            'The options does not provided included paths. Start to map the directory: %s',
            appRootPath
        );

        includes = fs.readdirSync(resolve()).filter((pathName) => {
            // Is it hidden file?
            if (/^\./.test(pathName)) {
                return false;
            }

            // This is has been registered as the sources path. Skip it
            if (sources.indexOf(pathName) >= 0) {
                return false;
            }

            // This is has been registered as the namespace path. Skip it
            if (namespacePaths.indexOf(pathName) >= 0) {
                return false;
            }

            try {
                const stats = fs.statSync(resolve(pathName));

                return stats.isDirectory();
            } catch (err) {
                return false;
            }
        });
    }

    includes.forEach((pathName) => {
        if (excludes.indexOf(pathName) === -1 && namespacePaths.indexOf(pathName) === -1) {
            const namespace = `${packageConfig.name}/${pathName}`;

            results[namespace] = pathName;
        } else {
            debug('The directory "%s" is not in whitelists', pathName);
        }
    });

    if (sources.length) {
        results[packageConfig.name] = sources;
    }

    const sourceMaps = {};

    // Clean up the source maps and make them as absolute path
    for (const namespace in results) {
        if (!results.hasOwnProperty(namespace)) {
            continue;
        }

        let sourceMapPath = results[namespace];

        if (!isArray(sourceMapPath)) {
            sourceMapPath = resolve(sourceMapPath);
        } else {
            sourceMapPath = sourceMapPath.map((pathName) => resolve(pathName));
        }

        sourceMaps[namespace] = sourceMapPath;
    }

    debug('The file map has been created: ', sourceMaps);

    return sourceMaps;
};

export default generateSourceMaps;
