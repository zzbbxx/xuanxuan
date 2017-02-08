RENAME TABLE `im_chatsofuser` TO `im_chatuser`;
RENAME TABLE `im_messagesofuser` TO `im_usermessage`;
RENAME TABLE `im_fiesofchat` TO `im_chatfile`;

ALTER TABLE `im_chat` CHANGE `subjectID` `subject` mediumint(8) unsigned NOT NULL DEFAULT 0;
ALTER TABLE `im_chat` ADD `lastActiveTime` datetime NOT NULL DEFAULT '0000-00-00 00:00:00' AFTER `editedDate`;

ALTER TABLE `im_chatuser` DROP INDEX `chatsofuser`;
ALTER TABLE `im_chatuser` DROP INDEX `userID`;
ALTER TABLE `im_chatuser` DROP INDEX `quited`;
ALTER TABLE `im_chatuser` DROP COLUMN `quited`;
ALTER TABLE `im_chatuser` CHANGE `userID` `user` mediumint(8) NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX `chatuser` ON `im_chatuser` (`cgid`, `user`);
CREATE INDEX `user` ON `chatuser` (`user`);

ALTER TABLE `im_usermessage` DROP INDEX `muserID`;
ALTER TABLE `im_usermessage` CHANGE `userID` `user` mediumint(8) NOT NULL DEFAULT 0;
CREATE INDEX `muser` on `im_usermessage` (`user`);

ALTER TABLE `im_chatfile` DROP INDEX `filesofchat`;
ALTER TABLE `im_chatfile` CHANGE `fileID` `file`
CREATE INDEX `chatfile` on `im_chatfile` (`gid`, `file`);
