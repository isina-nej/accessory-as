CREATE TABLE `banners` (
	`id` varchar(36) NOT NULL,
	`slot` varchar(30) NOT NULL,
	`title` varchar(200) NOT NULL,
	`subtitle` text,
	`cta_label` varchar(100),
	`cta_href` varchar(300),
	`image_url` text,
	`sort` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`starts_at` timestamp,
	`ends_at` timestamp,
	CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(200) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`ends_at` timestamp,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`),
	CONSTRAINT `campaigns_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`body` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` varchar(36) NOT NULL,
	`q` varchar(300) NOT NULL,
	`a` text NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(200) NOT NULL,
	`body` text NOT NULL,
	`seo_title` varchar(200),
	`seo_desc` varchar(300),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `staff_roles` (
	`user_id` varchar(36) NOT NULL,
	`role` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_roles_user_id_role_pk` PRIMARY KEY(`user_id`,`role`)
);
--> statement-breakpoint
CREATE INDEX `banners_slot_idx` ON `banners` (`slot`);--> statement-breakpoint
CREATE INDEX `contact_messages_read_idx` ON `contact_messages` (`read`);--> statement-breakpoint
CREATE INDEX `faqs_sort_idx` ON `faqs` (`sort`);--> statement-breakpoint
CREATE INDEX `staff_roles_user_idx` ON `staff_roles` (`user_id`);