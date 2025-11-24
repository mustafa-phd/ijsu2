import { betterAuth } from "better-auth";
import Database from "node:sqlite";
import { passkey } from "better-auth/plugins/passkey";
//import argon2 from "argon2";

export const auth = betterAuth({
	database: new Database("sqlite.db"),
	emailAndPassword: {
		enabled: true,
//		password: {
//			hash: async (password) => argon2.hash(password, {type: argon2.argon2id, memoryCost: 65536, timeCost: 4, parallelism: 4, hashLength: 32}),
//			verify: async ({ hash, password }) => argon2.verify(hash, password)
//		}
	},
	plugins: [
		passkey()
	],
	rateLimit: {
		enabled: true,
		window: 180,
		max: 15,
	}
})