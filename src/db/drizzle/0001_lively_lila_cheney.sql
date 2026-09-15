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
ALTER TABLE `products` ADD `sku` varchar(50);--> statement-breakpoint
ALTER TABLE `products` ADD `description` text;--> statement-breakpoint
CREATE INDEX `reviews_product_idx` ON `reviews` (`product_id`);