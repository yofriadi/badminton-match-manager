CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_provider_account_unique` ON `accounts` (`provider_id`,`account_id`);--> statement-breakpoint
CREATE TABLE `court_halls` (
	`id` text PRIMARY KEY NOT NULL,
	`hall_id` text NOT NULL,
	`number` integer NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`hall_id`) REFERENCES `halls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `court_halls_hall_number` ON `court_halls` (`hall_id`,`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `court_halls_hall_id` ON `court_halls` (`hall_id`,`id`);--> statement-breakpoint
CREATE TABLE `court_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`schedule_id` text NOT NULL,
	`hall_id` text NOT NULL,
	`court_id` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`player_level_min` text NOT NULL,
	`player_level_max` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hall_tenant_registered_players` (
	`hall_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`tenant_player_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`hall_id`, `tenant_player_id`),
	FOREIGN KEY (`hall_id`) REFERENCES `halls`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tenant_player_id`) REFERENCES `tenant_players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hall_tenants` (
	`hall_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	PRIMARY KEY(`hall_id`, `tenant_id`),
	FOREIGN KEY (`hall_id`) REFERENCES `halls`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `halls` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`description` text,
	`price_range` text DEFAULT '0-0' NOT NULL,
	`amenities` text NOT NULL,
	`layout` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_verifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_code` text NOT NULL,
	`order_type` text NOT NULL,
	`order_id` text NOT NULL,
	`order_at` integer NOT NULL,
	`status` text NOT NULL,
	`min_weight` real NOT NULL,
	`actual_weight` real NOT NULL,
	`max_weight` real NOT NULL,
	`total_expected_weight` integer NOT NULL,
	`metadata` text NOT NULL,
	`media_url` text,
	`created_at` integer NOT NULL,
	`timezone` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_verifications_order_id_unique` ON `order_verifications` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_verification_store_code` ON `order_verifications` (`store_code`);--> statement-breakpoint
CREATE INDEX `idx_order_verification_order_id` ON `order_verifications` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_verification_status` ON `order_verifications` (`status`);--> statement-breakpoint
CREATE INDEX `idx_order_verification_order_at` ON `order_verifications` (`order_at`);--> statement-breakpoint
CREATE INDEX `idx_order_verification_order_type` ON `order_verifications` (`order_type`);--> statement-breakpoint
CREATE INDEX `idx_order_verification_metadata` ON `order_verifications` (`metadata`);--> statement-breakpoint
CREATE TABLE `schedule_courts` (
	`schedule_id` text NOT NULL,
	`hall_id` text NOT NULL,
	`court_id` text NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	PRIMARY KEY(`schedule_id`, `court_id`, `start_at`),
	FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`hall_id`) REFERENCES `halls`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`court_id`) REFERENCES `court_halls`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `schedule_players` (
	`schedule_id` text NOT NULL,
	`tenant_player_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	PRIMARY KEY(`schedule_id`, `tenant_player_id`),
	FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tenant_player_id`) REFERENCES `tenant_players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`hall_id` text NOT NULL,
	`price_per_person` integer NOT NULL,
	`schedule_date` integer NOT NULL,
	`player_level_min` text NOT NULL,
	`player_level_max` text NOT NULL,
	`tags` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`hall_id`) REFERENCES `halls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `tenant_players` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`gender` text NOT NULL,
	`skill_level` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_players_tenant_name` ON `tenant_players` (`tenant_id`,`name`);--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`contact_info` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_user_id_unique` ON `tenants` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verifications_identifier_value_unique` ON `verifications` (`identifier`,`value`);