-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: accessory_as
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `accessory_as`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `accessory_as` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `accessory_as`;

--
-- Table structure for table `__drizzle_migrations`
--

DROP TABLE IF EXISTS `__drizzle_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text COLLATE utf8mb4_persian_ci NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `__drizzle_migrations`
--

LOCK TABLES `__drizzle_migrations` WRITE;
/*!40000 ALTER TABLE `__drizzle_migrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `__drizzle_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `account_id` text COLLATE utf8mb4_persian_ci NOT NULL,
  `provider_id` text COLLATE utf8mb4_persian_ci NOT NULL,
  `access_token` text COLLATE utf8mb4_persian_ci,
  `refresh_token` text COLLATE utf8mb4_persian_ci,
  `access_token_expires_at` timestamp NULL DEFAULT NULL,
  `refresh_token_expires_at` timestamp NULL DEFAULT NULL,
  `scope` text COLLATE utf8mb4_persian_ci,
  `id_token` text COLLATE utf8mb4_persian_ci,
  `password` text COLLATE utf8mb4_persian_ci,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `account_user_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('ICz2VVquVR2vKJKB0I8pLGuuDFyAJcdp','6oTdy4rK0JSmxI2VQCDtZFkJonweHazB','6oTdy4rK0JSmxI2VQCDtZFkJonweHazB','credential',NULL,NULL,NULL,NULL,NULL,NULL,'14ef6cbee8c81ecc9029e72a5b9e8ee5:ac67fb40cae443db9e8ecf62897f13fe1e1f7de2a846dc5699cba445287ea53ea3d29d29e2b7ba3eab77745ea5e324dd869487c0bcff934b7580f41ce3863026','2026-10-08 14:17:14','2026-10-08 14:17:14');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `province` varchar(50) COLLATE utf8mb4_persian_ci NOT NULL,
  `city` varchar(50) COLLATE utf8mb4_persian_ci NOT NULL,
  `detail` text COLLATE utf8mb4_persian_ci NOT NULL,
  `postal` varchar(20) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_persian_ci NOT NULL,
  `label` varchar(50) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `recipient` varchar(100) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `lat` varchar(30) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `lng` varchar(30) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `addresses_user_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attributes`
--

DROP TABLE IF EXISTS `attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attributes` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_persian_ci NOT NULL,
  `label` varchar(50) COLLATE utf8mb4_persian_ci NOT NULL,
  `value` varchar(50) COLLATE utf8mb4_persian_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attributes`
--

LOCK TABLES `attributes` WRITE;
/*!40000 ALTER TABLE `attributes` DISABLE KEYS */;
INSERT INTO `attributes` VALUES ('1c3300b0-7c9d-4148-a7de-ce7705e79090','color','آبی','آبی'),('2d1ffe4f-5c3c-4875-a166-ae68d8da586f','size','25','25'),('3fdb5031-114f-466a-9b9a-762bf653d587','color','سفید','سفید'),('44b343e1-45ca-4e4b-a24f-be6f021e6adc','size','24','24'),('55b14652-a26e-408a-9b75-04fc80a761e5','color','نقره‌ای','نقره‌ای'),('72bafb49-7cc7-404f-9a02-ab8cd12cb043','size','22','22'),('84092274-3526-45b4-9f34-04c744a944cb','size','23','23'),('a4273c7c-d75e-41bd-b320-636420373afb','color','صورتی','صورتی'),('a4d67279-06ca-4bd5-8058-2df89c8c5659','color','بنفش','بنفش'),('cde040ec-904b-41dc-990b-775c7cfa6d23','size','20','20'),('e7117a08-7b58-4ac8-b41f-5e4f3e51f1ec','size','21','21'),('e785504b-4a94-419c-8713-bc309211c2f8','color','طلایی','طلایی');
/*!40000 ALTER TABLE `attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `slug` varchar(100) COLLATE utf8mb4_persian_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_persian_ci NOT NULL,
  `parent_id` varchar(36) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('048e2042-6239-4098-a7bb-8708fc0e8e40','anklet','پابند',NULL),('0b48c154-f090-444c-b8d4-7aba895528d7','full-set','ست کامل',NULL),('74a3658a-b8cc-43cf-a5a8-8029ed2feda3','necklace','گردنبند',NULL),('7d70626e-9554-46a9-8694-a8037e06bba6','earring','گوشواره',NULL),('8d1b192c-e0ed-425b-8112-357481449b34','bracelet','دستبند',NULL),('a7b7ba59-44ea-4d02-8ad4-da001d4b99b5','ring','انگشتر',NULL),('ca25db85-103c-4850-be74-56f6e8112e60','half-set','نیم‌ست',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_persian_ci NOT NULL,
  `pct` int NOT NULL,
  `max_toman` int DEFAULT NULL,
  `min_toman` int DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES ('64f3e706-0d9c-4888-9936-111c55d65ea8','GH632LO',20,2000000,1000000,1,NULL);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `user_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`user_id`,`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_events`
--

DROP TABLE IF EXISTS `order_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_events` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_persian_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `order_events_order_idx` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_events`
--

LOCK TABLES `order_events` WRITE;
/*!40000 ALTER TABLE `order_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `qty` int NOT NULL,
  `unit_toman` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_idx` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_persian_ci NOT NULL DEFAULT 'pending',
  `total_toman` int NOT NULL,
  `address_id` varchar(36) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `discount_toman` int NOT NULL DEFAULT '0',
  `shipping_fee_toman` int NOT NULL DEFAULT '0',
  `shipping_slug` varchar(50) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `tracking_code` varchar(100) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `orders_user_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `order_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `provider` varchar(20) COLLATE utf8mb4_persian_ci NOT NULL,
  `authority` varchar(100) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `amount_rial` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_persian_ci NOT NULL DEFAULT 'initiated',
  `ref_id` varchar(100) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `raw` json DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_order_id_unique` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_attributes`
--

DROP TABLE IF EXISTS `product_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_attributes` (
  `product_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `attribute_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  PRIMARY KEY (`product_id`,`attribute_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_attributes`
--

LOCK TABLES `product_attributes` WRITE;
/*!40000 ALTER TABLE `product_attributes` DISABLE KEYS */;
INSERT INTO `product_attributes` VALUES ('0090bf85-291c-4fdf-8659-c9b428c4edc7','3fdb5031-114f-466a-9b9a-762bf653d587'),('201f865f-0441-43c4-80d6-66c72fc605f5','44b343e1-45ca-4e4b-a24f-be6f021e6adc'),('201f865f-0441-43c4-80d6-66c72fc605f5','55b14652-a26e-408a-9b75-04fc80a761e5'),('201f865f-0441-43c4-80d6-66c72fc605f5','72bafb49-7cc7-404f-9a02-ab8cd12cb043'),('201f865f-0441-43c4-80d6-66c72fc605f5','84092274-3526-45b4-9f34-04c744a944cb'),('201f865f-0441-43c4-80d6-66c72fc605f5','cde040ec-904b-41dc-990b-775c7cfa6d23'),('201f865f-0441-43c4-80d6-66c72fc605f5','e7117a08-7b58-4ac8-b41f-5e4f3e51f1ec'),('26709cdb-2418-48de-a672-f054eea06e50','e785504b-4a94-419c-8713-bc309211c2f8'),('31ffeebb-f998-414b-b96f-06c567f113b5','55b14652-a26e-408a-9b75-04fc80a761e5'),('4e53a786-81ca-4287-8439-52b18b191125','e785504b-4a94-419c-8713-bc309211c2f8'),('5478a3d2-45c7-432d-bc26-a63e5bd7419c','55b14652-a26e-408a-9b75-04fc80a761e5'),('5478a3d2-45c7-432d-bc26-a63e5bd7419c','e785504b-4a94-419c-8713-bc309211c2f8'),('54d9be84-b554-4560-a1f6-f927ea3bb139','55b14652-a26e-408a-9b75-04fc80a761e5'),('54d9be84-b554-4560-a1f6-f927ea3bb139','e785504b-4a94-419c-8713-bc309211c2f8'),('5d3b52da-d38f-43eb-8b55-0ee264f709db','3fdb5031-114f-466a-9b9a-762bf653d587'),('5d3b52da-d38f-43eb-8b55-0ee264f709db','e785504b-4a94-419c-8713-bc309211c2f8'),('64280a96-8e86-4b99-8b45-627e3e70a74b','55b14652-a26e-408a-9b75-04fc80a761e5'),('64280a96-8e86-4b99-8b45-627e3e70a74b','e785504b-4a94-419c-8713-bc309211c2f8'),('7336f2b1-3169-4beb-84ea-d01202a3cfe1','e785504b-4a94-419c-8713-bc309211c2f8'),('795c2e45-0b60-4a7a-9835-d8b9cae82e4e','55b14652-a26e-408a-9b75-04fc80a761e5'),('7d20f8c5-611f-463d-9167-c17b5f5d59e3','e785504b-4a94-419c-8713-bc309211c2f8'),('8f82415f-6296-46ea-9123-71718a265c90','55b14652-a26e-408a-9b75-04fc80a761e5'),('8f82415f-6296-46ea-9123-71718a265c90','a4273c7c-d75e-41bd-b320-636420373afb'),('94636c8c-9f82-467b-b078-086adcfb18f2','e785504b-4a94-419c-8713-bc309211c2f8'),('95a76a29-6dd6-44a5-96e2-b891cff5f8c3','55b14652-a26e-408a-9b75-04fc80a761e5'),('9dbc8549-4d01-4bc9-ad7f-eb15eed8374b','e785504b-4a94-419c-8713-bc309211c2f8'),('a1d8d62b-e454-4389-8f45-9252ad12875f','55b14652-a26e-408a-9b75-04fc80a761e5'),('a1d8d62b-e454-4389-8f45-9252ad12875f','e785504b-4a94-419c-8713-bc309211c2f8'),('ac35d911-2614-47a5-859a-24cf6464252a','2d1ffe4f-5c3c-4875-a166-ae68d8da586f'),('ac35d911-2614-47a5-859a-24cf6464252a','44b343e1-45ca-4e4b-a24f-be6f021e6adc'),('ac35d911-2614-47a5-859a-24cf6464252a','55b14652-a26e-408a-9b75-04fc80a761e5'),('ac35d911-2614-47a5-859a-24cf6464252a','72bafb49-7cc7-404f-9a02-ab8cd12cb043'),('ac35d911-2614-47a5-859a-24cf6464252a','84092274-3526-45b4-9f34-04c744a944cb'),('ac35d911-2614-47a5-859a-24cf6464252a','cde040ec-904b-41dc-990b-775c7cfa6d23'),('ac35d911-2614-47a5-859a-24cf6464252a','e7117a08-7b58-4ac8-b41f-5e4f3e51f1ec'),('ac35d911-2614-47a5-859a-24cf6464252a','e785504b-4a94-419c-8713-bc309211c2f8'),('c4569bdb-bcff-47be-825b-5a92f2ce9665','3fdb5031-114f-466a-9b9a-762bf653d587'),('e232104f-62f7-41c0-9d1f-6fb44c6b33c2','72bafb49-7cc7-404f-9a02-ab8cd12cb043'),('e232104f-62f7-41c0-9d1f-6fb44c6b33c2','84092274-3526-45b4-9f34-04c744a944cb'),('e232104f-62f7-41c0-9d1f-6fb44c6b33c2','e7117a08-7b58-4ac8-b41f-5e4f3e51f1ec'),('e232104f-62f7-41c0-9d1f-6fb44c6b33c2','e785504b-4a94-419c-8713-bc309211c2f8');
/*!40000 ALTER TABLE `product_attributes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `url` text COLLATE utf8mb4_persian_ci NOT NULL,
  `sort` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_images_product_idx` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `slug` varchar(150) COLLATE utf8mb4_persian_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_persian_ci NOT NULL,
  `category_id` varchar(36) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `price_toman` int NOT NULL,
  `old_price_toman` int DEFAULT NULL,
  `discount_pct` int DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_persian_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `sku` varchar(50) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_persian_ci,
  `sold_count` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  KEY `products_status_idx` (`status`),
  KEY `products_category_idx` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('0090bf85-291c-4fdf-8659-c9b428c4edc7','pearl-necklace','گردنبند مروارید','74a3658a-b8cc-43cf-a5a8-8029ed2feda3',7650000,NULL,NULL,3,'active','2026-09-15 06:34:48','WN009','این گردنبند مروارید با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('201f865f-0441-43c4-80d6-66c72fc605f5','minimal-steel-ring','انگشتر مینیمال استیل','a7b7ba59-44ea-4d02-8ad4-da001d4b99b5',1250000,NULL,NULL,30,'active','2026-09-15 06:34:48','WC011','این انگشتر مینیمال استیل با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('26709cdb-2418-48de-a672-f054eea06e50','hoop-earring','گوشواره حلقه‌ای','7d70626e-9554-46a9-8694-a8037e06bba6',1450000,NULL,NULL,22,'active','2026-09-15 06:34:48','WE022','این گوشواره حلقه‌ای با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('31ffeebb-f998-414b-b96f-06c567f113b5','half-set-nagin','نیم‌ست فول نگین','ca25db85-103c-4850-be74-56f6e8112e60',6800000,8500000,20,4,'active','2026-09-15 06:34:48','WH041','این نیم‌ست فول نگین با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('4e53a786-81ca-4287-8439-52b18b191125','chain-anklet','پابند زنجیری طلا','048e2042-6239-4098-a7bb-8708fc0e8e40',1350000,NULL,NULL,14,'active','2026-09-15 06:34:48','WA032','این پابند زنجیری طلا با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('5478a3d2-45c7-432d-bc26-a63e5bd7419c','double-nagin-earring','گوشواره دو عددی فول نگین','7d70626e-9554-46a9-8694-a8037e06bba6',3050000,3812500,20,15,'active','2026-09-15 06:34:48','WE021','این گوشواره دو عددی فول نگین با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('54d9be84-b554-4560-a1f6-f927ea3bb139','full-nagin-necklace','گردنبند فول نگین زنانه','74a3658a-b8cc-43cf-a5a8-8029ed2feda3',5250000,6562500,20,5,'active','2026-09-15 06:34:48','WN007','این گردنبند فول نگین زنانه با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('5d3b52da-d38f-43eb-8b55-0ee264f709db','half-set-pearl','نیم‌ست مروارید','ca25db85-103c-4850-be74-56f6e8112e60',9200000,NULL,NULL,2,'active','2026-09-15 06:34:48','WH042','این نیم‌ست مروارید با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('64280a96-8e86-4b99-8b45-627e3e70a74b','full-nagin-bracelet','دستبند فول نگین','8d1b192c-e0ed-425b-8112-357481449b34',1870000,2337500,20,8,'active','2026-09-15 06:34:48','WB014','این دستبند فول نگین با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('7336f2b1-3169-4beb-84ea-d01202a3cfe1','full-set-gold','ست کامل طلا','0b48c154-f090-444c-b8d4-7aba895528d7',23500000,NULL,NULL,1,'active','2026-09-15 06:34:48','WF052','این ست کامل طلا با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('795c2e45-0b60-4a7a-9835-d8b9cae82e4e','women-anklet','پابند زنانه','048e2042-6239-4098-a7bb-8708fc0e8e40',750000,NULL,NULL,20,'active','2026-09-15 06:34:48','WA031','این پابند زنانه با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('7d20f8c5-611f-463d-9167-c17b5f5d59e3','bangle-bracelet','دستبند النگویی','8d1b192c-e0ed-425b-8112-357481449b34',3980000,NULL,NULL,6,'active','2026-09-15 06:34:48','WB016','این دستبند النگویی با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('8f82415f-6296-46ea-9123-71718a265c90','minimal-anklet','پابند مینیمال','048e2042-6239-4098-a7bb-8708fc0e8e40',280000,NULL,NULL,40,'active','2026-09-15 06:34:48','WA033','این پابند مینیمال با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('94636c8c-9f82-467b-b078-086adcfb18f2','minimal-chain-necklace','گردنبند زنجیری مینیمال','74a3658a-b8cc-43cf-a5a8-8029ed2feda3',1890000,NULL,NULL,18,'active','2026-09-15 06:34:48','WN008','این گردنبند زنجیری مینیمال با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('95a76a29-6dd6-44a5-96e2-b891cff5f8c3','full-set-nagin','ست کامل فول نگین','0b48c154-f090-444c-b8d4-7aba895528d7',14800000,16400000,10,2,'active','2026-09-15 06:34:48','WF051','این ست کامل فول نگین با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('9dbc8549-4d01-4bc9-ad7f-eb15eed8374b','cartier-bracelet','دستبند کارتیر','8d1b192c-e0ed-425b-8112-357481449b34',2450000,NULL,NULL,10,'active','2026-09-15 06:34:48','WB015','این دستبند کارتیر با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('a1d8d62b-e454-4389-8f45-9252ad12875f','full-set-minimal','ست کامل مینیمال','0b48c154-f090-444c-b8d4-7aba895528d7',8950000,NULL,NULL,3,'active','2026-09-15 06:34:48','WF053','این ست کامل مینیمال با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('ac35d911-2614-47a5-859a-24cf6464252a','full-nagin-ring','انگشتر فول نگین زنانه','a7b7ba59-44ea-4d02-8ad4-da001d4b99b5',4250000,5312500,20,12,'active','2026-09-12 20:48:32','WC009','این انگشتر فول نگین زنانه با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('c4569bdb-bcff-47be-825b-5a92f2ce9665','pearl-drop-earring','گوشواره مروارید آویز','7d70626e-9554-46a9-8694-a8037e06bba6',2750000,NULL,NULL,7,'active','2026-09-15 06:34:48','WE023','این گوشواره مروارید آویز با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0),('e232104f-62f7-41c0-9d1f-6fb44c6b33c2','gold-plated-ring','انگشتر آبکاری طلا','a7b7ba59-44ea-4d02-8ad4-da001d4b99b5',2980000,3500000,15,0,'active','2026-09-15 06:34:48','WC012','این انگشتر آبکاری طلا با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.',0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `product_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `author` varchar(100) COLLATE utf8mb4_persian_ci NOT NULL,
  `rating` int NOT NULL,
  `body` text COLLATE utf8mb4_persian_ci NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `reviews_product_idx` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES ('0191c750-dca9-4416-9d07-d6ecc53dc668','ac35d911-2614-47a5-859a-24cf6464252a','امیر رضایی',5,'برای هدیه گرفتم، خیلی راضی بود. برق نگین‌ها عالیه.',1,'2026-09-15 06:34:48'),('0e745382-6541-432a-9ee1-989fd643ea6f','ac35d911-2614-47a5-859a-24cf6464252a','نگار احمدی',4,'قشنگه ولی حتما راهنمای سایز رو ببینید، قالبش کمی کوچیکه.',1,'2026-09-15 06:34:48'),('4626322d-3ba6-43ce-bf79-a7d2807ebd7b','ac35d911-2614-47a5-859a-24cf6464252a','حسین کاظمی',5,'کیفیت عالی و متریال استفاده شده بی‌نظیره.',1,'2026-09-15 06:34:48'),('65d19d3c-002b-4f3f-8e24-e049a72e18f2','54d9be84-b554-4560-a1f6-f927ea3bb139','الهه صادقی',5,'زنجیرش محکمه و نگین‌ها تمیز کار شدن.',1,'2026-09-15 06:34:48'),('8337114c-6a7c-436e-a4bc-e77b9e54a737','54d9be84-b554-4560-a1f6-f927ea3bb139','رضا مرادی',4,'خوبه، فقط جعبه‌اش می‌تونست شیک‌تر باشه.',1,'2026-09-15 06:34:48'),('8ce89d1d-1889-456e-9fc1-9bf4511e5c51','ac35d911-2614-47a5-859a-24cf6464252a','سارا محمدی',5,'بسته‌بندی شیک و ارسال سریع. روی دست خیلی قشنگه.',1,'2026-09-15 06:34:48'),('ae2080e6-ac9b-48db-8b83-c43647395cd3','64280a96-8e86-4b99-8b45-627e3e70a74b','شیما نادری',5,'هم برای مهمونی هم روزمره مناسبه. راضیم.',1,'2026-09-15 06:34:48'),('cef543d5-b05c-4062-818e-d152f48d85ed','ac35d911-2614-47a5-859a-24cf6464252a','مریم کریمی',4,'نسبت به قیمتش کیفیت خوبی داره. ممنون از پشتیبانی.',1,'2026-09-15 06:34:48');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_persian_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `ip_address` text COLLATE utf8mb4_persian_ci,
  `user_agent` text COLLATE utf8mb4_persian_ci,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token_unique` (`token`),
  KEY `session_user_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES ('3YH9jcGkv1k12LJrlG06vb38B3m9oFBj','6oTdy4rK0JSmxI2VQCDtZFkJonweHazB','g6NiJtTwD82ZaDefziUW3wMslK3KLxJZ','2026-10-15 14:25:04','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/152.0.0.0 Safari/537.36','2026-10-08 14:25:04','2026-10-08 14:25:04'),('8iRHpwjEjxP9ICKdHURiIejjYBdNz3IC','6oTdy4rK0JSmxI2VQCDtZFkJonweHazB','Np45c62tf87HtuQocm0ulUusjAq9IPT7','2026-10-15 14:17:14','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/152.0.0.0 Safari/537.36','2026-10-08 14:17:14','2026-10-08 14:17:14'),('a0v469Ma9MgcNrVsuNAzYwARpDTN2gEY','6oTdy4rK0JSmxI2VQCDtZFkJonweHazB','LNWZlby1Z96dP9FOvhkKYZjDgnUsHE3T','2026-10-15 14:19:47','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/152.0.0.0 Safari/537.36','2026-10-08 14:19:47','2026-10-08 14:19:47'),('uqaUZAkdUHenjBmY103XAtV17EMW6DC9','6oTdy4rK0JSmxI2VQCDtZFkJonweHazB','ckKw3t4B8s8IvrulrloW1G2sa7boEY4k','2026-10-15 14:19:34','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/152.0.0.0 Safari/537.36','2026-10-08 14:19:34','2026-10-08 14:19:34'),('xiDgX8xu8UDoJwKYTWOUDHD0I6n81yf7','6oTdy4rK0JSmxI2VQCDtZFkJonweHazB','Y9RUKFKGBoTDYfGVRQErm7RU2X97dRCN','2026-10-15 14:20:22','0000:0000:0000:0000:0000:0000:0000:0000','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/152.0.0.0 Safari/537.36','2026-10-08 14:20:22','2026-10-08 14:20:22');
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_methods`
--

DROP TABLE IF EXISTS `shipping_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_methods` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_persian_ci NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_persian_ci NOT NULL,
  `fee_toman` int NOT NULL DEFAULT '0',
  `free_over_toman` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shipping_methods_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_methods`
--

LOCK TABLES `shipping_methods` WRITE;
/*!40000 ALTER TABLE `shipping_methods` DISABLE KEYS */;
INSERT INTO `shipping_methods` VALUES ('02a46bcd-cd39-4b0e-946e-28e18afd36b3','tipax','تیپاکس',220000,500000),('bf8b6bda-3785-4eae-a7e8-257756238a5c','post','پست پیشتاز',150000,500000);
/*!40000 ALTER TABLE `shipping_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `name` text COLLATE utf8mb4_persian_ci,
  `email` varchar(255) COLLATE utf8mb4_persian_ci NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `image` text COLLATE utf8mb4_persian_ci,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  `phone_number` varchar(20) COLLATE utf8mb4_persian_ci DEFAULT NULL,
  `phone_number_verified` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('6oTdy4rK0JSmxI2VQCDtZFkJonweHazB','کاربر آزمایشی','demo@accessory-as.ir',0,NULL,'2026-10-08 14:17:14','2026-10-08 14:17:14',NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification`
--

DROP TABLE IF EXISTS `verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `identifier` text COLLATE utf8mb4_persian_ci NOT NULL,
  `value` text COLLATE utf8mb4_persian_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification`
--

LOCK TABLES `verification` WRITE;
/*!40000 ALTER TABLE `verification` DISABLE KEYS */;
INSERT INTO `verification` VALUES ('Vena0cAQ46LgkTgp3DdJEeTvu495E7e9','sign-in-otp-demo@accessory-as.ir','987594:0','2026-10-08 22:51:37','2026-10-08 22:46:37','2026-10-08 22:46:37');
/*!40000 ALTER TABLE `verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_refunds`
--

DROP TABLE IF EXISTS `wallet_refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_refunds` (
  `id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_persian_ci NOT NULL,
  `iban` varchar(40) COLLATE utf8mb4_persian_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_persian_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `wallet_refunds_user_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_refunds`
--

LOCK TABLES `wallet_refunds` WRITE;
/*!40000 ALTER TABLE `wallet_refunds` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallet_refunds` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-10  1:30:35
