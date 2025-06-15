import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
// to enable single file projects
import { viteSingleFile } from 'vite-plugin-singlefile'
import postcss from './postcss.config.js';

/** @type {import('vite').UserConfig} */
export default defineConfig({
	plugins: [
		svelte(),
		// see above
		viteSingleFile({ removeViteModuleLoader: true }),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	css:{
    postcss
  }
})

