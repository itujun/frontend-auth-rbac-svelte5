// @ts-check
import eslint from '@eslint/js';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['build/', '.svelte-kit/', 'static/', 'eslint.config.js']
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginSvelte.configs['flat/recommended'],
	prettierRecommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		// File .svelte butuh parser Svelte, TAPI blok <script> di dalamnya
		// tetap di-parse sebagai TypeScript lewat parserOptions.parser --
		// tanpa ini, eslint-plugin-svelte cuma bisa lint sintaks Svelte-nya
		// saja, tidak tahu apa-apa soal tipe TypeScript di dalam <script>.
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.svelte']
			}
		}
	},
	{
		// Rune module Svelte 5 (mis. state/auth.svelte.ts) -- preset
		// eslint-plugin-svelte sendiri sudah mengarahkan file berpola ini
		// ke svelte-eslint-parser (supaya rule svelte/* seperti
		// prefer-svelte-reactivity bisa jalan), tapi svelte-eslint-parser
		// butuh parser TS "nested" untuk benar-benar paham isi filenya --
		// sama persis alasannya dengan blok .svelte di atas. Tanpa ini,
		// `export type`/`import {}` biasa pun gagal parse.
		files: ['**/*.svelte.ts'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	},
	{
		rules: {
			// Svelte 5 runes ($state, $derived, dst) dideklarasikan tanpa
			// `let`/`const` biasa di beberapa konteks reactive statement --
			// rule ini kadang false-positive untuk pola idiomatis Svelte 5.
			'svelte/valid-compile': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			],
			'prettier/prettier': ['error', { endOfLine: 'auto' }]
		}
	},
	{
		// Komponen reusable generik yang menerima `href` sebagai PROP
		// (bukan literal path di file yang sama) -- linter tidak bisa
		// melihat lintas-file bahwa caller SUDAH wajib pakai resolve()
		// (dipaksa lewat tipe `ResolvedPathname`, lihat komentar di
		// masing-masing file). Ini beda kasus dari halaman/route biasa,
		// yang tetap wajib pakai resolve() secara normal (TIDAK di-
		// exclude di sini).
		files: [
			'src/lib/components/ui/BackLink.svelte',
			'src/lib/components/ui/RowAction.svelte'
		],
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
);
