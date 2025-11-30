import Database from 'better-sqlite3'
const db = new Database('sqlite.db')

db.exec(`
	PRAGMA journal_mode = WAL;
	PRAGMA synchronous = NORMAL;
	PRAGMA mmap_size = 5242880;
	PRAGMA temp_store = MEMORY;
	PRAGMA busy_timeout = 10000;
	PRAGMA foreign_keys = ON;
	
	CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY,
		title TEXT, profName TEXT, file_path TEXT, cover_path TEXT,
		college TEXT, department TEXT, stage TEXT, course TEXT
	) STRICT;
	CREATE INDEX IF NOT EXISTS idx_title ON books(title);
	CREATE INDEX IF NOT EXISTS idx_prof ON books(profName);
	CREATE INDEX IF NOT EXISTS idx_hierarchy ON books(college, department);
	CREATE INDEX IF NOT EXISTS idx_stage ON books(stage);
	CREATE INDEX IF NOT EXISTS idx_course ON books(course);
`)
db.pragma('optimize')

export default db