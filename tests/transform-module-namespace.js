/**
 * TESTS RUNNER: NAMESPACE TRANSFORM
 * =================================
 */
/* eslint-env mocha */
import { expect } from 'chai';
import { transformModuleNamespace, generateSourceMaps } from '../src';

describe('Babel plugin module alias', () => {
    describe('can transform the module namespace', () => {
        it('should skip if the path is relative or absolute', () => {
            expect(transformModuleNamespace('./', __filename, {})).to.equal(null);
        });

        it('should skip for an unknown path', () => {
            expect(transformModuleNamespace('unknown-lib', __filename, generateSourceMaps()))
                .to.equal(null);
            expect(transformModuleNamespace(
                'unknown-lib/foo/bar', __filename, generateSourceMaps()
            )).to.equal(null);
        });

        it('should replace for a known path', () => {
            expect(transformModuleNamespace(
                'babel-plugin-namespace', __filename, generateSourceMaps()
            )).to.equal('../src');
        });

        it('should replace when using sign expansion (: | ~)', () => {
            expect(transformModuleNamespace(':', __filename, generateSourceMaps()))
                .to.equal('../src');
            expect(transformModuleNamespace('~', __filename, generateSourceMaps()))
                .to.equal('../src');
        });

        it('should replace when using the exact name as the alias name', () => {
            expect(transformModuleNamespace(
                'babel-plugin-namespace/index', __filename, generateSourceMaps()
            )).to.equal('../src/index');
        });
    });
});
