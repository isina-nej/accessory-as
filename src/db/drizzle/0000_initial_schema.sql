CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `addresses` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`label` varchar(50),
	`recipient` varchar(100),
	`province` varchar(50) NOT NULL,
	`city` varchar(50) NOT NULL,
	`detail` text NOT NULL,
	`postal` varchar(20),
	`phone` varchar(20) NOT NULL,
	`lat` varchar(30),
	`lng` varchar(30),
	`is_default` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attributes` (
	`id` varchar(36) NOT NULL,
	`type` varchar(20) NOT NULL,
	`label` varchar(50) NOT NULL,
	`value` varchar(50) NOT NULL,
	CONSTRAINT `attributes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(100) NOT NULL,
	`parent_id` varchar(36),
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`body` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` varchar(36) NOT NULL,
	`code` varchar(50) NOT NULL,
	`pct` int NOT NULL,
	`max_toman` int,
	`min_toman` int,
	`active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
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
CREATE TABLE `favorites` (
	`user_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_user_id_product_id_pk` PRIMARY KEY(`user_id`,`product_id`)
);
--> statement-breakpoint
CREATE TABLE `order_events` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`qty` int NOT NULL,
	`unit_toman` int NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`total_toman` int NOT NULL,
	`discount_toman` int NOT NULL DEFAULT 0,
	`shipping_fee_toman` int NOT NULL DEFAULT 0,
	`shipping_slug` varchar(50),
	`coupon_code` varchar(50),
	`tracking_code` varchar(100),
	`address_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
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
CREATE TABLE `payments` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`provider` varchar(20) NOT NULL,
	`authority` varchar(100),
	`amount_rial` int NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'initiated',
	`ref_id` varchar(100),
	`raw` json,
	`verified_at` timestamp,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_order_id_unique` UNIQUE(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `product_attributes` (
	`product_id` varchar(36) NOT NULL,
	`attribute_id` varchar(36) NOT NULL,
	CONSTRAINT `product_attributes_product_id_attribute_id_pk` PRIMARY KEY(`product_id`,`attribute_id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`url` text NOT NULL,
	`sort` int NOT NULL DEFAULT 0,
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`title` varchar(200) NOT NULL,
	`category_id` varchar(36),
	`price_toman` int NOT NULL,
	`old_price_toman` int,
	`discount_pct` int,
	`stock` int NOT NULL DEFAULT 0,
	`sold_count` int NOT NULL DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`sku` varchar(50),
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`author` varchar(100) NOT NULL,
	`rating` int NOT NULL,
	`body` text NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `shipping_methods` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`title` varchar(100) NOT NULL,
	`fee_toman` int NOT NULL DEFAULT 0,
	`free_over_toman` int,
	CONSTRAINT `shipping_methods_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipping_methods_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `staff_roles` (
	`user_id` varchar(36) NOT NULL,
	`role` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `staff_roles_user_id_role_pk` PRIMARY KEY(`user_id`,`role`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` text,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`phone_number` varchar(20),
	`phone_number_verified` boolean,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_refunds` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`iban` varchar(40) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_refunds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `addresses_user_idx` ON `addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `banners_slot_idx` ON `banners` (`slot`);--> statement-breakpoint
CREATE INDEX `contact_messages_read_idx` ON `contact_messages` (`read`);--> statement-breakpoint
CREATE INDEX `faqs_sort_idx` ON `faqs` (`sort`);--> statement-breakpoint
CREATE INDEX `order_events_order_idx` ON `order_events` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`product_id`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `staff_roles_user_idx` ON `staff_roles` (`user_id`);--> statement-breakpoint
CREATE INDEX `wallet_refunds_user_idx` ON `wallet_refunds` (`user_id`);
