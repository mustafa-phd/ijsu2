import { auth } from "./utils/auth"
export const onRequest = async ({ url: { pathname } , request, locals, redirect }, next) => {
	if (pathname.startsWith("/lms")){
		const session = await auth.api.getSession({ headers: request.headers })
		if (!session) return redirect("/login/") 
		locals.user = session.user
		if (pathname.startsWith("/lms/users") && session.user.role !== "admin") return redirect("/lms/")
	}
	return next()
}