BEGIN;

DROP TABLE IF EXISTS project_volunteer;
DROP TABLE IF EXISTS project_category;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS organization;
DROP TABLE IF EXISTS roles;

-- ========================================
-- ROLES TABLE
-- ========================================
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT
);

-- ========================================
-- INSERT ROLES
-- ========================================
INSERT INTO roles (role_name, role_description)
VALUES
    ('user', 'Standard user with basic access'),
    ('admin', 'Administrator with full system access');

-- Verify the data was inserted
SELECT * FROM roles;

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ORGANIZATION TABLE
-- ========================================
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ========================================
-- CATEGORY TABLE
-- ========================================
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- ========================================
-- PROJECT TABLE
-- ========================================
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organization(organization_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    date DATE
);

-- ========================================
-- PROJECT_VOLUNTEER JUNCTION TABLE
-- ========================================
CREATE TABLE project_volunteer (
    project_id INTEGER NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

-- ========================================
-- PROJECT_CATEGORY JUNCTION TABLE
-- ========================================
CREATE TABLE project_category (
    project_id INTEGER NOT NULL REFERENCES project(project_id),
    category_id INTEGER NOT NULL REFERENCES category(category_id),
    PRIMARY KEY (project_id, category_id)
);

-- ========================================
-- INSERT ORGANIZATIONS
-- ========================================
INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES
(
    'BrightFuture Builders',
    'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
    'info@brightfuturebuilders.org',
    'brightfuture-logo.png'
),
(
    'GreenHarvest Growers',
    'An urban farming collective promoting food sustainability and education in local neighborhoods.',
    'contact@greenharvest.org',
    'greenharvest-logo.png'
),
(
    'UnityServe Volunteers',
    'A volunteer coordination group supporting local charities and service initiatives.',
    'hello@unityserve.org',
    'unityserve-logo.png'
);

-- ========================================
-- INSERT CATEGORIES
-- ========================================
INSERT INTO category (name, description)
VALUES
('Environmental', 'Environmental service projects'),
('Educational', 'Education related projects'),
('Community Service', 'Community support projects'),
('Health and Wellness', 'Health improvement projects');

-- ========================================
-- INSERT PROJECTS
-- Use the real organization IDs created above: 1, 2, 3
-- ========================================
INSERT INTO project (organization_id, title, description, location, date)
VALUES
(1, 'Community Park Cleanup', 'Cleaning local park and surrounding green spaces.', 'Port-au-Prince', '2026-06-15'),
(2, 'School Supply Drive', 'Supplying schools with books, pens, and backpacks.', 'Cap-Haitien', '2026-07-01'),
(3, 'Health Awareness Campaign', 'Community health education and wellness outreach.', 'Jacmel', '2026-08-10'),
(1, 'River Cleanup Day', 'Removing waste and restoring riverbanks.', 'Les Cayes', '2026-06-20'),
(2, 'Tutoring Support Week', 'Volunteer tutoring for local students.', 'Gonaives', '2026-07-12'),
(3, 'Community Wellness Fair', 'Free wellness screenings and health education.', 'Cap-Haitien', '2026-08-20');

-- ========================================
-- LINK PROJECTS TO CATEGORIES
-- Use titles and names instead of guessing IDs
-- ========================================
INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Environmental'
WHERE p.title = 'Community Park Cleanup';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Community Service'
WHERE p.title = 'Community Park Cleanup';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Educational'
WHERE p.title = 'School Supply Drive';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Community Service'
WHERE p.title = 'School Supply Drive';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Health and Wellness'
WHERE p.title = 'Health Awareness Campaign';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Community Service'
WHERE p.title = 'Health Awareness Campaign';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Environmental'
WHERE p.title = 'River Cleanup Day';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Educational'
WHERE p.title = 'Tutoring Support Week';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Health and Wellness'
WHERE p.title = 'Community Wellness Fair';

INSERT INTO project_category (project_id, category_id)
SELECT p.project_id, c.category_id
FROM project p
JOIN category c ON c.name = 'Community Service'
WHERE p.title = 'Community Wellness Fair';

COMMIT;
