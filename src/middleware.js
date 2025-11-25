import { auth } from "./utils/auth"
export const onRequest = async ({ url: { pathname } , request, locals, redirect }, next) => {
	if (pathname.startsWith("/lms")){
		const session = await auth.api.getSession({ headers: request.headers })
		if (!session) return redirect("/login/") 
		if (pathname.startsWith("/lms/users") && session !== "admin") return redirect("/")
	}
	return next()
}