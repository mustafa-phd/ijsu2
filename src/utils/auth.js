import { betterAuth } from "better-auth"
import { passkey } from "@better-auth/passkey"
import { admin } from "better-auth/plugins"
//import { APIError } from "better-auth/api"
import argon2 from "argon2"
import db from "./db.js"
import { deleteAllBooks } from "./books.js"

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
		deleteUser: { 
			enabled: true,
			beforeDelete: async (user) => {
				if (user.role === "admin") {
					//throw new APIError("BAD_REQUEST", {
					//	message: "Admin accounts can't be deleted",
					//})
					return false
				}
				const res = await deleteAllBooks(user.id)
				if (res.status == false) {
					//throw new APIError("BAD_REQUEST", {
					//	message: `Account could not be deleted: ${result.message}`,
					//})
					return false
				}
				return true
			}
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
		'https://',
	]
})