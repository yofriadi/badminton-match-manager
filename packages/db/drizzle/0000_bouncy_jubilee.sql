CREATE TABLE `page_content` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`button_text` text NOT NULL,
	`button_size` text DEFAULT 'sm' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
