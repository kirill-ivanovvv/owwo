CREATE TABLE IF NOT EXISTS
  pages (
    page_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    cover INTEGER,
    user_id INTEGER,
  );
