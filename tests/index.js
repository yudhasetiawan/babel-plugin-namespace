/**
 * TESTS RUNNER
 * ============
 */
/* eslint-env mocha */
import { expect } from 'chai';
import { transform } from 'babel-core';
import plugin from '../src';

describe('Babel plugin module alias', () => {
    const transformerOpts = {
        plugins: [
            [
                plugin, {
                    namespaces: {
                        aliasPath: 'src/path/to/alias',
                        npmAlias: 'npm:babel'
                    }
                }
            ]
        ]
    };

    describe('should replace for a known path', () => {
        describe('when requiring using the exact name as the package name', () => {
            it('should skip if not a require statement or invalid arguments', () => {
                let code = 'var aliasPath = unknownFunction("babel-plugin-namespace");';

                expect(transform(code, transformerOpts).code)
                    .to.equal('var aliasPath = unknownFunction("babel-plugin-namespace");');

                code = 'var aliasPath = require();';

                expect(transform(code, transformerOpts).code)
                    .to.equal('var aliasPath = require();');

                code = 'var aliasPath = require([]);';

                expect(transform(code, transformerOpts).code)
                    .to.equal('var aliasPath = require([]);');

                code = 'var aliasPath = require.resolve("babel-plugin-namespace");';

                expect(transform(code, transformerOpts).code)
                    .to.equal('var aliasPath = require.resolve("babel-plugin-namespace");');
            });

            it('with a require statement', () => {
                const code = 'var aliasPath = require("babel-plugin-namespace");';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('var aliasPath = require("./src");');
            });

            it('with an import statement', () => {
                const code = 'import aliasPath from "babel-plugin-namespace";';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('import aliasPath from "./src";');
            });

            it('with a default package name sign expansion (: | ~)', () => {
                const codeColon = 'import aliasPath from ":";';
                const resultColon = transform(codeColon, transformerOpts);

                expect(resultColon.code).to.equal('import aliasPath from "./src";');

                const codeTilde = 'import aliasPath from "~";';
                const resultTilde = transform(codeTilde, transformerOpts);

                expect(resultTilde.code).to.equal('import aliasPath from "./src";');
            });
        });

        describe('when requiring using the exact name as the namespace name', () => {
            it('with a require statement', () => {
                const code = 'var aliasPath = require("aliasPath");';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('var aliasPath = require("./src/path/to/alias");');
            });

            it('with an import statement', () => {
                const code = 'import aliasPath from "aliasPath";';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('import aliasPath from "./src/path/to/alias";');
            });
        });

        describe('when remapping to node modules with "npm:"', () => {
            it('with a require statement', () => {
                const code = 'var babel = require("npmAlias");';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('var babel = require("babel");');
            });

            it('with an import statement', () => {
                const code = 'import babel from "npmAlias";';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('import babel from "babel";');
            });
        });

        describe('when requiring using the exact name as the package name', () => {
            it('with a require statement', () => {
                const code = 'var aliasPath = require("babel-plugin-namespace/index");';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('var aliasPath = require("./src/index");');
            });

            it('with an import statement', () => {
                const code = 'import aliasPath from "babel-plugin-namespace/index";';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('import aliasPath from "./src/index";');
            });

            it('with a default package name sign expansion (: | ~)', () => {
                const codeColon = 'import aliasPath from ":/index";';
                const resultColon = transform(codeColon, transformerOpts);

                expect(resultColon.code).to.equal('import aliasPath from "./src/index";');

                const codeTilde = 'import aliasPath from "~/index";';
                const resultTilde = transform(codeTilde, transformerOpts);

                expect(resultTilde.code).to.equal('import aliasPath from "./src/index";');
            });

            it('with a default package name sign expansion (: | ~) without separator', () => {
                const codeColon = 'import aliasPath from ":index";';
                const resultColon = transform(codeColon, transformerOpts);

                expect(resultColon.code).to.equal('import aliasPath from "./src/index";');

                const codeTilde = 'import aliasPath from "~index";';
                const resultTilde = transform(codeTilde, transformerOpts);

                expect(resultTilde.code).to.equal('import aliasPath from "./src/index";');
            });
        });

        describe('when requiring using the exact name as the namespace name', () => {
            it('with a require statement', () => {
                const code = 'var aliasPath = require("aliasPath/foo/bar/baz");';
                const result = transform(code, transformerOpts);

                expect(result.code)
                    .to.equal('var aliasPath = require("./src/path/to/alias/foo/bar/baz");');
            });

            it('with an import statement', () => {
                const code = 'import aliasPath from "aliasPath/foo/bar/baz";';
                const result = transform(code, transformerOpts);

                expect(result.code)
                    .to.equal('import aliasPath from "./src/path/to/alias/foo/bar/baz";');
            });
        });

        describe('when requiring using the exact name as the node modules with "npm:"', () => {
            it('with a require statement', () => {
                const code = 'var aliasPath = require("npmAlias/foo/bar/baz");';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('var aliasPath = require("babel/foo/bar/baz");');
            });

            it('with an import statement', () => {
                const code = 'import aliasPath from "npmAlias/foo/bar/baz";';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('import aliasPath from "babel/foo/bar/baz";');
            });
        });
    });

    describe('should not alias for an unknown path', () => {
        describe('when requiring using the package name', () => {
            it('with a require statement', () => {
                const code = 'var module = require("babel-plugin-namespace/unknown/foo/bar/baz");';
                const result = transform(code, transformerOpts);

                expect(result.code)
                    .to.equal(
                        'var module = require("babel-plugin-namespace/unknown/foo/bar/baz");'
                    );
            });

            it('with an import statement', () => {
                const code = 'import module from "babel-plugin-namespace/unknown/foo/bar/baz";';
                const result = transform(code, transformerOpts);

                expect(result.code)
                    .to.equal('import module from "babel-plugin-namespace/unknown/foo/bar/baz";');
            });

            it('with a default package name sign expansion (: | ~)', () => {
                const codeColon = 'import module from ":/unknown/foo/bar/baz";';
                const resultColon = transform(codeColon, transformerOpts);

                expect(resultColon.code).to.equal('import module from ":/unknown/foo/bar/baz";');

                const codeTilde = 'import module from "~/unknown/foo/bar/baz";';
                const resultTilde = transform(codeTilde, transformerOpts);

                expect(resultTilde.code).to.equal('import module from "~/unknown/foo/bar/baz";');
            });

            it('with a default package name sign expansion (: | ~) without separator', () => {
                const codeColon = 'import module from ":unknown/foo/bar/baz";';
                const resultColon = transform(codeColon, transformerOpts);

                expect(resultColon.code).to.equal('import module from ":unknown/foo/bar/baz";');

                const codeTilde = 'import module from "~unknown/foo/bar/baz";';
                const resultTilde = transform(codeTilde, transformerOpts);

                expect(resultTilde.code).to.equal('import module from "~unknown/foo/bar/baz";');
            });
        });

        describe('when requiring a node module', () => {
            it('with a require statement', () => {
                const code = 'var module = require("any-node-lib");';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('var module = require("any-node-lib");');
            });

            it('with an import statement', () => {
                const code = 'import module from "any-node-lib";';
                const result = transform(code, transformerOpts);

                expect(result.code).to.equal('import module from "any-node-lib";');
            });
        });

        describe('when requiring a specific un-mapped file using relative path', () => {
            it('with a require statement', () => {
                const code = 'var module = require("./import/anything/unknown-lib");';
                const result = transform(code, transformerOpts);

                expect(result.code)
                    .to.equal('var module = require("./import/anything/unknown-lib");');
            });

            it('with an import statement', () => {
                const code = 'import module from "./import/anything/unknown-lib";';
                const result = transform(code, transformerOpts);

                expect(result.code)
                    .to.equal('import module from "./import/anything/unknown-lib";');
            });
        });

        describe('when requiring a specific un-mapped file using absolute path', () => {
            it('with a require statement', () => {
                const code = 'var module = require("/import/anything/unknown-lib");';
                const result = transform(code, transformerOpts);

                expect(result.code)
                    .to.equal('var module = require("/import/anything/unknown-lib");');
            });

            it('with an import statement', () => {
                const code = 'import module from "/import/anything/unknown-lib";';
                const result = transform(code, transformerOpts);

                expect(result.code)
                    .to.equal('import module from "/import/anything/unknown-lib";');
            });
        });
    });
});
