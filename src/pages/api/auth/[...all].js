import { auth } from "../../../utils/auth"
export const ALL = async (ctx) => auth.handler(ctx.request)