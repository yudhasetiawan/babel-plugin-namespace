/**
 * TESTS RUNNER: RELATIVE PATH TRANSFORM
 * =====================================
 */
/* eslint-env mocha */
import path from 'path';
import { expect } from 'chai';
import { pathToRelative } from '../src';

describe('Babel plugin module alias', () => {
    describe('can convert path to relative by the reference path', () => {
        it('should strip the (npm:) prefix', () => {
            expect(pathToRelative('./', 'npm:mod')).to.equal('mod');
        });

        it('should translate the module path to the reference path', () => {
            expect(pathToRelative('src/index', 'src/index')).to.equal('./index');
            expect(pathToRelative(__filename, 'src/index')).to.equal('../src/index');
            expect(pathToRelative(path.join(__filename, 'anything/path'), 'src/index'))
                .to.equal('../../../src/index');
        });
    });

    describe('can convert path to relative when current working directory changed', () => {
        const cwd = process.cwd();

        before(() => {
            process.chdir('./tests');
        });

        after(() => {
            process.chdir(cwd);
        });

        it('with relative filename', () => {
            // PROJECT_ROOT/tests/src/anything/file.js
            const currentFile = './src/anything/file.js';
            // PROJECT_ROOT/src/lib
            const result = pathToRelative(currentFile, 'src/lib');

            expect(result).to.equal('../../../src/lib');
        });

        it('with absolute filename', () => {
            // PROJECT_ROOT/tests/src/anything/file.js
            const currentFileFirst = path.join(process.cwd(), './src/anything/file.js');
            // PROJECT_ROOT/src/lib
            const resultFirst = pathToRelative(currentFileFirst, 'src/lib');

            expect(resultFirst).to.equal('../../../src/lib');

            // PROJECT_ROOT/tests/src/anything/foo/bar.js
            const currentFileSecond = './src/anything/foo/bar.js';
            // PROJECT_ROOT/tests/src/lib
            const resultSecond = pathToRelative(
                currentFileSecond, path.join(process.cwd(), 'src/lib')
            );

            expect(resultSecond).to.equal('../../lib');

            // PROJECT_ROOT/tests/src/anything/foo/bar/baz.js
            const currentFileThree = path.join(process.cwd(), './src/anything/foo/bar/baz.js');
            // PROJECT_ROOT/src/lib
            const resultThree = pathToRelative(
                currentFileThree, path.join(process.cwd(), 'src/lib')
            );

            expect(resultThree).to.equal('../../../lib');
        });
    });
});
