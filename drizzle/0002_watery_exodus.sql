ALTER TABLE `audio_tests` ADD `deviceLabel` varchar(255);--> statement-breakpoint
ALTER TABLE `audio_tests` ADD `peakFrequency` int;--> statement-breakpoint
ALTER TABLE `audio_tests` DROP COLUMN `audioUrl`;