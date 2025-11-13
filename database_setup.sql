-- SkillForge Database Setup Script
-- Run this in SQL Workbench after connecting to MySQL

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS skillforge_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Create a dedicated user for the application (optional but recommended)
-- Replace 'YOUR_SECURE_PASSWORD' with a strong password
CREATE USER IF NOT EXISTS 'skillforge_user'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';

-- 3. Grant privileges to the user
GRANT ALL PRIVILEGES ON skillforge_db.* TO 'skillforge_user'@'localhost';

-- 4. Apply changes
FLUSH PRIVILEGES;

-- 5. Use the database
USE skillforge_db;

-- 6. Show that database is ready
SELECT 'SkillForge database is ready!' AS Status;

-- Optional: Check if database was created
SHOW DATABASES LIKE 'skillforge_db';