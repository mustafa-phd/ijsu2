import { betterAuth } from "better-auth"
import { passkey } from "@better-auth/passkey"
import { admin } from "better-auth/plugins"
import argon2 from "argon2"
import db from "./db.js"

export const auth = betterAuth({
	database: db,
	emailAndPassword: {
		enabled: true,
		password: {
			hash: async (password) => argon2.hash(password, {type: argon2.argon2id, memoryCost: 65536, timeCost: 4, parallelism: 4, hashLength: 32}),
			verify: async ({ hash, password }) => argon2.verify(hash, password)
		}
	},
	user: {
		changeEmail: {
			enabled: true,
			updateEmailWithoutVerification: true
		},
		deleteUser: { 
			enabled: true
		}
	},
	rateLimit: {
		enabled: true,
		window: 180,
		max: 15,
	},
	plugins: [
		passkey(),
		admin()
	],
	trustedOrigins: [
		"https://"
	]
})