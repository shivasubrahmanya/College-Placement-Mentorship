-- Database Migration Script for New Features
-- Run this after updating the models

USE mentorship_db;

-- 1. Admin Extended Profile
ALTER TABLE admin 
ADD COLUMN department_name VARCHAR(255) NULL AFTER user_id,
ADD COLUMN designation VARCHAR(255) NULL AFTER department_name,
ADD COLUMN contact_number VARCHAR(20) NULL AFTER designation,
ADD COLUMN updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP;

-- 2. Resource Types ENUM and Content Moderation
ALTER TABLE resources
ADD COLUMN resource_type ENUM('Study Material', 'Preparation Guide', 'Experience', 'Other') NOT NULL DEFAULT 'Other' AFTER file_url,
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT TRUE AFTER category;

-- 3. Post Media Upload and Content Moderation
ALTER TABLE posts
ADD COLUMN media_url VARCHAR(500) NULL AFTER content,
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT TRUE AFTER likes;

-- 4. Chat Read Status
ALTER TABLE chats
ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE AFTER message;

-- Update existing records to have approved status
UPDATE posts SET is_approved = TRUE WHERE is_approved IS NULL;
UPDATE resources SET is_approved = TRUE WHERE is_approved IS NULL;
UPDATE resources SET resource_type = 'Other' WHERE resource_type IS NULL;

