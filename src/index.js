/**
 * This source file is part of my personal project.
 *
 * This source code license can be found in the LICENSE file in the root directory of this
 * source tree.
 *
 * @author    Yudha Setiawan <me@yudhasetiawan.com>
 * @link      http://yudhasetiawan.com
 * @copyright Copyright (c) 2016, Yudha Setiawan.
 */
import debugInstance from 'debug';
import generateSourceMaps from './generate-source-maps';
import transformModuleNamespace from './transform-namespace';

const debug = debugInstance('babel:plugin:namespace');

export default ({ types: t }) => {
    const isRequireCall = (node) => {
        /* istanbul ignore if */
        if (!t.isCallExpression(node)) {
            return false;
        }

        if (!t.isIdentifier(node.callee, { name: 'require' }) &&
            !(
                t.isMemberExpression(node.callee) &&
                t.isIdentifier(node.callee.object, { name: 'require' }) &&
                t.isIdentifier(node.callee.property, { name: 'requireActual' })
            )
        ) {
            return false;
        }

        return true;
    };

    /**
     * Replace the module name
     */
    function resolveModuleName(moduleArg, state) {
        if (!t.isStringLiteral(moduleArg)) {
            return null;
        }

        debug('Start to transform module alias: "%s"', moduleArg.value);

        const module = transformModuleNamespace(
            moduleArg.value, state.file.opts.filename, generateSourceMaps(state.opts)
        );

        if (!module) {
            return null;
        }

        debug('Module alias found and will try to replace: "%s" (%s)', moduleArg.value, module);

        moduleArg.value = module; // eslint-disable-line no-param-reassign

        return module;
    }

    /**
     * Transforms `require('Foo')` and `require.requireActual('Foo')`.
     */
    function transformRequireCall(nodePath, state) {
        if (!isRequireCall(nodePath.node)) {
            return;
        }

        const args = nodePath.node.arguments;

        if (!args.length) {
            return;
        }

        const modulePath = resolveModuleName(args[0], state);

        if (!modulePath) {
            return;
        }

        // See comment bellow
        // return nodePath.replaceWith(
        //     t.callExpression(nodePath.node.callee, [t.stringLiteral(modulePath)])
        // );
    }

    function transformImportCall(nodePath, state) {
        const moduleArg = nodePath.node.source;

        // usually happens when a conflict with a plugin arises
        /* istanbul ignore if */
        if (!moduleArg.extra || !moduleArg.extra.rawValue) {
            return;
        }

        const modulePath = resolveModuleName(moduleArg, state);

        if (!modulePath) {
            return;
        }

        // I don't know why this throw an error
        // return nodePath.replaceWith(
        //     t.importDeclaration(nodePath.node.specifiers, [t.stringLiteral(modulePath)])
        // );
    }

    return {
        visitor: {
            CallExpression: {
                exit(nodePath, state) {
                    return transformRequireCall(nodePath, state);
                }
            },
            ImportDeclaration: {
                exit(nodePath, state) {
                    return transformImportCall(nodePath, state);
                }
            }
        }
    };
};
