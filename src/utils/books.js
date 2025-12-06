import db from './db';
import {google} from 'googleapis'
import { Readable } from "node:stream"
import { pipeline } from 'node:stream/promises';
import { unlink } from 'node:fs/promises'
import { createWriteStream } from 'node:fs';

const auth = new google.auth.OAuth2(import.meta.env.GDRIVE_CLIENT_ID, import.meta.env.GDRIVE_CLIENT_SECRET, import.meta.env.GDRIVE_REDIRECT_URI)
auth.setCredentials({refresh_token: import.meta.env.GDRIVE_REFRESH_TOKEN})
const drive = google.drive({version: 'v3', auth})

const GETALL = db.prepare(`SELECT *, COUNT(*) OVER() as total_count
	FROM books WHERE (@role = 'admin' OR publisherId = @publisherId OR @role = 'general')
	AND (@q = '' OR @q IS NULL OR (CASE WHEN @type = 'prof' THEN profName ELSE title END LIKE '%' || @q || '%'))
	AND (@college IS NULL OR college = @college)
	AND (@department IS NULL OR department = @department)
	AND (@stage IS NULL OR stage = @stage)
	AND (@course IS NULL OR course = @course)
	 ORDER BY id DESC LIMIT @limit OFFSET @offset`)
export const getBooks = ({ q = null, type = 'title', college = null, department = null, stage = null, course = null, currentPage, limit = 10, role = 'general', publisherId }) => {
	const books = GETALL.all({q , type, college, department, stage, course, role, publisherId, limit, offset: (currentPage - 1) * limit})
	const total = books.length > 0 ? books[0].total_count : 0
	return {
		books,
		totalPages: Math.ceil(total / limit),
	}
}

const INSERT = db.prepare(`
	INSERT INTO books (id, title, profName, cover, college, department, stage, course, publisherId)
	VALUES (@file, @title, @prof, @cover, @college, @department, @stage, @course, @publisherId)
`)
export const addBook = async (book) => {
	try {
		const gres = await drive.files.create({
			uploadType: book.file.size > 5000000 ? "resumable" : "multipart",
			requestBody:{name: book.title, description: `الأستاذ: ${book.prof} للدراسة: ${book.college} · ${book.department} · ${book.stage} · ${book.course}`, mimeType: "application/pdf", parents: [import.meta.env.GDRIVE_FOLDER_ID]},
			media: {mimeType: 'application/pdf', body: Readable.fromWeb(book.file.stream(),{highWaterMark:8388608})},
			fields: 'id'
		})
		book.file = gres.data.id
		const coverName = `${book.title}-${book.file}.${book.cover.name.split('.').pop()}`
		await pipeline(Readable.fromWeb(book.cover.stream(),{highWaterMark:4194304}), createWriteStream(`./public/assets/books/${coverName}`,{highWaterMark:4194304}))
		book.cover = coverName
		INSERT.run(book)
		return {status: true}
	} catch (error) {
		console.error(error)
		return {status: false, message: "An error occurred on server, please try again later."}
	}
}

const DELETE = db.prepare(`DELETE FROM books WHERE (@role = 'admin' OR publisherId = @publisherId) AND id = @id RETURNING cover`)
export const deleteBook = async (book) => {
	try {
		const sres = DELETE.get(book)
		if (!sres) return {status: false, message: "Operation failed: Permission denied or book not found."}
		await Promise.allSettled([
			drive.files.delete({fileId: book.id}),
			unlink(`./public/assets/books/${sres.cover}`)
		])
		return {status: true}
	} catch (error) {
		console.error(error)
		return {status: false, message: "An error occurred on server, please try again later."}
	}
}

const DELETEALL = db.prepare('DELETE FROM books WHERE publisherId = ? RETURNING id, cover')
export const deleteAllBooks = async (publisherId) => {
	try {
		const sres = DELETEALL.all(publisherId)
		if (sres.length === 0) return {status: false, message: "Operation failed: Permission denied or book not found."}
		const promises = sres.flatMap(book => [
			drive.files.delete({ fileId: book.id }),
			unlink(`./public/assets/books/${book.cover}`)
		])
		await Promise.allSettled(promises)
		return {status: true}
	} catch (error) {
		console.error(error)
		return {status: false, message: "An error occurred on server, please try again later."}
	}
}