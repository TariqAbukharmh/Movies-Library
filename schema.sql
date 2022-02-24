DROP TABLE IF EXISTS moviesTable;

CREATE TABLE IF NOT EXISTS moviesTable(
    id SERIAL PRIMARY KEY,
    title VARCHAR(250),
    release_date VARCHAR(100),
    poster_path VARCHAR(1000),
    overview VARCHAR(10000),
    comment VARCHAR(10000)
);