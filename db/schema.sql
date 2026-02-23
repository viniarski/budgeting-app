PRAGMA foreign_keys = ON;

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_name VARCHAR(20) NOT NULL,
    user_email VARCHAR(50) NOT NULL,
    user_password TEXT NOT NULL,
    creation_date TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    amount REAL NOT NULL,
    creation_date TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE budgets (
    budget_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    total_amount REAL,
    s_date TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    e_date TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);