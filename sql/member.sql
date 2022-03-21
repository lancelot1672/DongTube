CREATE TABLE `member` (
  `user_id` varchar(15) NOT NULL,
  `user_pw` varchar(20) NOT NULL,
  `name` varchar(20) NOT NULL,
  `profile` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
);
--
-- Dumping data for table `member`
--
 
INSERT INTO `member` VALUES ('lancelot1672','1111','Dore','developer');
INSERT INTO `member` VALUES ('weak1331','1111','duru','database administrator');
INSERT INTO `member` VALUES ('kdr8749','1111','taeho','data scientist, developer');

CREATE TABLE `comment`(
    `c_index` int AUTO_INCREMENT PRIMARY KEY,
    `v_id` varchar(20) NOT NULL,
    `vGroup` int NOT NULL,
    `vStep` int NOT NULL,
    `vIndent` int NOT NULL,
    `description` varchar(100) NOT NULL,
    `like_count` int NOT NULL,
    `user_name` varchar(20) NOT NULL,
)