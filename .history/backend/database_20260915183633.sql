-- 1. خشتەی بەکارهێنەران (Users)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    branch_id INT
);

-- 2. خولەکانی هەڵبژاردن (Election Rounds)
CREATE TABLE IF NOT EXISTS election_rounds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(100) NOT NULL,
    total_voters INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Pending'
);

-- 3. لقەکانی هەڵبژاردن (Election Branches)
CREATE TABLE IF NOT EXISTS election_branches (
    id SERIAL PRIMARY KEY,
    round_id INT REFERENCES election_rounds(id) ON DELETE CASCADE,
    branch_name VARCHAR(150) NOT NULL,
    location VARCHAR(200)
);

-- 4. ناوچەکانی هەڵبژاردن (Election Regions)
CREATE TABLE IF NOT EXISTS election_regions (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES election_branches(id) ON DELETE CASCADE,
    region_name VARCHAR(150) NOT NULL,
    total_eligible_voters INT DEFAULT 0
);

-- 5. دەنگەکانی ناوچەکان (Region Votes)
CREATE TABLE IF NOT EXISTS region_votes (
    id SERIAL PRIMARY KEY,
    region_id INT REFERENCES election_regions(id) ON DELETE CASCADE,
    candidate_name VARCHAR(150) NOT NULL,
    votes_count INT DEFAULT 0
);

-- 6. دەنگەکانی لقەکان (Branch Votes)
CREATE TABLE IF NOT EXISTS branch_votes (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES election_branches(id) ON DELETE CASCADE,
    candidate_name VARCHAR(150) NOT NULL,
    total_votes INT DEFAULT 0
);