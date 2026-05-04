CREATE DATABASE  IF NOT EXISTS `online_exam_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `online_exam_system`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: online_exam_system
-- ------------------------------------------------------
-- Server version	8.0.38

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answers` (
  `answer_id` int NOT NULL AUTO_INCREMENT,
  `attempt_id` int DEFAULT NULL,
  `question_id` int DEFAULT NULL,
  `selected_option_id` int DEFAULT NULL,
  `descriptive_answer` text,
  `marks_awarded` int DEFAULT NULL,
  PRIMARY KEY (`answer_id`),
  UNIQUE KEY `unique_attempt_question` (`attempt_id`,`question_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `attempts` (`attempt_id`),
  CONSTRAINT `answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=237 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
INSERT INTO `answers` VALUES (2,8,3,NULL,'Merge Sort divides array ito two part from middle.',NULL),(3,13,1,2,NULL,2),(4,13,3,NULL,'Merge sort is a sorting algorithm. It has time complexity of O(logn).',9),(5,14,5,7,NULL,0),(6,14,6,NULL,'Taj Mahal, one of the wonders of world. It is located in Agra, India.',12),(7,14,7,NULL,'Global warming is causing the world to heat up which is melting the glaciers in Antartica. The animals there are drowning. Water level is increasing.',15),(8,17,10,13,NULL,2),(9,17,11,15,NULL,0),(10,17,12,19,NULL,2),(11,17,13,23,NULL,2),(12,17,14,29,NULL,2),(13,17,15,42,NULL,2),(14,17,16,37,NULL,2),(15,17,17,44,NULL,2),(16,17,18,51,NULL,0),(17,17,19,54,NULL,2),(18,18,10,11,NULL,0),(19,18,11,17,NULL,0),(20,18,12,19,NULL,2),(21,18,13,23,NULL,2),(22,18,14,29,NULL,2),(23,18,15,42,NULL,2),(24,18,16,37,NULL,2),(25,18,17,44,NULL,2),(26,18,18,49,NULL,2),(27,18,19,54,NULL,2),(28,18,20,NULL,'C',3),(29,18,22,NULL,'W',2),(30,18,24,NULL,'T',3),(31,18,25,NULL,'f',2),(32,18,27,NULL,'R',2),(33,19,10,13,NULL,2),(34,19,11,16,NULL,2),(35,19,12,19,NULL,2),(36,19,13,23,NULL,2),(37,19,14,29,NULL,2),(38,19,15,42,NULL,2),(39,19,16,37,NULL,2),(40,19,17,44,NULL,2),(41,19,18,49,NULL,2),(42,19,19,54,NULL,2),(43,19,20,NULL,'E',1),(44,19,21,NULL,'h',3),(45,19,22,NULL,'s',2),(46,19,23,NULL,'d',1),(47,19,24,NULL,'x',1),(48,19,25,NULL,'f',2),(49,19,26,NULL,'y',3),(50,19,28,NULL,'m',1),(51,19,29,NULL,'m',1),(52,20,10,13,NULL,2),(53,20,11,16,NULL,2),(54,20,12,19,NULL,2),(55,20,13,23,NULL,2),(56,20,14,29,NULL,2),(57,20,15,42,NULL,2),(58,20,16,37,NULL,2),(59,20,17,43,NULL,0),(60,20,18,49,NULL,2),(61,20,19,55,NULL,0),(62,20,20,NULL,'s',3),(63,20,21,NULL,'s',3),(64,21,10,13,NULL,2),(65,21,11,16,NULL,2),(66,21,12,21,NULL,0),(67,21,20,NULL,'SAhil gjsgkjgakug gfjkag',3),(68,21,21,NULL,'sferh dtjdjyt jd    ',2),(69,21,24,NULL,'fgjtycjtyj ',2),(70,21,25,NULL,'dfhzthtbxtnnn tx',1),(71,22,10,13,NULL,2),(72,22,11,16,NULL,2),(73,22,12,19,NULL,2),(74,22,13,25,NULL,0),(75,22,14,30,NULL,0),(76,22,15,40,NULL,0),(77,22,16,35,NULL,0),(78,22,17,45,NULL,0),(79,22,18,52,NULL,0),(80,22,19,55,NULL,0),(81,22,20,NULL,'Ahksahavh ugf avug',3),(82,22,21,NULL,'afetw    rdrxtht',1),(83,22,22,NULL,'hstrtrhstr  hrhrg',1),(84,22,23,NULL,'rthstrjhsrdrt ydrtyh rth',2),(85,22,24,NULL,'xhxtrh tr h drxr',2),(86,22,25,NULL,'rtsy  drsrths',3),(87,22,26,NULL,'reeryhsehys thsh',3),(88,22,27,NULL,'rth shdrth trh',3),(89,22,28,NULL,'th hsr htrhstr ',1),(90,23,10,14,NULL,0),(91,23,11,16,NULL,2),(92,23,12,19,NULL,2),(93,23,13,23,NULL,2),(94,23,14,29,NULL,2),(95,23,15,42,NULL,2),(96,23,16,37,NULL,2),(97,23,17,44,NULL,2),(98,23,18,49,NULL,2),(99,23,19,54,NULL,2),(100,23,20,NULL,'errhrthsrthh th',2),(101,23,21,NULL,'thshdtrhs ',3),(102,23,22,NULL,'drhtrt strhsrt',3),(103,23,23,NULL,'strh hh hth',1),(104,23,24,NULL,'strhtrh shsrt',3),(105,23,25,NULL,'rtshrjy d ss',1),(106,23,26,NULL,'srjtrjsyjd d',2),(107,23,27,NULL,'sjttrj srss ',1),(108,23,28,NULL,'strj6jsjy s ssrj',3),(109,23,29,NULL,'rtsjyj sjs js js  js jyj syj t',2),(110,24,10,13,NULL,2),(111,24,11,16,NULL,2),(112,24,12,19,NULL,2),(113,24,13,23,NULL,2),(114,24,14,29,NULL,2),(115,24,15,42,NULL,2),(116,24,16,37,NULL,2),(117,24,17,44,NULL,2),(118,24,18,49,NULL,2),(119,24,19,54,NULL,2),(120,24,20,NULL,'efefweg geeerg ',2),(121,24,21,NULL,'gerge grsrths',1),(122,24,22,NULL,'rshsrtjsrth  s ht',2),(123,24,23,NULL,'sthtsrhdrth hd',3),(124,24,24,NULL,'thdrtjhdytt  jjd',1),(125,24,25,NULL,'thdtrjdytj dytjdtyj',2),(126,24,26,NULL,'dtjytjdytjk ytyftjdt ',2),(127,24,27,NULL,'jyftkdtyjfyuj  ytjft',1),(128,24,28,NULL,'tykfyukdytj d d',1),(129,24,29,NULL,'jftyjytfjyftjdyftj',2),(130,25,10,13,NULL,2),(131,25,11,16,NULL,2),(132,25,12,19,NULL,2),(133,25,13,23,NULL,2),(134,25,14,29,NULL,2),(135,25,15,42,NULL,2),(136,25,16,37,NULL,2),(137,25,17,44,NULL,2),(138,25,18,49,NULL,2),(139,25,19,54,NULL,2),(140,26,10,13,NULL,2),(141,26,11,16,NULL,2),(142,26,12,19,NULL,2),(143,26,13,23,NULL,2),(144,26,14,29,NULL,2),(145,26,15,42,NULL,2),(146,26,16,37,NULL,2),(147,26,17,44,NULL,2),(148,27,20,NULL,'fegresfsgf',2),(149,27,27,NULL,'rthrt hrthrtht',2),(150,27,28,NULL,'rtyrt yhrt yrt ytr',1),(151,28,10,13,NULL,2),(152,28,11,16,NULL,2),(153,28,12,19,NULL,2),(154,28,13,23,NULL,2),(155,28,14,29,NULL,2),(156,28,15,42,NULL,2),(157,28,16,37,NULL,2),(158,28,17,44,NULL,2),(159,28,18,49,NULL,2),(160,28,19,54,NULL,2),(161,28,20,NULL,'YUGugdiuwhdiu gau abbjavjukjc  c\n\nauhuiahc\n ahcihciucbioac',2),(162,28,21,NULL,'SUhuahidhadhaidid',2),(163,28,22,NULL,'ADasdadadddd a fafasf ',3),(164,28,23,NULL,'asf faDWD dwd fsvv s',3),(165,28,24,NULL,'dsbds svsdvs ssvsvsdvv',3),(166,29,10,13,NULL,2),(167,29,11,16,NULL,2),(168,29,12,19,NULL,2),(169,29,13,23,NULL,2),(170,29,14,29,NULL,2),(171,29,15,42,NULL,2),(172,29,16,37,NULL,2),(173,29,17,44,NULL,2),(174,29,18,49,NULL,2),(175,29,19,55,NULL,0),(176,29,20,NULL,'yfyufyugfyukgu uy gfyu',1),(177,29,21,NULL,'7tt7uytuyuiyb9uby98y89',1),(178,29,22,NULL,'uuigui yugyu',1),(179,29,23,NULL,'uytuyguih uiguilb7ui9u ',2),(180,29,24,NULL,'kugiuhoi iugiuh o;i h',3),(181,29,25,NULL,'kguihuih iuhiuh ui',2),(182,29,26,NULL,'luiguigh yuguilgh luigh9',2),(183,29,27,NULL,'k.uhuilh iguyig uih;',2),(184,29,28,NULL,'kuguighi iuguilh o;u9',3),(185,30,10,13,NULL,2),(186,30,11,16,NULL,2),(187,30,12,22,NULL,0),(188,30,13,25,NULL,0),(189,30,14,28,NULL,0),(190,30,15,40,NULL,0),(191,30,16,37,NULL,2),(192,30,17,46,NULL,0),(194,30,18,52,NULL,0),(195,30,19,56,NULL,0),(196,30,20,NULL,'adwefwegweg',2),(197,30,21,NULL,'ewfegergr',2),(198,31,10,13,NULL,2),(199,31,11,16,NULL,2),(200,31,12,19,NULL,2),(201,31,13,23,NULL,2),(202,31,14,28,NULL,0),(203,31,15,42,NULL,2),(204,31,16,37,NULL,2),(205,31,17,44,NULL,2),(206,31,18,49,NULL,2),(207,31,19,54,NULL,2),(208,31,20,NULL,'fessesegs',1),(209,31,21,NULL,'ssegrsgrgrhreh',1),(210,31,22,NULL,'esgtseehseghshg',2),(211,31,23,NULL,'ssgrgdgfdgfgd',1),(212,31,24,NULL,'sfsfsdf sfsfsfsf',2),(213,31,25,NULL,'wadsfs',2),(214,31,26,NULL,'svdsf sfsfesfesfesgfreg',3),(215,31,27,NULL,'gs gsgsg sgdr ',2),(216,31,28,NULL,'gg gsg drgdgdgfsggdrg',3),(217,32,10,13,NULL,2),(218,32,11,16,NULL,2),(219,32,12,19,NULL,2),(220,32,13,23,NULL,2),(221,32,14,29,NULL,2),(222,32,15,42,NULL,2),(223,32,16,37,NULL,2),(224,32,17,44,NULL,2),(225,32,18,49,NULL,2),(226,32,19,54,NULL,2),(227,32,20,NULL,'ssdfsg rdj jdCSS d hfjj',3),(228,32,21,NULL,'HC UG ug ifiugsd  isisg f/ fsf.',2),(229,32,22,NULL,'sgesugjsgseguh se  suh  gIUg ',3),(230,32,23,NULL,'JHV  uG Ug u  iug',2),(231,32,24,NULL,'JGi iUG oi hb yIh  giuh iU I i u uI  UG',3),(232,32,25,NULL,'G  uGU iudssi  e i oi U o oGhi',3),(233,32,26,NULL,'G oih ixd   I i g oic',2),(234,32,27,NULL,' uy UY  iiiugu ayfy  i ic',2),(235,32,28,NULL,'G ii iI UGu cu  i i du g iigi i',2),(236,32,29,NULL,'IU ug sisgug yis jysu',2);
/*!40000 ALTER TABLE `answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attempts`
--

DROP TABLE IF EXISTS `attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attempts` (
  `attempt_id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `score` int DEFAULT NULL,
  `integrity_score` int DEFAULT '100',
  `status` enum('ONGOING','COMPLETED','AUTO_SUBMITTED') DEFAULT 'ONGOING',
  PRIMARY KEY (`attempt_id`),
  UNIQUE KEY `unique_student_exam` (`exam_id`,`student_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `attempts_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`exam_id`),
  CONSTRAINT `attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attempts`
--

LOCK TABLES `attempts` WRITE;
/*!40000 ALTER TABLE `attempts` DISABLE KEYS */;
INSERT INTO `attempts` VALUES (8,4,2,'2026-01-30 15:20:59','2026-01-30 15:23:40',NULL,40,'AUTO_SUBMITTED'),(9,4,NULL,'2026-01-30 16:59:35',NULL,NULL,NULL,'ONGOING'),(10,4,NULL,'2026-01-30 17:00:18',NULL,NULL,NULL,'ONGOING'),(11,4,NULL,'2026-01-30 17:05:17',NULL,NULL,NULL,'ONGOING'),(12,4,NULL,'2026-01-30 17:05:50',NULL,NULL,NULL,'ONGOING'),(13,4,3,'2026-02-01 07:36:34','2026-03-05 13:54:03',11,60,'COMPLETED'),(14,5,2,'2026-02-06 15:20:39','2026-02-08 06:03:27',27,80,'COMPLETED'),(17,8,8,'2026-03-07 17:46:59','2026-03-09 12:13:55',16,40,'COMPLETED'),(18,8,7,'2026-03-07 19:25:15','2026-03-07 19:38:23',28,80,'COMPLETED'),(19,8,4,'2026-03-08 09:05:37','2026-03-08 09:53:42',35,60,'COMPLETED'),(20,8,3,'2026-03-08 09:41:27','2026-03-08 09:54:35',22,40,'COMPLETED'),(21,8,2,'2026-03-08 09:59:38','2026-03-08 10:40:25',12,40,'COMPLETED'),(22,8,13,'2026-03-08 23:35:14','2026-03-09 07:56:23',25,100,'COMPLETED'),(23,8,14,'2026-03-09 18:42:13','2026-03-09 19:01:49',39,60,'COMPLETED'),(24,8,16,'2026-03-10 17:26:44','2026-03-10 17:36:28',37,40,'COMPLETED'),(25,8,17,'2026-03-12 08:33:24','2026-03-12 10:08:04',20,40,'COMPLETED'),(26,8,18,'2026-03-12 08:48:39','2026-03-12 10:08:13',16,40,'COMPLETED'),(27,8,19,'2026-03-12 08:52:02','2026-03-12 10:07:49',5,60,'COMPLETED'),(28,8,20,'2026-03-12 10:11:39','2026-03-12 10:18:48',33,60,'COMPLETED'),(29,8,21,'2026-03-13 10:59:27','2026-03-13 11:03:26',35,60,'COMPLETED'),(30,8,23,'2026-03-13 12:02:21','2026-03-28 07:44:40',10,40,'COMPLETED'),(31,8,24,'2026-03-14 10:56:04','2026-03-14 11:02:11',35,60,'COMPLETED'),(32,8,25,'2026-03-28 07:37:53','2026-03-28 07:45:59',44,100,'COMPLETED');
/*!40000 ALTER TABLE `attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_name` varchar(100) DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'DBMS',1),(3,'Geography',10),(4,'OS',10);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exams` (
  `exam_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `total_marks` int DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `results_published` tinyint(1) DEFAULT '0',
  `exam_code` varchar(10) DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
  PRIMARY KEY (`exam_id`),
  UNIQUE KEY `eam_code` (`exam_code`),
  KEY `course_id` (`course_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES (4,1,1,'Mid Semester Test',90,100,'2026-02-01 10:00:00','2026-02-01 11:30:00',0,'2026-01-21 06:16:52',1,NULL,'DRAFT'),(5,1,2,'Final Test',60,50,'2026-02-10 10:00:00','2026-02-10 11:00:00',0,'2026-01-25 10:29:43',1,NULL,'DRAFT'),(8,3,10,'Geography Fundamentals',20,50,'2026-03-07 16:09:00','2026-03-28 23:40:00',0,'2026-03-07 16:09:29',1,'E7RARW','PUBLISHED'),(9,4,10,'Software',60,100,'2026-03-13 12:00:00','2026-03-15 12:00:00',0,'2026-03-13 12:00:24',0,'HRWKSP','DRAFT');
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `options`
--

DROP TABLE IF EXISTS `options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `options` (
  `option_id` int NOT NULL AUTO_INCREMENT,
  `question_id` int DEFAULT NULL,
  `option_text` varchar(255) DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`option_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `options`
--

LOCK TABLES `options` WRITE;
/*!40000 ALTER TABLE `options` DISABLE KEYS */;
INSERT INTO `options` VALUES (1,1,'O(n)',0),(2,1,'O(log n)',1),(3,1,'O(n log n)',0),(4,1,'O(1)',0),(5,5,'O(n)',0),(6,5,'O(log n)',1),(7,5,'O(n log n)',0),(8,5,'O(1)',0),(11,10,'Africa',0),(12,10,'Europe',0),(13,10,'Asia',1),(14,10,'North America',0),(15,11,'Amazon River',0),(16,11,'Nile River',1),(17,11,'Yangtze River',0),(18,11,'Mississippi River',0),(19,12,'Sahara Desert',1),(20,12,'Arabian Desert',0),(21,12,'Gobi Desert',0),(22,12,'Kalahari Desert',0),(23,13,'Himalayas',1),(24,13,'Alps',0),(25,13,'Rockies',0),(26,13,'Andes',0),(27,14,'Indonesia',0),(28,14,'Brazil',0),(29,14,'India',1),(30,14,'China',0),(35,16,'Tropic of Cancer',0),(36,16,'Tropic of Capricorn',0),(37,16,'Equator',1),(38,16,'Prime Meridian',0),(39,15,'Atlantic Ocean',0),(40,15,'Indian Ocean',0),(41,15,'Arctic Ocean',0),(42,15,'Pacific Ocean',1),(43,17,'Asia',0),(44,17,'Africa',1),(45,17,'Australia',0),(46,17,'South America',0),(49,18,'Brazil',1),(50,18,'Peru',0),(51,18,'Colombia',0),(52,18,'Venezuela',0),(53,19,'Thermometer',0),(54,19,'Barometer',1),(55,19,'Hygrometer',0),(56,19,'Anemometer',0),(61,30,'united state of America',1),(62,30,'united state of gamharia',0),(63,30,'united state of chaibasa',0),(64,30,'united state of arka jain',0);
/*!40000 ALTER TABLE `options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int DEFAULT NULL,
  `type` enum('MCQ','DESC') DEFAULT NULL,
  `question_text` text,
  `marks` int DEFAULT NULL,
  PRIMARY KEY (`question_id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`exam_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,4,'MCQ','What is the time complexity of Binary Search?',2),(3,4,'DESC','Explain Merge Sort algorithm.',10),(5,5,'MCQ','What is the time complexity of Binary Search?',2),(6,5,'DESC','Write an essay on The Taj Mahal ?',16),(7,5,'DESC','Write an artical on Global Warming ?',16),(10,8,'MCQ','Which is the largest continent in the world ?',2),(11,8,'MCQ','Which is the longest river in the world ?',2),(12,8,'MCQ','Which is the largest hot desert in the world ?',2),(13,8,'MCQ','Mount Everest is located in which mountain range ?',2),(14,8,'MCQ','Which country has the largest population in the world ?',2),(15,8,'MCQ','Which ocean is the largest ocean on the Earth ?',2),(16,8,'MCQ','Which line divides the Earth into Northern and Southern Hemispheres ?',2),(17,8,'MCQ','Which continent is known as the \"Dark Continent\" in historical geography ?',2),(18,8,'MCQ','Which country is famous for the Amazon rainforest ?',2),(19,8,'MCQ','Which instrument is used to measured atmospheric pressure ?',2),(20,8,'DESC','Explain the water cycle and its importance in maintaining life on Earth.',3),(21,8,'DESC','Describe the different layers of the Earth and their characteristics.',3),(22,8,'DESC','What are the plate tectonics? Explain how they cause earthquakes and volcanic activity.',3),(23,8,'DESC','Explain are renewable and non-renewable resources? Provide examples of each.',3),(24,8,'DESC','Describe the major types of forest found in the world.',3),(25,8,'DESC','Explain the importance of rivers for human civilization.',3),(26,8,'DESC','What are monsoons? Explain their impact on agriculture.',3),(27,8,'DESC','Discuss the causes and effect of global warming.',3),(28,8,'DESC','Explain the importance of maps and different types of map projections in geography.',3),(29,8,'DESC','Explain the difference between weather and climate with example.',3),(30,9,'MCQ','What is the full form of usa ?',2);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','TEACHER','STUDENT') DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','APPROVED','REJECTED','ACTIVE') DEFAULT 'ACTIVE',
  `is_verified` tinyint(1) DEFAULT '1',
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_token_expiry` bigint DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test Teacher','teacher@test.com','$2b$10$vimT6YrZ7a9EvIoh8xe9Qeu83RFzcQqinwxT8a1.N5uERCzQ/6Pri','TEACHER','2026-01-21 06:15:06','ACTIVE',1,NULL,NULL),(2,'Test Student','student1@test.com','$2b$10$vimT6YrZ7a9EvIoh8xe9Qeu83RFzcQqinwxT8a1.N5uERCzQ/6Pri','STUDENT','2026-01-23 10:20:01','ACTIVE',1,NULL,NULL),(3,'Test User 2','Test2@test.com','$2b$10$vimT6YrZ7a9EvIoh8xe9Qeu83RFzcQqinwxT8a1.N5uERCzQ/6Pri','STUDENT','2026-02-01 06:20:19','ACTIVE',1,NULL,NULL),(4,'Test User 3','Test3@test.com','$2b$10$evFKcFtq5swK8QteYaV/3ecfqMjz9rPgY/1Pc8u7KwiaotGQAA8dG','STUDENT','2026-02-06 14:58:05','ACTIVE',1,NULL,NULL),(5,'Test User 4','Test4@test.com','$2b$10$HrBpApip6wS1/xlwafASWO7EaheIZ5g5XeKdufn/k47GZR0EXLTdG','TEACHER','2026-02-06 14:58:05','ACTIVE',1,NULL,NULL),(6,'Sahil Sumbrui','sahilsumbrui03@gmail.com','$2b$10$.OyOyZNkrGOD0iKEHy88I.b2Y/TiEN8iA/x8Gyt0CQoDrL8s9bkjK','ADMIN','2026-02-06 14:58:05','ACTIVE',1,NULL,NULL),(7,'Bishan Samad','bsamad@gmail.com','$2b$10$p2wPRjMENyN/mx6rDQtQcu88XfIVjdJpPO05u4f4aEq7bEd32LyKS','STUDENT','2026-02-22 02:42:45','ACTIVE',1,NULL,NULL),(8,'Ansh Hembrom','ansh@gmail.com','$2b$10$Nb0BhpgBRzQeFEkEFtiea.JD99YeHhtBgo.46qHvObY/khwBUX/zy','STUDENT','2026-02-26 06:36:44','ACTIVE',1,NULL,NULL),(9,'Dindo Hembrom','dindo4@gmail.com','$2b$10$CiTPxwqoWgqDCOeKgoUnZ.gcQKSib0p4eyjghU/7zq1GD2TS5Qu2a','STUDENT','2026-02-27 08:05:07','ACTIVE',1,NULL,NULL),(10,'Vivek Mandal','vivekmandal21@teach.com','$2b$10$NKhEXQ0qUV5DWysdcrqp5.j0fFDm1UaBBaMkydMq5oSNmwCgWw8Ca','TEACHER','2026-03-03 23:44:13','ACTIVE',1,NULL,NULL),(13,'Ravi Kumar','ravikumar@gmail.com','$2b$10$wiwt8ern4PZsmLu.UEMx/uHWesqVHoJEA7FGOFWOsZVPFKVhbBlxi','STUDENT','2026-03-08 22:51:20','ACTIVE',1,NULL,NULL),(14,'Roshan Pradhan','roshanpradhan@gmail.com','$2b$10$JOwCVvH5lSfU0GbyrXjSV.ujTBLmWYwHl3X/ZnQPbpwCSCeo3U75m','STUDENT','2026-03-09 16:17:23','ACTIVE',1,NULL,NULL),(16,'Vishal Pradhan','vishalpradhan@gmail.com','$2b$10$1YDNnovj5VJwf13LnOmY7.sz7RGoYSJ7HpRB5UoD0CeEIEq9AuaiG','STUDENT','2026-03-10 16:55:28','ACTIVE',1,NULL,NULL),(17,'Sanatan Sahoo','sanatansahoo@gmail.com','$2b$10$42sYIJW5cbWWlGebHG9sNexcgywR8Pso6jonUfDswSo56y6/c6/x6','STUDENT','2026-03-12 08:32:46','ACTIVE',1,NULL,NULL),(18,'Vibhanshu Prasad','vibhanshuprasad07@gmail.com','$2b$10$v97905Q223s1mxG96vd1t.Y2HZdVU9K0gWrfZUFKJ14tGzRw0XYRe','STUDENT','2026-03-12 08:48:23','ACTIVE',1,NULL,NULL),(19,'Raj Kumar','rajkumar@gmail.com','$2b$10$wiFI/tq0mz03TBwNY08rPeoYUGePWlPDEC6nlX/n5puJXo2nj9zXa','STUDENT','2026-03-12 08:51:42','ACTIVE',1,NULL,NULL),(20,'Sahil Kumar','sahilkumar@gmail.com','$2b$10$MtaQFjL2/y/kGgm.xgII7Oe0fIiapGUt85D9x1DzNIT3mcnURt7Sm','STUDENT','2026-03-12 10:10:08','ACTIVE',1,NULL,NULL),(21,'Roshan Nayak','roshannayak@gmail.com','$2b$10$4H5uCCKsnGVbRWwM4/qUIeTkan1SZh7jh3xonCAUPl24g3tqAB7oy','STUDENT','2026-03-12 10:33:08','ACTIVE',1,NULL,NULL),(22,'Sahil Kumar','sahilku@gmail.com','$2b$10$IOw1lyZwJWnyWVJpl4XbAepN/0p5GlILFemVkPAojyvm.YWTerUsa','TEACHER','2026-03-13 11:08:07','PENDING',1,NULL,NULL),(23,'Ayushman Raj','ayushmanraj@gmail.com','$2b$10$v0wLYPq56HU3rGTlGwwBuugvW9MGHiAaVMmjdLxy0UBSYcsSzkOby','STUDENT','2026-03-13 11:37:14','ACTIVE',1,NULL,NULL),(24,'Rockey Kumar','rockeykumar@gmail.com','$2b$10$Mc0NjX2NHAa9VwPiTt2DV.EYHyUTBR0lj6jP5dRnjW7NkkQkbf9TG','STUDENT','2026-03-14 10:51:58','ACTIVE',1,NULL,NULL),(25,'Rahul Shukla','rahulshukla@gmail.com','$2b$10$dH3/qdFESjVM12ABNPRdK.Vs.zjJFzViEqFAQE/PDYH7eJACp2Ig.','STUDENT','2026-03-28 07:32:43','ACTIVE',1,NULL,NULL),(26,'SAHIL SUMBRUI','sahilsumbrui3@gmail.com',NULL,'STUDENT','2026-04-08 23:44:55','ACTIVE',1,NULL,NULL),(27,'Sahil Sumbrui','sahilsumbrui2003@gmail.com',NULL,'STUDENT','2026-04-09 10:06:15','ACTIVE',1,NULL,NULL),(28,'Arpit Nandan','arpitnandan@gmail.com','$2b$10$cUDCTmN4QUIWCWYR3sapwe4eH8X0D4xpo/N95KJOefAcESg12VBNW','STUDENT','2026-04-09 10:10:18','ACTIVE',1,NULL,NULL),(37,'Sahil Sumbrui','sahildeskstop25@gmail.com','$2b$10$Hqg68K.hYTQAkSi/T/MY8efsUK3XCmZaRFrApSWUEykUdmlhIR8iK','STUDENT','2026-04-11 17:49:01','ACTIVE',1,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violation_logs`
--

DROP TABLE IF EXISTS `violation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violation_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `attempt_id` int DEFAULT NULL,
  `violation_type` varchar(100) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `attempt_id` (`attempt_id`),
  CONSTRAINT `violation_logs_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `attempts` (`attempt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violation_logs`
--

LOCK TABLES `violation_logs` WRITE;
/*!40000 ALTER TABLE `violation_logs` DISABLE KEYS */;
INSERT INTO `violation_logs` VALUES (1,8,'TAB_SWITCH','2026-01-30 15:23:32'),(2,8,'TAB_SWITCH','2026-01-30 15:23:35'),(3,8,'TAB_SWITCH','2026-01-30 15:23:40'),(4,13,'TAB_SWITCH','2026-02-01 08:44:00'),(5,13,'TAB_SWITCH','2026-02-01 08:44:05'),(6,14,'TAB_SWITCH','2026-02-06 16:10:44'),(13,18,'TAB_SWITCH','2026-03-07 19:25:22'),(14,19,'TAB_SWITCH','2026-03-08 09:05:41'),(15,19,'TAB_SWITCH','2026-03-08 09:14:40'),(16,20,'TAB_SWITCH','2026-03-08 09:43:00'),(17,20,'TAB_SWITCH','2026-03-08 09:43:36'),(18,20,'TAB_SWITCH','2026-03-08 09:43:47'),(19,21,'TAB_SWITCH','2026-03-08 09:59:46'),(20,21,'TAB_SWITCH','2026-03-08 10:02:25'),(21,21,'TAB_SWITCH','2026-03-08 10:04:38'),(22,23,'FULLSCREEN_EXIT','2026-03-09 18:43:40'),(23,23,'WINDOW_BLUR','2026-03-09 18:45:03'),(24,24,'RIGHT_CLICK','2026-03-10 17:29:48'),(25,24,'WINDOW_BLUR','2026-03-10 17:29:48'),(26,24,'WINDOW_BLUR','2026-03-10 17:30:31'),(27,25,'TAB_SWITCH','2026-03-12 08:35:04'),(28,25,'TAB_SWITCH','2026-03-12 08:35:04'),(29,25,'TAB_SWITCH','2026-03-12 08:35:18'),(30,26,'FULLSCREEN_EXIT','2026-03-12 08:49:40'),(31,26,'FULLSCREEN_EXIT','2026-03-12 08:49:47'),(32,26,'WINDOW_BLUR','2026-03-12 08:49:51'),(33,27,'WINDOW_BLUR','2026-03-12 08:52:22'),(34,27,'WINDOW_BLUR','2026-03-12 08:52:51'),(35,28,'RIGHT_CLICK','2026-03-12 10:15:27'),(36,28,'WINDOW_BLUR','2026-03-12 10:15:33'),(37,29,'RIGHT_CLICK','2026-03-13 11:00:03'),(38,29,'FULLSCREEN_EXIT','2026-03-13 11:00:10'),(39,30,'FULLSCREEN_EXIT','2026-03-13 12:03:46'),(40,30,'TAB_SWITCH','2026-03-13 12:07:19'),(41,30,'WINDOW_BLUR','2026-03-13 12:07:19'),(42,31,'WINDOW_BLUR','2026-03-14 10:57:46'),(43,31,'FULLSCREEN_EXIT','2026-03-14 10:57:56');
/*!40000 ALTER TABLE `violation_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-16  8:20:26
