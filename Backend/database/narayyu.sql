-- MariaDB dump 10.19  Distrib 10.4.27-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: narayyu
-- ------------------------------------------------------
-- Server version	10.4.27-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admins_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Super Admin Naray','admin@narayhospital.com','$2y$12$rGxtewPBcIN1H2WlhI5ynu3VxGNtRLjEhVXIgLGChzAZokG1eULSS','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `appointments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `doctor_id` bigint(20) unsigned NOT NULL,
  `poliklinik_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `doctor_schedule_id` bigint(20) unsigned NOT NULL,
  `scheduled_date` date NOT NULL,
  `scheduled_time` time NOT NULL,
  `status` enum('pending','confirmed','rejected','cancelled','completed') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointments_patient_id_foreign` (`patient_id`),
  KEY `appointments_doctor_id_foreign` (`doctor_id`),
  KEY `appointments_poliklinik_id_foreign` (`poliklinik_id`),
  KEY `appointments_branch_id_foreign` (`branch_id`),
  KEY `appointments_doctor_schedule_id_foreign` (`doctor_schedule_id`),
  CONSTRAINT `appointments_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `appointments_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `appointments_doctor_schedule_id_foreign` FOREIGN KEY (`doctor_schedule_id`) REFERENCES `doctor_schedules` (`id`),
  CONSTRAINT `appointments_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `appointments_poliklinik_id_foreign` FOREIGN KEY (`poliklinik_id`) REFERENCES `polikliniks` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,1,1,1,1,1,'2026-09-25','10:00:00','cancelled','Pemeriksaan rutin | Kode Booking: NRY-068E7A | No Antrean: A-14 | Penjamin: BPJS Kesehatan','2026-09-20 21:54:20','2026-09-22 20:42:11','2026-09-22 20:42:11'),(2,2,6,9,1,22,'2026-09-22','11:00:00','cancelled','Keluhan: Informasi penggunaan fasilitas: Laboratorium Patologi Klinik 24 Jam | Kode Booking: NRY-64F9E4 | No Antrean: A-25 | Penjamin: Pribadi / Umum','2026-09-21 00:58:46','2026-09-22 20:42:17',NULL);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_categories`
--

DROP TABLE IF EXISTS `article_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `article_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_categories`
--

LOCK TABLES `article_categories` WRITE;
/*!40000 ALTER TABLE `article_categories` DISABLE KEYS */;
INSERT INTO `article_categories` VALUES (1,'Kesehatan Umum','kesehatan-umum','2026-09-20 21:47:48','2026-09-20 21:47:48');
/*!40000 ALTER TABLE `article_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `articles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_unique` (`slug`),
  KEY `articles_category_id_foreign` (`category_id`),
  CONSTRAINT `articles_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `article_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,'Pentingnya Menjaga Pola Makan dan Gula Darah Terkontrol bagi Penderita Diabetes','artikel-1','Diabetes melitus merupakan salah satu gangguan metabolik yang paling banyak dijumpai di masyarakat. Sering kali diabetes tidak menimbulkan keluhan di awal, namun jika dibiarkan dapat memicu komplikasi pada ginjal, jantung, mata, dan persarafan.\n\nLangkah Kunci Mengontrol Gula Darah:\n1. Batasi konsumsi karbohidrat sederhana dan minuman berpemanis tinggi.\n2. Perbanyak asupan serat dari sayur-sayuran hijau dan buah dengan indeks glikemik rendah.\n3. Rutin berolahraga ringan minimal 30 menit sehari (seperti jalan santai atau senam).\n4. Periksa kadar HbA1c dan gula darah puasa berkala di Naray Hospital.','/storage/uploads/articles/p24ZdJ92E65CCO3e57TrP5CbqDz37IPgJwfgkDVp.webp',1,'published','2026-09-20 21:47:48','2026-09-20 21:47:48','2026-10-02 00:52:41',NULL),(2,'Mengenal Tanda Gangguan Irama Jantung (Aritmia) dan Kapan Harus ke Dokter','artikel-2','Irama jantung normal berdetak secara teratur antara 60 hingga 100 kali per menit saat istirahat. Ketika detak jantung terlalu cepat, terlalu lambat, atau tidak beraturan, kondisi ini disebut sebagai aritmia.\n\nKapan Harus Waspada?\n- Debaran jantung mendadak tanpa pemicu aktivitas fisik berat.\n- Disertai pusing hebat, pandangan gelap, atau pingsan (sinkop).\n- Nyeri dada atau rasa tertekan di bagian dada tengah.\n\nLakukan pemeriksaan EKG 12-Lead dan konsultasi di Poliklinik Jantung Naray Hospital untuk evaluasi menyeluruh.',NULL,1,'published','2026-09-20 21:47:48','2026-09-20 21:47:48','2026-09-20 21:47:48',NULL),(3,'Tips Menjaga Tumbuh Kembang Optimal Anak pada 1.000 Hari Pertama Kehidupan','artikel-3','1.000 Hari Pertama Kehidupan (HPK) adalah periode krusial yang menentukan kecerdasan kognitif, daya tahan tubuh, dan pertumbuhan fisik seorang anak di masa depan.\n\nKunci Sukses 1.000 HPK:\n1. Nutrisi lengkap bagi ibu hamil dan rutin memeriksakan kehamilan.\n2. Inisiasi Menyusu Dini (IMD) dan ASI Eksklusif selama 6 bulan pertama.\n3. MPASI bernutrisi seimbang kaya protein hewani mulai usia 6 bulan.\n4. Imunisasi dasar lengkap tepat waktu di Poliklinik Anak Naray Hospital.',NULL,1,'published','2026-09-20 21:47:48','2026-09-20 21:47:48','2026-09-20 21:47:48',NULL),(4,'Pencegahan dan Penanganan Gangguan Pernapasan di Lingkungan Beriklim Tropis','artikel-4','Saluran pernapasan sangat rentan terhadap partikel polutan dan perubahan suhu udara yang drastis. Bagi penderita asma atau alergi saluran napas, paparan asap rokok dan debu dapat memicu penyempitan bronkus yang menyebabkan sesak.\n\nTips Menjaga Kesehatan Paru:\n- Gunakan masker saat beraktivitas di luar ruangan berdebu.\n- Hindari asap rokok dan jaga sirkulasi udara kamar tidur tetap bersih.\n- Cukupi minum air hangat dan konsumsi makanan kaya antioksidan.\n- Segera periksakan diri jika batuk berlangsung lebih dari 2 minggu.',NULL,1,'published','2026-09-20 21:47:48','2026-09-20 21:47:48','2026-09-20 21:47:48',NULL);
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `branches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,'Naray Hospital Dumai (Gedung Utama)','Jl. Dr. Wahidin No.98-99, Purnama, Kec. Dumai Barat, Kota Dumai, Riau 28823','+62 811-7529-798','dumai@narayhospital.com',1.6988780,101.3968980,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(2,'Naray Wellness & Medical Check-Up Hub','Kawasan Layanan Terpadu Naray Hospital, Jl. Dr. Wahidin No.99, Dumai','+62 811-7529-798','dumai@narayhospital.com',1.6988780,101.3968980,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL);
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `center_of_excellences`
--

DROP TABLE IF EXISTS `center_of_excellences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `center_of_excellences` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `center_of_excellences_slug_unique` (`slug`),
  KEY `center_of_excellences_status_index` (`status`),
  KEY `center_of_excellences_branch_id_index` (`branch_id`),
  CONSTRAINT `center_of_excellences_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `center_of_excellences`
--

LOCK TABLES `center_of_excellences` WRITE;
/*!40000 ALTER TABLE `center_of_excellences` DISABLE KEYS */;
INSERT INTO `center_of_excellences` VALUES (1,'Pusat Jantung & Kardiovaskular','center-jantung','Pemeriksaan Jantung Komprehensif & Deteksi Dini Penyakit Jantung Koroner\nDidukung oleh dokter spesialis jantung dan pembuluh darah dengan peralatan diagnostik EKG 12-Lead, Ekokardiografi, dan Treadmill Stress Test untuk penanganan preventif dan kuratif.',NULL,'active',1,'2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(2,'Pusat Kesehatan Ibu & Anak Terpadu','center-ibu-anak','Pelayanan Kebidanan, Kandungan, dan Tumbuh Kembang Anak Penuh Kasih\nMenyediakan layanan persalinan yang aman dan nyaman, pemeriksaan USG kehamilan, klinik anak ramah anak, imunisasi lengkap, serta penanganan penyakit anak terpadu.',NULL,'active',1,'2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(3,'Pusat Penyakit Dalam & Geriatri','center-penyakit-dalam','Penanganan Penyakit Metabolik Kronik & Pelayanan Pasien Lanjut Usia\nFokus pada pengelolaan penyakit metabolik menahun seperti diabetes melitus, hipertensi, gangguan ginjal, dan pencernaan, dilengkapi program khusus pelayanan lansia (Geriatri).',NULL,'active',1,'2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(4,'Pusat Bedah & Layanan UGD 24 Jam','pusat-bedah-layanan-ugd-24-jam','Respon Cepat Gawat Darurat & Kamar Operasi Berstandar Sterilisasi Tinggi\nUnit Gawat Darurat 24 jam dengan tim dokter siaga didukung kamar bedah modern untuk menangani kasus bedah umum, bedah mulut traumatik, serta cedera kecelakaan.','/storage/uploads/centers/HFWDjPiKyEsJ3BXJrNZaluU2BKSLyIBRKadfNUfu.webp','active',1,'2026-09-20 21:46:55','2026-10-01 00:00:33',NULL),(5,'Pusat Paru & Kesehatan Pernapasan','center-paru-pernapasan','Diagnostik & Terapi Penyakit Saluran Pernapasan Menyeluruh\nPelayanan terpadu untuk asma, penyakit paru obstruktif kronik (PPOK), pneumonia, dan skrining kesehatan pernapasan oleh tim dokter spesialis paru berpengalaman.',NULL,'active',1,'2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(6,'Pusat Mata, THT & Panca Indera','center-mata-tht','Perawatan Presisi untuk Penglihatan Tajam & Pendengaran Optimal\nMenghadirkan klinik spesialis mata dan spesialis THT-KL dengan peralatan diagnostik optik modern untuk menjaga kualitas indera penglihatan dan pendengaran Anda.',NULL,'active',1,'2026-09-20 21:46:55','2026-09-20 21:46:55',NULL);
/*!40000 ALTER TABLE `center_of_excellences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_leaves`
--

DROP TABLE IF EXISTS `doctor_leaves`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doctor_leaves` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint(20) unsigned NOT NULL,
  `doctor_schedule_id` bigint(20) unsigned DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','cancelled') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_leaves_doctor_id_start_date_end_date_status_index` (`doctor_id`,`start_date`,`end_date`,`status`),
  KEY `doctor_leaves_doctor_schedule_id_foreign` (`doctor_schedule_id`),
  CONSTRAINT `doctor_leaves_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doctor_leaves_doctor_schedule_id_foreign` FOREIGN KEY (`doctor_schedule_id`) REFERENCES `doctor_schedules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_leaves`
--

LOCK TABLES `doctor_leaves` WRITE;
/*!40000 ALTER TABLE `doctor_leaves` DISABLE KEYS */;
INSERT INTO `doctor_leaves` VALUES (1,10,NULL,'2026-09-29','2026-09-29','Libur Khusus Poliklinik',NULL,'active','2026-09-28 21:21:54','2026-09-28 21:25:09','2026-09-28 21:25:09'),(2,10,NULL,'2026-10-01','2026-10-01','Libur Khusus Poliklinik',NULL,'active','2026-09-28 21:22:13','2026-09-28 21:25:04','2026-09-28 21:25:04'),(3,10,56,'2026-10-05','2026-10-05','Seminar / Tugas Luar',NULL,'active','2026-09-28 21:45:37','2026-09-28 23:40:01','2026-09-28 23:40:01'),(4,13,NULL,'2026-09-29','2026-11-01','Libur Khusus Poliklinik',NULL,'active','2026-09-28 23:37:43','2026-09-28 23:37:59','2026-09-28 23:37:59'),(5,13,NULL,'2026-09-29','2026-11-03','Keperluan Pribadi / Keluarga',NULL,'active','2026-09-28 23:38:14','2026-09-28 23:41:15','2026-09-28 23:41:15'),(6,10,NULL,'2026-10-04','2026-10-04','Cuti Tahunan',NULL,'active','2026-09-28 23:39:36','2026-09-28 23:39:58','2026-09-28 23:39:58'),(7,8,NULL,'2026-10-02','2026-10-16','v',NULL,'active','2026-10-01 20:15:07','2026-10-01 20:15:40','2026-10-01 20:15:40'),(8,14,NULL,'2026-10-02','2026-10-28','Cuti Tahunan',NULL,'active','2026-10-01 20:54:31','2026-10-01 20:58:23','2026-10-01 20:58:23'),(9,8,NULL,'2026-10-03','2026-10-03','Libur Khusus Poliklinik',NULL,'active','2026-10-01 21:12:38','2026-10-01 21:13:49','2026-10-01 21:13:49'),(10,8,NULL,'2026-10-08','2026-10-08','Libur Khusus Poliklinik',NULL,'active','2026-10-01 21:12:39','2026-10-01 21:14:00','2026-10-01 21:14:00'),(11,8,NULL,'2026-10-26','2026-10-26','Libur Khusus Poliklinik',NULL,'active','2026-10-01 21:12:41','2026-10-01 21:13:56','2026-10-01 21:13:56'),(12,8,NULL,'2026-10-03','2026-10-03','Cuti Tahunan',NULL,'active','2026-10-01 21:13:24','2026-10-01 21:13:47','2026-10-01 21:13:47'),(13,8,NULL,'2026-10-15','2026-10-15','Cuti Tahunan',NULL,'active','2026-10-01 21:13:25','2026-10-01 21:13:52','2026-10-01 21:13:52'),(14,8,NULL,'2026-10-17','2026-10-17','Cuti Tahunan',NULL,'active','2026-10-01 21:13:27','2026-10-01 21:13:59','2026-10-01 21:13:59'),(15,8,NULL,'2026-10-19','2026-10-19','Cuti Tahunan',NULL,'active','2026-10-01 21:13:28','2026-10-01 21:13:54','2026-10-01 21:13:54'),(16,8,NULL,'2026-10-03','2026-10-03','Cuti Tahunan',NULL,'active','2026-10-01 21:14:05','2026-10-01 21:14:05',NULL),(17,8,NULL,'2026-10-05','2026-10-05','Cuti Tahunan',NULL,'active','2026-10-01 21:14:06','2026-10-01 21:14:06',NULL),(18,8,NULL,'2026-10-08','2026-10-08','Cuti Tahunan',NULL,'active','2026-10-01 21:14:08','2026-10-01 21:14:08',NULL),(19,13,NULL,'2026-10-02','2026-10-02','Cuti Tahunan',NULL,'active','2026-10-01 21:16:57','2026-10-01 21:16:57',NULL),(20,8,NULL,'2026-10-03','2026-10-03','Libur Khusus Poliklinik',NULL,'active','2026-10-02 00:30:34','2026-10-02 00:30:34',NULL),(21,8,NULL,'2026-10-19','2026-10-19','Libur Khusus Poliklinik',NULL,'active','2026-10-02 00:30:35','2026-10-02 00:30:35',NULL),(22,8,NULL,'2026-10-22','2026-10-22','Libur Khusus Poliklinik',NULL,'active','2026-10-02 00:30:37','2026-10-02 00:30:37',NULL),(23,8,NULL,'2026-10-26','2026-10-26','Libur Khusus Poliklinik',NULL,'active','2026-10-02 00:30:38','2026-10-02 00:30:38',NULL);
/*!40000 ALTER TABLE `doctor_leaves` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_poliklinik`
--

DROP TABLE IF EXISTS `doctor_poliklinik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doctor_poliklinik` (
  `doctor_id` bigint(20) unsigned NOT NULL,
  `poliklinik_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`doctor_id`,`poliklinik_id`),
  KEY `doctor_poliklinik_poliklinik_id_foreign` (`poliklinik_id`),
  CONSTRAINT `doctor_poliklinik_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doctor_poliklinik_poliklinik_id_foreign` FOREIGN KEY (`poliklinik_id`) REFERENCES `polikliniks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_poliklinik`
--

LOCK TABLES `doctor_poliklinik` WRITE;
/*!40000 ALTER TABLE `doctor_poliklinik` DISABLE KEYS */;
INSERT INTO `doctor_poliklinik` VALUES (1,1),(2,2),(3,1),(4,10),(5,1),(6,6),(6,9),(7,2),(8,1),(9,1),(10,7),(11,3),(12,6),(13,5),(14,12),(15,13);
/*!40000 ALTER TABLE `doctor_poliklinik` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor_schedules`
--

DROP TABLE IF EXISTS `doctor_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doctor_schedules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `doctor_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `poliklinik_id` bigint(20) unsigned DEFAULT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctor_schedules_doctor_id_foreign` (`doctor_id`),
  KEY `doctor_schedules_branch_id_foreign` (`branch_id`),
  KEY `doctor_schedules_poliklinik_id_foreign` (`poliklinik_id`),
  CONSTRAINT `doctor_schedules_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `doctor_schedules_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doctor_schedules_poliklinik_id_foreign` FOREIGN KEY (`poliklinik_id`) REFERENCES `polikliniks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor_schedules`
--

LOCK TABLES `doctor_schedules` WRITE;
/*!40000 ALTER TABLE `doctor_schedules` DISABLE KEYS */;
INSERT INTO `doctor_schedules` VALUES (1,1,1,1,1,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(2,1,1,1,2,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(3,1,1,1,3,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(4,1,1,1,4,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(5,1,1,1,5,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(6,1,1,1,6,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(7,1,1,1,7,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(8,2,1,1,1,'09:00:00','12:00:00','active','2026-09-20 21:46:55','2026-09-23 00:28:11','2026-09-23 00:28:11'),(9,2,1,1,2,'09:00:00','12:00:00','active','2026-09-20 21:46:55','2026-09-23 00:28:11','2026-09-23 00:28:11'),(10,2,1,1,4,'09:00:00','12:00:00','active','2026-09-20 21:46:55','2026-09-23 00:28:11','2026-09-23 00:28:11'),(11,2,1,1,5,'09:00:00','12:00:00','active','2026-09-20 21:46:55','2026-09-23 00:28:11','2026-09-23 00:28:11'),(12,3,1,1,1,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(13,3,1,1,3,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(14,3,1,1,4,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(15,3,1,1,6,'09:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(16,4,1,10,1,'10:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(17,4,1,10,3,'10:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(18,4,1,10,5,'10:00:00','14:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(19,5,1,1,2,'10:00:00','15:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(20,5,1,1,4,'10:00:00','15:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(21,5,1,1,6,'10:00:00','15:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(22,6,1,9,1,'13:00:00','17:00:00','active','2026-09-20 21:46:55','2026-10-01 20:41:37',NULL),(23,6,1,9,3,'13:30:00','17:00:00','active','2026-09-20 21:46:55','2026-10-01 20:42:08',NULL),(24,6,1,9,4,'13:00:00','17:00:00','inactive','2026-09-20 21:46:55','2026-10-02 00:43:52','2026-10-02 00:43:52'),(25,7,1,2,1,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(26,7,1,2,2,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(27,7,1,2,3,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(28,7,1,2,5,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(29,8,1,1,1,'14:00:00','18:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(30,8,1,1,4,'14:00:00','18:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(31,8,1,1,6,'14:00:00','18:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(32,9,1,1,2,'13:00:00','17:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(33,9,1,1,3,'13:00:00','17:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(34,9,1,1,6,'13:00:00','17:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(35,10,1,7,1,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-23 00:32:02','2026-09-23 00:32:02'),(36,10,1,7,2,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-23 00:32:02','2026-09-23 00:32:02'),(37,10,1,7,4,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-23 00:32:02','2026-09-23 00:32:02'),(38,11,1,3,1,'10:00:00','15:00:00','active','2026-09-20 21:46:55','2026-09-24 00:35:02','2026-09-24 00:35:02'),(39,11,1,3,3,'10:00:00','15:00:00','active','2026-09-20 21:46:55','2026-09-24 00:35:02','2026-09-24 00:35:02'),(40,11,1,3,5,'10:00:00','15:00:00','active','2026-09-20 21:46:55','2026-09-24 00:35:02','2026-09-24 00:35:02'),(41,11,1,3,6,'10:00:00','15:00:00','active','2026-09-20 21:46:55','2026-09-24 00:35:02','2026-09-24 00:35:02'),(42,12,1,6,2,'14:00:00','18:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(43,12,1,6,5,'14:00:00','18:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(44,13,1,5,1,'14:00:00','18:00:00','active','2026-09-20 21:46:55','2026-09-27 20:46:08','2026-09-27 20:46:08'),(45,13,1,5,3,'14:00:00','18:00:00','active','2026-09-20 21:46:55','2026-09-27 20:46:08','2026-09-27 20:46:08'),(46,13,1,5,5,'14:00:00','18:00:00','active','2026-09-20 21:46:55','2026-09-27 20:46:08','2026-09-27 20:46:08'),(47,14,1,12,2,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-27 20:47:06','2026-09-27 20:47:06'),(48,14,1,12,4,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-27 20:47:06','2026-09-27 20:47:06'),(49,14,1,12,6,'09:00:00','13:00:00','active','2026-09-20 21:46:55','2026-09-27 20:47:06','2026-09-27 20:47:06'),(50,15,1,13,3,'13:00:00','17:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(51,15,1,13,5,'13:00:00','17:00:00','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(52,2,1,2,1,'08:30:00','13:30:00','active','2026-09-23 00:28:11','2026-09-23 00:28:11',NULL),(53,2,1,2,3,'08:30:00','13:30:00','active','2026-09-23 00:28:11','2026-09-23 00:28:11',NULL),(54,2,1,2,5,'08:30:00','13:30:00','active','2026-09-23 00:28:11','2026-09-23 00:28:11',NULL),(55,2,1,2,7,'08:30:00','13:30:00','active','2026-09-23 00:28:11','2026-09-23 00:28:11',NULL),(56,10,1,7,1,'09:00:00','13:00:00','active','2026-09-23 00:32:02','2026-09-30 19:12:32','2026-09-30 19:12:32'),(57,11,1,3,4,'10:00:00','15:00:00','active','2026-09-24 00:35:02','2026-09-24 00:35:02',NULL),(58,11,1,3,5,'10:00:00','15:00:00','active','2026-09-24 00:35:02','2026-09-24 00:35:02',NULL),(59,13,1,5,1,'14:00:00','18:00:00','active','2026-09-27 20:46:08','2026-09-27 20:46:31','2026-09-27 20:46:31'),(60,13,1,5,3,'14:00:00','18:00:00','active','2026-09-27 20:46:08','2026-09-27 20:46:31','2026-09-27 20:46:31'),(61,13,1,5,5,'14:00:00','18:00:00','active','2026-09-27 20:46:08','2026-09-27 20:46:31','2026-09-27 20:46:31'),(62,13,1,5,1,'14:00:00','18:00:00','active','2026-09-27 20:46:31','2026-09-28 23:44:18',NULL),(63,13,1,5,3,'14:00:00','18:00:00','active','2026-09-27 20:46:31','2026-09-27 20:46:31',NULL),(64,13,1,5,5,'14:00:00','18:00:00','active','2026-09-27 20:46:31','2026-09-27 20:46:31',NULL),(65,14,1,12,2,'09:00:00','13:00:00','active','2026-09-27 20:47:06','2026-09-27 20:51:34','2026-09-27 20:51:34'),(66,14,1,12,4,'09:00:00','13:00:00','active','2026-09-27 20:47:06','2026-09-27 20:51:34','2026-09-27 20:51:34'),(67,14,1,12,6,'09:00:00','13:00:00','active','2026-09-27 20:47:06','2026-09-27 20:51:34','2026-09-27 20:51:34'),(68,14,1,12,2,'09:00:00','13:00:00','inactive','2026-09-27 20:51:34','2026-10-02 00:44:00','2026-10-02 00:44:00'),(69,14,1,12,4,'09:00:00','13:00:00','active','2026-09-27 20:51:34','2026-09-27 20:51:34',NULL),(70,14,1,12,6,'09:00:00','13:00:00','active','2026-09-27 20:51:34','2026-09-27 20:51:34',NULL),(71,10,1,7,1,'09:00:00','13:00:00','active','2026-09-30 19:12:32','2026-09-30 19:12:49','2026-09-30 19:12:49'),(72,10,1,7,1,'09:00:00','13:00:00','active','2026-09-30 19:12:49','2026-09-30 20:00:11','2026-09-30 20:00:11'),(73,10,1,7,1,'09:00:00','13:00:00','active','2026-09-30 20:00:11','2026-09-30 20:00:11',NULL);
/*!40000 ALTER TABLE `doctor_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doctors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `specialization_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `doctors_specialization_id_foreign` (`specialization_id`),
  KEY `doctors_branch_id_foreign` (`branch_id`),
  CONSTRAINT `doctors_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `doctors_specialization_id_foreign` FOREIGN KEY (`specialization_id`) REFERENCES `specializations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,'dr. Siti Asri Yolanda',1,1,'+62 811-7529-798','dr-siti-asri-yolanda@narayhospital.com',NULL,'dr. Siti Asri Yolanda adalah dokter jaga UGD Naray Hospital yang berdedikasi melayani pertolongan pertama pasien gawat darurat dengan cepat, tepat, dan penuh empati.\n\nPendidikan: Fakultas Kedokteran | Sertifikasi ACLS & ATLS Emergency Medicine\nSub-Spesialisasi: Penanganan Kegawatdaruratan Medis, Triase UGD, Konsultasi Umum','active','2026-09-20 21:46:55','2026-09-30 19:58:10',NULL),(2,'dr. Rizka Nadia, Sp.PD',2,1,'+62 811-7529-798','dr-rizka-nadia-sppd@narayhospital.com',NULL,'dr. Rizka Nadia adalah spesialis penyakit dalam yang berfokus pada manajemen penyakit kronis dan perawatan holistik organ dalam pasien.\n\nPendidikan: Universitas Negeri Terkemuka | Spesialis Penyakit Dalam (Sp.PD)\nSub-Spesialisasi: Diabetes Melitus, Hipertensi, Gangguan Lambung & Hati, Penyakit Infeksi','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(3,'drg. Dwi Astari Yahfis',3,1,'+62 811-7529-798','drg-dwi-astari-yahfis@narayhospital.com',NULL,'drg. Dwi Astari memberikan perawatan gigi yang ramah dan nyaman untuk seluruh anggota keluarga, mulai dari anak-anak hingga dewasa.\n\nPendidikan: Fakultas Kedokteran Gigi | Sertifikasi Perawatan Gigi Modern\nSub-Spesialisasi: Pembersihan Karang Gigi (Scalling), Tambal Gigi, Estetika Gigi','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(4,'dr. Jemmy Fandri, Sp.P',4,1,'+62 811-7529-798','dr-jemmy-fandri-spp@narayhospital.com',NULL,'Pakar kesehatan pernapasan yang menangani berbagai keluhan sesak napas, batuk kronis, dan gangguan fungsi paru.\n\nPendidikan: Pendidikan Dokter Spesialis Paru (Sp.P)\nSub-Spesialisasi: Asma, PPOK, Infeksi Paru, Tuberkulosis, Skrining Paru','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(5,'dr. Jefrizal Wirman, Sp.D.V.E',5,1,'+62 811-7529-798','dr-jefrizal-wirman-spdve@narayhospital.com',NULL,'Melayani perawatan kesehatan kulit secara menyeluruh dengan pendekatan medis terpercaya untuk hasil sehat alami.\n\nPendidikan: Spesialis Dermatologi & Venereologi (Sp.D.V.E)\nSub-Spesialisasi: Penyakit Kulit Klinis, Dermatologi Alergi, Anti-Aging & Estetika','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(6,'dr. Diflayzer, Sp.THT-KL',6,1,'+62 811-7529-798','dr-diflayzer-sptht-kl@narayhospital.com',NULL,'Pakar THT dengan keahlian diagnostik endoskopi telinga, hidung, dan tenggorokan untuk penanganan presisi.\n\nPendidikan: Pendidikan Dokter Spesialis THT-KL\nSub-Spesialisasi: Endoskopi THT, Gangguan Pendengaran, Sinusitis, Radang Amandel','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(7,'dr. M. Riki Fachrozi, M.Ked(Ped)., Sp.A',7,1,'+62 811-7529-798','dr-m-riki-fachrozi-mkedped-spa@narayhospital.com',NULL,'dr. Riki dikenal telaten dan ramah terhadap anak, mendampingi orang tua menjaga kesehatan optimal si kecil.\n\nPendidikan: Magister Kedokteran Pediatri & Dokter Spesialis Anak (Sp.A)\nSub-Spesialisasi: Kesehatan Bayi & Balita, Imunisasi Anak, Infeksi Pediatrik, Tumbuh Kembang','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(8,'dr. Ihsan, Sp.B',8,1,'+62 811-7529-798','dr-ihsan-spb@narayhospital.com',NULL,'Spesialis bedah berpengalaman yang mengutamakan keselamatan dan teknik operasi presisi untuk masa pemulihan cepat.\n\nPendidikan: Pendidikan Dokter Spesialis Bedah (Sp.B)\nSub-Spesialisasi: Bedah Saluran Cerna, Usus Buntu (Apendisitis), Hernia, Tumor Jinak Kulit','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(9,'dr. Murdia, Sp.PD',2,1,'+62 811-7529-798','dr-murdia-sppd@narayhospital.com',NULL,'Berpengalaman menangani berbagai keluhan penyakit dalam kronis dengan pendekatan komunikatif dan solutif.\n\nPendidikan: Pendidikan Dokter Spesialis Penyakit Dalam (Sp.PD)\nSub-Spesialisasi: Penyakit Dalam Umum, Hipertensi, Kolesterol, Penyakit Ginjal & Lambung','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(10,'dr. Ahmad Musa, Sp.M',9,1,'+62 811-7529-798','dr-ahmad-musa-spm@narayhospital.com','/storage/uploads/doctors/l9urbPLpXF70QIGPUR5eAvGhc0LLjmSLrlcfhagY.webp','Pakar kesehatan mata yang berkomitmen menjaga dan memulihkan kualitas penglihatan pasien di segala usia.','active','2026-09-20 21:46:55','2026-09-30 20:00:11',NULL),(11,'dr. Sofyan Qadri Rozi Dalimunthe, Sp.OG',10,1,'+62 811-7529-798','dr-sofyan-qadri-rozi-dalimunthe-spog@narayhospital.com',NULL,'Mendampingi ibu dari awal masa kehamilan hingga proses persalinan dengan penuh perhatian dan rasa aman.','active','2026-09-20 21:46:55','2026-09-24 00:35:02',NULL),(12,'drg. Depsi Indri Papilaya Simanjuntak, Sp.B.M.M',3,1,'+62 811-7529-798','drg-depsi-indri-papilaya-simanjuntak-spbmm@narayhospital.com',NULL,'Ahli bedah mulut yang menangani operasi gigi impaksi dan rekonstruksi rahang dengan prosedur steril berstandar tinggi.\n\nPendidikan: Pendidikan Dokter Spesialis Bedah Mulut & Maksilofasial (Sp.B.M.M)\nSub-Spesialisasi: Operasi Gigi Bungsu (Odontektomi), Trauma Rahang, Kista & Tumor Mulut','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(13,'dr. Christian Yosaputra, Sp.JP, FIHA',11,1,'+62 811-7529-798','dr-christian-yosaputra-spjp-fiha@narayhospital.com',NULL,'Dokter spesialis jantung yang berfokus pada pencegahan penyakit kardiovaskular dan penanganan aritmia serta jantung koroner.','active','2026-09-20 21:46:55','2026-09-27 20:46:31',NULL),(14,'dr. Asril Tanjung, Sp.N',12,1,'+62 811-7529-798','dr-asril-tanjung-spn@narayhospital.com',NULL,'Spesialis saraf yang berpengalaman dalam penanganan rehabilitasi stroke dan gangguan sistem saraf tepi maupun pusat.','active','2026-09-20 21:46:55','2026-09-27 20:51:34',NULL),(15,'dr. Levina Mutia, Sp.KJ',13,1,'+62 811-7529-798','dr-levina-mutia-spkj@narayhospital.com',NULL,'Menyediakan ruang konsultasi yang aman dan nyaman untuk membantu kesehatan emosional dan psikologis pasien.\n\nPendidikan: Pendidikan Dokter Spesialis Kedokteran Jiwa (Sp.KJ)\nSub-Spesialisasi: Gangguan Kecemasan (Anxiety), Depresi, Gangguan Tidur (Insomnia), Terapi Mental','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL);
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facilities`
--

DROP TABLE IF EXISTS `facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facilities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('basic','advanced') NOT NULL DEFAULT 'basic',
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `facilities_branch_id_foreign` (`branch_id`),
  CONSTRAINT `facilities_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facilities`
--

LOCK TABLES `facilities` WRITE;
/*!40000 ALTER TABLE `facilities` DISABLE KEYS */;
INSERT INTO `facilities` VALUES (1,'Unit Gawat Darurat (UGD) 24 Jam','advanced','Kategori: Gawat Darurat & Trauma\nPelayanan gawat darurat 24 jam dengan tim dokter jaga dan perawat bersertifikasi kegawatdaruratan, dilengkapi ruang triase, ruang resusitasi, dan armada ambulans siaga cepat.',NULL,'active',1,'2026-09-20 21:50:59','2026-09-20 21:50:59',NULL),(2,'Ruang Perawatan Intensif (ICU Staments)','advanced','Kategori: Perawatan Kritis\nKapasitas 7 tempat tidur dengan bedside monitor canggih, ventilator mekanik, sistem pengaturan udara steril, dan pengawasan intensif dokter spesialis anestesi serta perawat ICU.',NULL,'active',1,'2026-09-20 21:50:59','2026-09-20 21:50:59',NULL),(3,'Kamar Operasi Bedah Steril','advanced','Ruang tindakan bedah berstandar sterilisasi tinggi dengan filter udara HEPA untuk prosedur bedah umum, kebidanan/caesar, dan bedah mulut secara aman.','/storage/uploads/facilities/qrtzH6LJYIvtTWhscnddrh7F9pZBM2mH1hDYDQ2f.webp','active',1,'2026-09-20 21:50:59','2026-09-30 23:44:43',NULL),(4,'Laboratorium Patologi Klinik 24 Jam','basic','Pemeriksaan darah rutin, kimia darah, profil lemak, fungsi hati, fungsi ginjal, tes urin, dan analisa mikrobiologi dengan alat otomatis akurat.f',NULL,'active',1,'2026-09-20 21:50:59','2026-09-27 21:44:57',NULL),(5,'Unit Radiologi & Rontgen Digital','basic','Kategori: Pencitraan Medis\nPemeriksaan foto rontgen dada, tulang, dan sendi dengan dosis radiasi rendah yang menghasilkan citra digital tajam untuk diagnosa dokter spesialis.',NULL,'active',1,'2026-09-20 21:50:59','2026-09-20 21:50:59',NULL),(6,'Layanan Khusus Geriatri (Lansia)','basic','Kategori: Layanan Unggulan\nLayanan terpadu yang dirancang khusus untuk memenuhi kebutuhan fisik, emosional, dan medis para lansia dengan dokter spesialis dan perawat yang sabar serta penuh kasih.',NULL,'active',1,'2026-09-20 21:50:59','2026-09-20 21:50:59',NULL);
/*!40000 ALTER TABLE `facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospital_infos`
--

DROP TABLE IF EXISTS `hospital_infos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hospital_infos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `emergency_hotline` varchar(30) NOT NULL,
  `operating_hours` varchar(255) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `banner_image_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospital_infos`
--

LOCK TABLES `hospital_infos` WRITE;
/*!40000 ALTER TABLE `hospital_infos` DISABLE KEYS */;
INSERT INTO `hospital_infos` VALUES (1,'Naray Hospital','Jl. Dr. Wahidin No.98-99, Purnama, Kec. Dumai Barat, Kota Dumai, Riau 28823','+62 811-7529-798','admin@narayhospital.com','+62 853-6339-5383','IGD & Rawat Inap 24 Jam | Poliklinik Spesialis: Senin - Sabtu 09:00 - 21:00 WIB','/mbg.png','https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80','Naray Hospital adalah simbol dedikasi, inovasi, dan kepercayaan dalam layanan kesehatan modern. Dilengkapi dengan fasilitas medis terdepan, tim dokter spesialis berpengalaman, dan teknologi diagnostik mutakhir, kami menghadirkan pengalaman perawatan yang personal, profesional, dan terukur. Kami melayani dengan presisi klinis dan sentuhan kemanusiaan, melalui jaringan poliklinik spesialis yang dirancang untuk memenuhi berbagai kebutuhan medis Anda — dari pencegahan hingga pemulihan.','2026-09-20 21:46:55','2026-09-20 21:46:55');
/*!40000 ALTER TABLE `hospital_infos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insurance_partners`
--

DROP TABLE IF EXISTS `insurance_partners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `insurance_partners` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insurance_partners`
--

LOCK TABLES `insurance_partners` WRITE;
/*!40000 ALTER TABLE `insurance_partners` DISABLE KEYS */;
INSERT INTO `insurance_partners` VALUES (1,'Bank Mandiri',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(2,'Asuransi Sinarmas',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(3,'Bank BRI',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(4,'Palang Merah Indonesia (PMI)',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(5,'Pantai Hospital International',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(6,'Apical Group',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(7,'Laboratorium Thamrin',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(8,'Bank OCBC',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(9,'Mandiri Inhealth',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(10,'Bank BNI',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(11,'Laboratorium Klinik Prodia',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(12,'AdMedika Third Party',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(13,'BPJS Kesehatan',NULL,'Mitra Asuransi Resmi Naray Hospital','active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL);
/*!40000 ALTER TABLE `insurance_partners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mcu_packages`
--

DROP TABLE IF EXISTS `mcu_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mcu_packages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mcu_packages_slug_unique` (`slug`),
  KEY `mcu_packages_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mcu_packages`
--

LOCK TABLES `mcu_packages` WRITE;
/*!40000 ALTER TABLE `mcu_packages` DISABLE KEYS */;
INSERT INTO `mcu_packages` VALUES (1,'Paket Sehat Geriatri (Khusus Usia Lanjut)','mcu-geriatri','Pemeriksaan fungsi organ vital, kadar gula darah, kolesterol, dan tulang untuk lansia\n- Pemeriksaan Fisik oleh Dokter Spesialis Penyakit Dalam\n- Hematologi Rutin Lengkap\n- Profil Lemak: Kolesterol Total, HDL, LDL, Trigliserida\n- Gula Darah Puasa & HbA1c\n- Fungsi Ginjal: Ureum & Kreatinin\n- Fungsi Hati: SGOT, SGPT\n- Rontgen Dada (Thorax)\n- Elektrokardiogram (EKG Jantung)\n- Konsultasi Nutrisi & Pola Aktivitas Sehat Lansia',1250000.00,NULL,'active','2026-09-20 21:46:55','2026-09-21 00:13:14',NULL),(2,'Paket Skrining Sehat Naray (Umum)','mcu-skrining-rutin','Pemeriksaan dasar kesehatan untuk deteksi dini penyakit umum\n- Konsultasi Dokter Umum & Cek Tensi\n- Darah Lengkap 18 Parameter\n- Kolesterol Total & Trigliserida\n- Gula Darah Sewaktu / Puasa\n- Asam Urat & Fungsi Ginjal Dasar\n- Urinalisis Lengkap (Air Seni)\n- Rontgen Dada (Foto Thorax)\n- Resume Medis & Edukasi Kesehatan',850000.00,NULL,'active','2026-09-20 21:46:55','2026-09-21 00:13:14',NULL),(3,'Paket Deteksi Dini Jantung Naray','mcu-jantung-sehat','Skrining kesehatan pembuluh darah dan irama jantung oleh Dokter Spesialis Jantung\n- Konsultasi dr. Christian Yosaputra, Sp.JP, FIHA\n- Pemeriksaan EKG Resting 12-Lead\n- Treadmill Stress Test\n- Ekokardiografi (USG Jantung)\n- Profil Lipid Lengkap\n- Fungsi Ginjal & Enzim Jantung Dasar\n- Laporan Kesehatan Jantung Komprehensif',2100000.00,NULL,'active','2026-09-20 21:46:55','2026-09-21 00:13:14',NULL),(4,'Paket Skrining Pra-Nikah Naray','mcu-pranikah','Pemeriksaan genetik, penyakit menular, dan kesiapan organ reproduksi\n- Pemeriksaan Golongan Darah & Rhesus\n- Hematologi Rutin & Skrining Thalasemia\n- Skrining Hepatitis B (HBsAg) & Infeksi Menular\n- Pemeriksaan Fisik Kebidanan & Kandungan (Sp.OG)\n- Konsultasi Dokter Pra-Nikah & Vaksinasi Pranikah\n- Sertifikat Bebas Penyakit Menular Resmi',1950000.00,NULL,'active','2026-09-20 21:46:55','2026-09-21 00:13:14',NULL),(5,'cuci darah','cuci-darah','- iijo\n- kji\n- ertfd\n- ttrtr',10000000.00,NULL,'active','2026-10-02 00:55:31','2026-10-02 00:55:32',NULL);
/*!40000 ALTER TABLE `mcu_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('image','video') NOT NULL,
  `url` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `uploaded_by` bigint(20) unsigned NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `media_type_index` (`type`),
  KEY `media_category_id_index` (`category_id`),
  KEY `media_uploaded_by_index` (`uploaded_by`),
  KEY `media_status_index` (`status`),
  CONSTRAINT `media_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `media_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `media_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `admins` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES (1,'image','','Pemeriksaan Kesehatan Gratis saat Bazaar Sekolah Maitreyawira – 18 Mei 2025','Kegiatan Sosial / CSR',1,1,'active','2026-09-20 21:47:48','2026-09-20 21:47:48',NULL),(2,'image','','Pembagian Doorprize untuk Peserta Senam + Health Talk Naray Hospital','Edukasi Komunitas Sehat r',1,1,'active','2026-09-20 21:47:48','2026-09-27 22:04:59',NULL),(3,'image','','Pelayanan Geriatri & Kunjungan Kasih Pasien Lanjut Usia','Pelayanan Geriatrid',1,1,'active','2026-09-20 21:47:48','2026-09-27 21:45:10',NULL),(4,'video','https://www.youtube.com/embed/60yNtDcAykw','Company Profile Naray Hospital - Rumah Sakit Modern & Nyaman di Dumai','Mengenal lebih dekat fasilitas, dokter spesialis, dan komitmen pelayanan Naray Hospital di Kota Dumai, Riau.',1,1,'active','2026-09-22 19:52:18','2026-09-22 19:52:18',NULL),(5,'video','https://www.youtube.com/embed/1yvh_sdLpEU','Pelayanan Geriatri Naray Hospital - Peduli Kesehatan Lansia','Dedikasi kami dalam memberikan perawatan yang tulus dan berkualitas tinggi bagi para pasien usia lanjut.',1,1,'active','2026-09-22 19:52:18','2026-09-22 19:52:18',NULL);
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_categories`
--

DROP TABLE IF EXISTS `media_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `media_categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_categories`
--

LOCK TABLES `media_categories` WRITE;
/*!40000 ALTER TABLE `media_categories` DISABLE KEYS */;
INSERT INTO `media_categories` VALUES (1,'Galeri Aktivitas','galeri-aktivitas','2026-09-20 21:47:48','2026-09-20 21:47:48');
/*!40000 ALTER TABLE `media_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_10_01_000001_create_admins_table',1),(5,'2024_10_01_000002_create_patients_table',1),(6,'2024_10_01_000003_create_hospital_infos_table',1),(7,'2024_10_01_000004_create_branches_table',1),(8,'2024_10_01_000005_create_specializations_table',1),(9,'2024_10_01_000006_create_doctors_table',1),(10,'2024_10_01_000007_create_polikliniks_table',1),(11,'2024_10_01_000008_create_facilities_table',1),(12,'2024_10_01_000009_create_insurance_partners_table',1),(13,'2024_10_01_000010_create_article_categories_table',1),(14,'2024_10_01_000011_create_articles_table',1),(15,'2024_10_01_000012_create_media_categories_table',1),(16,'2024_10_01_000013_create_doctor_poliklinik_table',1),(17,'2024_10_01_000014_create_doctor_schedules_table',1),(18,'2024_10_01_000015_create_room_types_table',1),(19,'2024_10_01_000016_create_rooms_table',1),(20,'2024_10_01_000017_create_room_facility_table',1),(21,'2024_10_01_000018_create_room_bookings_table',1),(22,'2024_10_01_000019_create_appointments_table',1),(23,'2024_10_01_000020_create_services_table',1),(24,'2024_10_01_000021_create_center_of_excellences_table',1),(25,'2024_10_01_000022_create_media_table',1),(26,'2024_10_01_000023_create_mcu_packages_table',1),(27,'2026_09_15_071039_create_personal_access_tokens_table',1),(28,'2026_09_29_000001_create_doctor_leaves_table',2),(29,'2026_09_29_000002_add_doctor_schedule_id_to_doctor_leaves_table',3),(30,'2026_10_02_000001_add_capacity_to_room_types_table',4);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(30) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,'Budi Santoso',NULL,'08123456789','2026-09-20 21:54:20','2026-09-20 21:54:20',NULL),(2,'Muhammad harel','mharel023@gmail.com','082391898949','2026-09-21 00:58:46','2026-09-21 00:58:46',NULL);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\Admin',1,'admin-token','d1601d79d39440a11454400982fa17bb22ef6411bdc0aaf5c0365fff32f0def5','[\"*\"]','2026-09-21 00:28:18',NULL,'2026-09-21 00:22:50','2026-09-21 00:28:18'),(3,'App\\Models\\Admin',1,'admin-token','cb1820d1131283cbd7ad40a19101070c9c4c0a55d46de3b6f52e7bd7f45156a9','[\"*\"]','2026-09-21 00:48:56',NULL,'2026-09-21 00:48:54','2026-09-21 00:48:56'),(4,'App\\Models\\Admin',1,'admin-token','b9c13aaf964ec611af4782cc38a9fe9d246ad608d0c852748bd3633b4e46aa06','[\"*\"]','2026-09-21 00:49:20',NULL,'2026-09-21 00:49:18','2026-09-21 00:49:20'),(10,'App\\Models\\Admin',1,'admin-token','1d07f17897debb6bec1aed8a865accf62400755002142ac3b8a33c740dc392d3','[\"*\"]','2026-09-22 20:39:40',NULL,'2026-09-22 20:39:39','2026-09-22 20:39:40'),(11,'App\\Models\\Admin',1,'admin-token','e0b8638f070c2c0b407da0e517a79988cccb50e49e64217bfb6c5bd7a3cd0104','[\"*\"]','2026-09-22 21:01:18',NULL,'2026-09-22 21:01:18','2026-09-22 21:01:18'),(14,'App\\Models\\Admin',1,'admin-token','c39bf73c33aca44930b6d8f9d187fb0abdcf662c3e9ebd6508bea210f8940c1b','[\"*\"]',NULL,NULL,'2026-09-24 00:33:41','2026-09-24 00:33:41'),(16,'App\\Models\\Admin',1,'admin-token','8559908603d0b7be1af2b21805b8cc92fcb40bfc3400119b3e1722ded625ba93','[\"*\"]','2026-09-27 20:04:33',NULL,'2026-09-27 19:51:54','2026-09-27 20:04:33'),(18,'App\\Models\\Admin',1,'admin-token','178cb6f0486f016f3c4b4f94b0266a6cfa2b1997bb2cb3299a722efc486036ec','[\"*\"]','2026-09-27 21:40:30',NULL,'2026-09-27 21:34:47','2026-09-27 21:40:30'),(21,'App\\Models\\Admin',1,'admin-token','8480419a3eeedb4d620426ca2102f7458210b7637cbd61e9aae9ee2639eaa2c7','[\"*\"]','2026-09-30 19:57:19',NULL,'2026-09-30 19:57:18','2026-09-30 19:57:19'),(22,'App\\Models\\Admin',1,'admin-token','cf5ce541aa38e01a01e03fa21bb75c06ca6d071317be2671cce6ee42943a6fcc','[\"*\"]',NULL,NULL,'2026-09-30 21:02:10','2026-09-30 21:02:10'),(23,'App\\Models\\Admin',1,'admin-token','10ecaa2432f883ec65734b97154c3bcaa269fe5adb54f8065f15c4025aeb04f8','[\"*\"]','2026-09-30 21:03:05',NULL,'2026-09-30 21:03:05','2026-09-30 21:03:05'),(24,'App\\Models\\Admin',1,'admin-token','574ce583eeb1fa6806734a79ec535c2cd78f09973649080c5aa5041b196c385a','[\"*\"]','2026-10-01 20:49:18',NULL,'2026-10-01 20:14:01','2026-10-01 20:49:18'),(25,'App\\Models\\Admin',1,'admin-token','96ec2cf3ae96e45b9e08ec006eceb11e939b074457788015736fdd75bb770784','[\"*\"]','2026-10-01 20:49:28',NULL,'2026-10-01 20:49:26','2026-10-01 20:49:28'),(30,'App\\Models\\Admin',1,'admin-token','bb961df3b65c255f69360889cf157acff6dca905635977356cccac5367290c71','[\"*\"]','2026-10-02 01:34:57',NULL,'2026-10-02 00:55:30','2026-10-02 01:34:57');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `polikliniks`
--

DROP TABLE IF EXISTS `polikliniks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `polikliniks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `polikliniks_branch_id_foreign` (`branch_id`),
  CONSTRAINT `polikliniks_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `polikliniks`
--

LOCK TABLES `polikliniks` WRITE;
/*!40000 ALTER TABLE `polikliniks` DISABLE KEYS */;
INSERT INTO `polikliniks` VALUES (1,'Poliklinik Umum','Layanan diagnostik dan pengobatan pertama untuk keluhan kesehatan umum.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(2,'Poliklinik Anak (Pediatrik)','Perawatan komprehensif kesehatan bayi dan anak, imunisasi, dan pemantauan tumbuh kembang.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(3,'Poliklinik Obgyn (Kebidanan & Kandungan)','Pemeriksaan kehamilan, USG 4D, persalinan, dan kesehatan reproduksi wanita.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(4,'Poliklinik Penyakit Dalam','Diagnosis dan penanganan penyakit organ dalam seperti diabetes, hipertensi, hati, dan ginjal.',1,NULL,'active','2026-09-20 21:46:55','2026-09-30 20:34:18','2026-09-30 20:34:18'),(5,'Poliklinik Jantung & Pembuluh Darah','Pemeriksaan fungsi jantung, EKG, treadmill, dan pencegahan risiko kardiovaskular.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(6,'Poliklinik Bedah','Layanan konsultasi dan tindakan bedah umum serta bedah khusus berpengalaman.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(7,'Poliklinik Mata','Pemeriksaan kesehatan penglihatan, skrining katarak, glaukoma, dan gangguan refraksi.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(8,'Poliklinik Gigi & Bedah Mulut','Perawatan gigi, tambal, scalling, pencabutan gigi impaksi, dan estetika senyum.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(9,'Poliklinik THT-KL','Penanganan gangguan pendengaran, sinus, amandel, dan saluran pernapasan atas.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(10,'Poliklinik Paru & Pernapasan','Pemeriksaan asma, PPOK, infeksi paru, dan spirometri kesehatan pernapasan.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(11,'Poliklinik Kulit & Kelamin (D.V.E)','Perawatan penyakit kulit klinis, alergi, jerawat, dan estetika medis.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(12,'Poliklinik Saraf (Neurologi)','Penanganan stroke, vertigo, migrain, nyeri saraf terjepit, dan gangguan saraf.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(13,'Poliklinik Psikiatri (Kesehatan Jiwa)','Konsultasi kesehatan mental, penanganan kecemasan, depresi, dan terapi psikologis.',1,NULL,'active','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(14,'Poli Peyakit dalam',NULL,1,NULL,'active','2026-10-01 20:33:18','2026-10-01 20:33:18',NULL);
/*!40000 ALTER TABLE `polikliniks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_bookings`
--

DROP TABLE IF EXISTS `room_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `room_bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `room_id` bigint(20) unsigned NOT NULL,
  `patient_id` bigint(20) unsigned NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `status` enum('pending','confirmed','rejected','cancelled','checked_in','checked_out') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_bookings_room_id_foreign` (`room_id`),
  KEY `room_bookings_patient_id_foreign` (`patient_id`),
  CONSTRAINT `room_bookings_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`),
  CONSTRAINT `room_bookings_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_bookings`
--

LOCK TABLES `room_bookings` WRITE;
/*!40000 ALTER TABLE `room_bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_facility`
--

DROP TABLE IF EXISTS `room_facility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `room_facility` (
  `room_id` bigint(20) unsigned NOT NULL,
  `facility_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`room_id`,`facility_id`),
  KEY `room_facility_facility_id_foreign` (`facility_id`),
  CONSTRAINT `room_facility_facility_id_foreign` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `room_facility_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_facility`
--

LOCK TABLES `room_facility` WRITE;
/*!40000 ALTER TABLE `room_facility` DISABLE KEYS */;
/*!40000 ALTER TABLE `room_facility` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_types`
--

DROP TABLE IF EXISTS `room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `room_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `capacity` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price_per_night` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_types_branch_id_foreign` (`branch_id`),
  CONSTRAINT `room_types_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_types`
--

LOCK TABLES `room_types` WRITE;
/*!40000 ALTER TABLE `room_types` DISABLE KEYS */;
INSERT INTO `room_types` VALUES (1,'Pistillum Suite (VIP / VVIP)','1 Pasien per Kamar','- Tempat Tidur Elektrik\n- Kamar Mandi Pribadi\n- Nurse Call 24 Jam\n- AC & Wi-Fi',500000.00,'/storage/uploads/rooms/t86h6byAPNNbxedD8th6bYZoUF6jevuBwVBObKD6.webp','active',1,'2026-09-20 21:46:55','2026-10-02 01:27:34'),(2,'Staments 1 – Ruang ICU (Intensive Care Unit)','7 Bed Pasien Intensif','Kamar Mandi Pribadi\nNurse Call 24 Jam\nAC & Wi-FiTempat Tidur Elektrik\n\n\n- Kamar Mandi Pribadi\n- Nurse Call 24 Jam\n- AC & Wi-FiTempat Tidur Elektrik\n- Kamar Mandi Pribadi\n- Nurse Call 24 Jam\n- AC & Wi-FiTempat Tidur Elektrik',500000.00,NULL,'active',1,'2026-09-20 21:46:55','2026-10-02 01:27:34'),(3,'Green Petals (Kamar Rawat Kelas 1)','1 - 2 Pasien per Kamar','\n',500000.00,NULL,'active',1,'2026-09-20 21:46:55','2026-10-02 01:27:34'),(4,'Red Petals (Kamar Rawat Kelas 2)','1 - 2 Pasien per Kamar','Fasilitas lengkap',500000.00,NULL,'active',1,'2026-09-20 21:46:55','2026-10-02 01:27:34'),(5,'Seroja (Kamar Rawat Inap Reguler)','2 Tempat Tidur Pasien per Kamar','\n',500000.00,NULL,'active',1,'2026-09-20 21:46:55','2026-10-02 01:27:34'),(6,'Ruang Rawat Isolasi Khusus','3 Bed Pasien Isolasi','\n',500000.00,NULL,'active',1,'2026-09-20 21:46:55','2026-10-02 01:27:34'),(7,'user','1 - 2 Pasien per Kamar',NULL,2000000.00,NULL,'active',1,'2026-09-21 01:03:39','2026-10-02 01:27:34');
/*!40000 ALTER TABLE `room_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `room_number` varchar(255) NOT NULL,
  `room_type_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `floor` varchar(255) DEFAULT NULL,
  `status` enum('available','occupied','maintenance') NOT NULL DEFAULT 'available',
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_branch_id_room_number_unique` (`branch_id`,`room_number`),
  KEY `rooms_room_type_id_foreign` (`room_type_id`),
  CONSTRAINT `rooms_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `rooms_room_type_id_foreign` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'101',1,1,'Lantai 1','available','https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(2,'102',1,1,'Lantai 1','available','https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(3,'103',1,1,'Lantai 1','available','https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(4,'201',2,1,'Lantai 2','available','https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(5,'202',2,1,'Lantai 2','available','https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(6,'203',2,1,'Lantai 2','available','https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(7,'301',3,1,'Lantai 3','available','https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(8,'302',3,1,'Lantai 3','available','https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(9,'303',3,1,'Lantai 3','available','https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(10,'401',4,1,'Lantai 4','available','https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(11,'402',4,1,'Lantai 4','available','https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(12,'403',4,1,'Lantai 4','available','https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(13,'501',5,1,'Lantai 5','available','https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(14,'502',5,1,'Lantai 5','available','https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(15,'503',5,1,'Lantai 5','available','https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(16,'601',6,1,'Lantai 6','available','https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(17,'602',6,1,'Lantai 6','available','https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(18,'603',6,1,'Lantai 6','available','https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `services_slug_unique` (`slug`),
  KEY `services_status_index` (`status`),
  KEY `services_branch_id_index` (`branch_id`),
  CONSTRAINT `services_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specializations`
--

DROP TABLE IF EXISTS `specializations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `specializations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `specializations_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specializations`
--

LOCK TABLES `specializations` WRITE;
/*!40000 ALTER TABLE `specializations` DISABLE KEYS */;
INSERT INTO `specializations` VALUES (1,'UGD & Dokter Umum','ugd-dokter-umum','Layanan medis bidang UGD & Dokter Umum','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(2,'Penyakit Dalam','penyakit-dalam','Layanan medis bidang Penyakit Dalam','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(3,'Gigi & Mulut','gigi-mulut','Layanan medis bidang Gigi & Mulut','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(4,'Paru & Pernapasan','paru-pernapasan','Layanan medis bidang Paru & Pernapasan','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(5,'Kulit & Kelamin','kulit-kelamin','Layanan medis bidang Kulit & Kelamin','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(6,'THT-KL','tht-kl','Layanan medis bidang THT-KL','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(7,'Anak & Pediatrik','anak-pediatrik','Layanan medis bidang Anak & Pediatrik','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(8,'Bedah','bedah','Layanan medis bidang Bedah','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(9,'Mata','mata','Layanan medis bidang Mata','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(10,'Kebidanan & Kandungan','kebidanan-kandungan','Layanan medis bidang Kebidanan & Kandungan','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(11,'Jantung & Pembuluh Darah','jantung-pembuluh-darah','Layanan medis bidang Jantung & Pembuluh Darah','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(12,'Saraf & Neurologi','saraf-neurologi','Layanan medis bidang Saraf & Neurologi','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(13,'Psikiatri & Jiwa','psikiatri-jiwa','Layanan medis bidang Psikiatri & Jiwa','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL),(14,'Geriatri & Rehabilitasi','geriatri-rehabilitasi','Layanan medis bidang Geriatri & Rehabilitasi','2026-09-20 21:46:55','2026-09-20 21:46:55',NULL);
/*!40000 ALTER TABLE `specializations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-17 11:20:38
