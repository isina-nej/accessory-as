ALTER TABLE `contact_messages` MODIFY COLUMN `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `contact_messages` ADD `email` varchar(255);--> statement-breakpoint
UPDATE `contact_messages` SET `email` = 'unknown@accessory-as.local' WHERE `email` IS NULL;--> statement-breakpoint
ALTER TABLE `contact_messages` MODIFY COLUMN `email` varchar(255) NOT NULL;