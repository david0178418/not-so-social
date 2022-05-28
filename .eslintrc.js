/* eslint-env node */
const OFF = 0;
const WARN = 1;
const ERR = 2;

/**
* @typedef { import('eslint').Linter.Config } Configuration
*
* @type {Configuration}
*/
module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'next/core-web-vitals',
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
	],
	env: {
		'browser': true,
		'es6': true,
	},
	plugins: [
		'react-hooks',
	],
	rules: {
		'brace-style': [ERR, '1tbs' ],
		'comma-dangle': [ERR, 'always-multiline'],
		'comma-spacing': ERR,
		'eol-last': ERR,
		'jsx-quotes': ERR,
		'jsx-a11y/alt-text': OFF,
		'jsx-a11y/anchor-is-valid': OFF,
		'key-spacing': ERR,
		'no-extra-semi': WARN,
		'no-shadow': OFF,
		'no-trailing-spaces': ERR,
		'object-curly-spacing': [ERR, 'always'],
		'object-property-newline': ERR,
		'prefer-const': ERR,
		'react-hooks/exhaustive-deps': OFF,
		'react/display-name': OFF,
		'react/jsx-no-target-blank': OFF,
		'react/prop-types': OFF,
		'react/react-in-jsx-scope': OFF,
		'space-before-blocks': ERR,
		'space-in-parens': [ERR, 'never'],
		'space-infix-ops': [ERR, { 'int32Hint': true }],
		indent: OFF,
		quotes: [WARN, 'single'],
		semi: ERR,
		'@typescript-eslint/ban-ts-comment': OFF,
		'@typescript-eslint/explicit-module-boundary-types': OFF,
		'@typescript-eslint/indent': [ERR, 'tab'],
		'@typescript-eslint/no-empty-function': OFF,
		'@typescript-eslint/no-explicit-any': OFF,
		'@typescript-eslint/no-shadow': ERR,
		'@typescript-eslint/no-use-before-define': OFF,
		'object-curly-newline': [ERR, {
			'ObjectExpression': {
				'multiline': true,
				'minProperties': 2,
			},
			'ObjectPattern': {
				'multiline': true,
				'minProperties': 2,
			},
			'ImportDeclaration': {
				'multiline': true,
				'minProperties': 3,
			},
			'ExportDeclaration': {
				'multiline': true,
				'minProperties': 3,
			},
		}],
	},
};