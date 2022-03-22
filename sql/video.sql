CREATE TABLE `video` (
    `videoId` varchar(20) NOT NULL,
    `title` varchar(100) NOT NULL,
    `path` TEXT NOT NULL,
    `author` varchar(20) NOT NULL,
    PRIMARY KEY(`videoId`)
);

INSERT INTO `video` VALUES ('EhV6m3vDp','OneRepublic - Lose Somebody (One Night in Malibu)','','lancelot1672');
INSERT INTO `video` VALUES ('cDoTHYOv4','Coldplay - Yellow (Live in Madrid 2011)','','lancelot1672');

CREATE TABLE `comment`(
    `c_index` int AUTO_INCREMENT PRIMARY KEY,
    `v_id` varchar(20) NOT NULL,
    `vGroup` int NOT NULL,
    `vStep` int NOT NULL,
    `vIndent` int NOT NULL,
    `description` varchar(100) NOT NULL,
    `like_count` int NOT NULL,
    `user_name` varchar(20) NOT NULL,
    `add_date` date NOT NULL
);

insert into comment VALUES(DEFAULT,'9HWszY2uk',1,0,0,'역시 짱..',1,'lancelot1672');
insert into comment VALUES(DEFAULT,'9HWszY2uk',2,0,0,'대박..',1,'lancelot1672');

ALTER table `comment` ADD COLUMN `add_date` DATE NOT NULL;