-- 1. خشتەی بەکارهێنەران و ئەکاونتەکان (Users & Roles)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'super_admin', 'branch_admin', 'viewer'
    branch_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- تۆمارکردنی ئەکاونتی سەرەکی بەڕێوەبەری گشتی (Admin)
INSERT INTO users (username, password, name, role, branch_id) 
VALUES ('admin', '123456', 'بەڕێوەبەری گشتی', 'super_admin', NULL)
ON CONFLICT (username) DO NOTHING;


-- 2. خشتەی خولەکانی هەڵبژاردن (Election Rounds)
CREATE TABLE IF NOT EXISTS election_rounds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    total_voters BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'چالاک'
);


-- 3. خشتەی لقەکانی هەڵبژاردن (Branches)
CREATE TABLE IF NOT EXISTS election_branches (
    id SERIAL PRIMARY KEY,
    round_id INT REFERENCES election_rounds(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);


-- 4. خشتەی ناوچەکان / بنکەکانی دەنگدان (Regions)
CREATE TABLE IF NOT EXISTS election_regions (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES election_branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);


-- 5. خشتەی دەنگەکانی ناوچەکان بۆ لایەنەکان (Region Votes)
CREATE TABLE IF NOT EXISTS region_votes (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES election_regions(id) ON DELETE CASCADE,
    party_id INT NOT NULL,
    party_name VARCHAR(255) NOT NULL,
    votes INT DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0.00
);


-- 6. خشتەی دەنگە ڕاستەوخۆکان لەسەر ئاستی لق (Branch Votes)
CREATE TABLE IF NOT EXISTS branch_votes (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES election_branches(id) ON DELETE CASCADE,
    party_id INT NOT NULL,
    party_name VARCHAR(255) NOT NULL,
    votes INT DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0.00
);