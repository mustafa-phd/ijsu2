// https://astro.build/config
import node from '@astrojs/node'

export default {
	output: "server",
	adapter: node({
		mode: 'standalone'
	}),
	build: {
		assets: 'assets',
		inlineStylesheets: 'never'
	},
	vite: {
		ssr: {external: ['better-sqlite3']},
		optimizeDeps: {exclude: ['better-sqlite3']},
		build: { rollupOptions: { external: ['better-sqlite3'] } }
	},
	security: {
		allowedDomains: [{
			hostname: 'staging.myapp.com',
			protocol: 'https',
			port: '443'
		}]
	},
	experimental: {
		csp: true
	},
}