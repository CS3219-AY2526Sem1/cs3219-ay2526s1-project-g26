CREATE TABLE difficulties
(
    id    SERIAL PRIMARY KEY,
    level VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE categories
(
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE questions
(
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    description   TEXT         NOT NULL,
    difficulty_id INTEGER REFERENCES difficulties (id) ON DELETE CASCADE,
    input         TEXT,
    output        TEXT,
    constraints   TEXT[],
    examples      JSONB,
    hints         TEXT[],
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW(),
    is_active     BOOLEAN   DEFAULT true
);

CREATE TABLE question_categories
(
    question_id INTEGER REFERENCES questions (id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories (id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, category_id)
);

CREATE TABLE test_cases
(
    id              SERIAL PRIMARY KEY,
    question_id     INTEGER REFERENCES questions (id) ON DELETE CASCADE,
    input           TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden       BOOLEAN DEFAULT TRUE
);
