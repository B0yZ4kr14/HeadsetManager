CREATE TABLE `ai_diagnostics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prompt` text NOT NULL,
	`response` text,
	`provider` varchar(50),
	`model` varchar(100),
	`tokensUsed` int,
	`wasHelpful` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_diagnostics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audio_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(255) NOT NULL,
	`label` text,
	`kind` varchar(50) NOT NULL,
	`groupId` varchar(255),
	`manufacturer` varchar(255),
	`driver` varchar(255),
	`isUsb` boolean DEFAULT false,
	`lastSeen` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audio_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audio_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` int,
	`testType` enum('recording','noise_cancellation','spectrum_analysis') NOT NULL,
	`duration` int,
	`audioUrl` text,
	`spectrumData` json,
	`noiseLevel` int,
	`quality` enum('excellent','good','fair','poor'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audio_tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `script_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scriptId` int NOT NULL,
	`status` enum('pending','running','success','failed') NOT NULL,
	`output` text,
	`errorMessage` text,
	`executionTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `script_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`level` enum('info','warning','error','debug') NOT NULL,
	`source` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `troubleshooting_scripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('driver','audio','system','network') NOT NULL,
	`command` text NOT NULL,
	`requiresRoot` boolean DEFAULT false,
	`platform` enum('linux','windows','all') NOT NULL DEFAULT 'all',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `troubleshooting_scripts_id` PRIMARY KEY(`id`)
);
