/**
 * TESTS RUNNER: SOURCE MAP GENERATOR
 * ==================================
 */
/* eslint-env mocha */
import appRootPath from 'app-root-path';
import { assert } from 'chai';
import generateSourceMaps from '../src/generate-source-maps';

describe('Babel plugin module alias', () => {
    describe('can generate the source maps', () => {
        it('should not empty if the options is not provided', () => {
            const sourceMaps = generateSourceMaps();

            assert.deepEqual(sourceMaps, {
                'babel-plugin-namespace': [
                    appRootPath.resolve('src')
                ],
                'babel-plugin-namespace/tests': appRootPath.resolve('tests'),
            });
        });

        it('should support comma and single space as a separator of string options', () => {
            const sourceMaps = generateSourceMaps({
                sources: 'node_modules',
                includes: 'any  multiple-spaces,,, multiple-commas and-last,,   ,, ,,',
                excludes: 'any  ex-multiple-spaces,,, ex-multiple-commas and-last,,   ,, ,,'
            });

            assert.deepEqual(sourceMaps, {
                'babel-plugin-namespace/multiple-spaces': appRootPath
                    .resolve('multiple-spaces'),
                'babel-plugin-namespace/multiple-commas': appRootPath
                    .resolve('multiple-commas'),
            });
        });

        it('should will automatic exclude the given directory from the lists', () => {
            const sourceMaps = generateSourceMaps({
                sources: 'node_modules',
                includes: 'node_modules'
            });

            assert.deepEqual(sourceMaps, {
                'babel-plugin-namespace/src': appRootPath.resolve('src'),
                'babel-plugin-namespace/tests': appRootPath.resolve('tests'),
            });
        });

        it('should overide default sources directory', () => {
            const sourceMaps = generateSourceMaps({
                sources: 'sources/directory'
            });

            assert.deepEqual(sourceMaps, {
                'babel-plugin-namespace': [
                    appRootPath.resolve('sources/directory')
                ],
                'babel-plugin-namespace/src': appRootPath.resolve('src'),
                'babel-plugin-namespace/tests': appRootPath.resolve('tests'),
            });
        });

        it('should remove the sources directory if the namespace has the same path', () => {
            const sourceMaps = generateSourceMaps({
                sources: 'sources/directory',
                namespaces: {
                    npm: 'sources/directory',
                }
            });

            assert.deepEqual(sourceMaps, {
                'babel-plugin-namespace/src': appRootPath.resolve('src'),
                'babel-plugin-namespace/tests': appRootPath.resolve('tests'),
                npm: appRootPath.resolve('sources/directory'),
            });
        });
    });
});
