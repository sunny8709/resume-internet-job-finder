CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`job_id` integer,
	`job_title` text,
	`company` text,
	`status` text NOT NULL,
	`applied_at` text,
	`website` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`location` text,
	`salary` text,
	`type` text,
	`description` text,
	`skills` text,
	`website` text,
	`posted` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`resume_text` text,
	`skills` text,
	`file_name` text,
	`file_size` integer,
	`file_type` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`phone` text,
	`linkedin` text,
	`cover_letter` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
