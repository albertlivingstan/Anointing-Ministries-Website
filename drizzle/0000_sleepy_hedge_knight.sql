CREATE TABLE `verse_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`verse_key` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_counters` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verse_likes` (
	`verse_key` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`verse_key`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `live_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`expires` integer NOT NULL
);
