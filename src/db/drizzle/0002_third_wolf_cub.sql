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
CREATE TABLE `wallet_refunds` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`iban` varchar(40) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_refunds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `addresses` ADD `label` varchar(50);--> statement-breakpoint
ALTER TABLE `addresses` ADD `recipient` varchar(100);--> statement-breakpoint
ALTER TABLE `addresses` ADD `lat` varchar(30);--> statement-breakpoint
ALTER TABLE `addresses` ADD `lng` varchar(30);--> statement-breakpoint
ALTER TABLE `addresses` ADD `is_default` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `addresses` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `discount_toman` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_fee_toman` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_slug` varchar(50);--> statement-breakpoint
ALTER TABLE `orders` ADD `coupon_code` varchar(50);--> statement-breakpoint
ALTER TABLE `orders` ADD `tracking_code` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `products` ADD `sold_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `phone_number` varchar(20);--> statement-breakpoint
ALTER TABLE `user` ADD `phone_number_verified` boolean;--> statement-breakpoint
CREATE INDEX `order_events_order_idx` ON `order_events` (`order_id`);--> statement-breakpoint
CREATE INDEX `wallet_refunds_user_idx` ON `wallet_refunds` (`user_id`);