import db from './db';

export const getBooks = ({ query, queryType, college, department, stage, course, page = 1, limit = 10 }) => {
	const p = Number(page)
	const l = Number(limit)
	const params = {
		q: query || null,
		type: queryType || 'title',
		college: college || null,
		department: department || null,
		stage: stage || null,
		course: course || null,
		limit: l,
		offset: ((p > 0 ? p : 1) - 1) * l
	}
	const where = `
		WHERE (@q IS NULL OR ((@type = 'prof' AND profName LIKE '%' || @q || '%') OR (@type != 'prof' AND title LIKE '%' || @q || '%')))
		AND (@college IS NULL OR college = @college)
		AND (@department IS NULL OR department = @department)
		AND (@stage IS NULL OR stage = @stage)
		AND (@course IS NULL OR course = @course)
	`
	const { total } = db.prepare(`SELECT count(*) as total FROM books ${where}`).get(params)
	return {
		books: db.prepare(`SELECT * FROM books ${where} ORDER BY id DESC LIMIT @limit OFFSET @offset`).all(params),
		total,
		totalPages: Math.ceil(total / limit),
	}
};

export const insertBook = (book) => {
	const stmt = db.prepare(`
		INSERT INTO books (title, profName, file_path, cover_path, college, department, stage, course)
		VALUES (@title, @profName, @file_path, @cover_path, @college, @department, @stage, @course)
	`)
	return stmt.run(book)
}

export const deleteBook = (id) => {
	return db.prepare('DELETE FROM books WHERE id = ?').run(id).changes > 0;
}
