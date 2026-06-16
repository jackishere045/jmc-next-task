-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 16, 2026 at 04:25 PM
-- Server version: 12.3.2-MariaDB-log
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kepegawaian`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` bigint(20) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` mediumtext DEFAULT NULL,
  `ua` varchar(256) DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `url` text DEFAULT NULL,
  `browser` varchar(64) DEFAULT NULL,
  `platform` varchar(64) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `title`, `content`, `ua`, `ip`, `url`, `browser`, `platform`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
(1, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 14:37:28', '2026-06-16 14:37:28', 1, 1),
(2, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 15:34:43', '2026-06-16 15:34:43', 2, 2),
(3, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 15:43:28', '2026-06-16 15:43:28', 2, 2),
(4, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 15:50:59', '2026-06-16 15:50:59', 2, 2),
(5, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 15:55:34', '2026-06-16 15:55:34', 2, 2),
(6, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 16:01:11', '2026-06-16 16:01:11', 2, 2),
(7, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 16:03:10', '2026-06-16 16:03:10', 3, 3),
(8, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 16:05:16', '2026-06-16 16:05:16', 2, 2),
(9, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 16:09:36', '2026-06-16 16:09:36', 2, 2),
(10, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 16:28:54', '2026-06-16 16:28:54', 2, 2),
(11, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 16:40:10', '2026-06-16 16:40:10', 2, 2),
(12, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 18:20:41', '2026-06-16 18:20:41', 1, 1),
(13, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 18:22:39', '2026-06-16 18:22:39', 3, 3),
(14, 'Update Pegawai', '{\"aksi\":\"update\",\"id\":\"2\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/pegawai/2', 'Chrome', 'Windows', '2026-06-16 18:23:32', '2026-06-16 18:23:32', 3, 3),
(15, 'Update Pegawai', '{\"aksi\":\"update\",\"id\":\"2\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/pegawai/2', 'Chrome', 'Windows', '2026-06-16 18:39:55', '2026-06-16 18:39:55', 3, 3),
(16, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 18:40:23', '2026-06-16 18:40:23', 2, 2),
(17, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:12:41', '2026-06-16 19:12:41', 1, 1),
(18, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:15:28', '2026-06-16 19:15:28', 3, 3),
(19, 'Tambah Setting Tunjangan', '{\"aksi\":\"create\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/tunjangan/setting', 'Chrome', 'Windows', '2026-06-16 19:15:53', '2026-06-16 19:15:53', 3, 3),
(20, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:21:30', '2026-06-16 19:21:30', 3, 3),
(21, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:23:21', '2026-06-16 19:23:21', 1, 1),
(22, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:29:51', '2026-06-16 19:29:51', 1, 1),
(23, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:35:49', '2026-06-16 19:35:49', 1, 1),
(24, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:43:36', '2026-06-16 19:43:36', 1, 1),
(25, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:47:19', '2026-06-16 19:47:19', 1, 1),
(26, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:51:31', '2026-06-16 19:51:31', 1, 1),
(27, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:54:50', '2026-06-16 19:54:50', 3, 3),
(28, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 19:59:28', '2026-06-16 19:59:28', 3, 3),
(29, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:00:58', '2026-06-16 20:00:58', 2, 2),
(30, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:04:47', '2026-06-16 20:04:47', 3, 3),
(31, 'Update Pegawai', '{\"aksi\":\"update\",\"id\":\"2\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/pegawai/2', 'Chrome', 'Windows', '2026-06-16 20:05:24', '2026-06-16 20:05:24', 3, 3),
(32, 'Update Pegawai', '{\"aksi\":\"update\",\"id\":\"2\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/pegawai/2', 'Chrome', 'Windows', '2026-06-16 20:05:32', '2026-06-16 20:05:32', 3, 3),
(33, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:08:07', '2026-06-16 20:08:07', 3, 3),
(34, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:08:53', '2026-06-16 20:08:53', 1, 1),
(35, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:12:37', '2026-06-16 20:12:37', 1, 1),
(36, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:13:18', '2026-06-16 20:13:18', 3, 3),
(37, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:18:06', '2026-06-16 20:18:06', 3, 3),
(38, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:20:35', '2026-06-16 20:20:35', 1, 1),
(39, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:21:54', '2026-06-16 20:21:54', 3, 3),
(40, 'Login', '{\"aksi\":\"login\",\"user\":\"admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:26:17', '2026-06-16 20:26:17', 1, 1),
(41, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:32:42', '2026-06-16 20:32:42', 2, 2),
(42, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:34:40', '2026-06-16 20:34:40', 3, 3),
(43, 'Update Setting Tunjangan', '{\"aksi\":\"update\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/tunjangan/setting/8', 'Chrome', 'Windows', '2026-06-16 20:40:20', '2026-06-16 20:40:20', 3, 3),
(44, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.admin\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 20:50:16', '2026-06-16 20:50:16', 3, 3),
(45, 'Tambah Pegawai', '{\"aksi\":\"create\",\"nip\":\"19851234202303100123\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/pegawai', 'Chrome', 'Windows', '2026-06-16 21:18:26', '2026-06-16 21:18:26', 3, 3),
(46, 'Update Pegawai', '{\"aksi\":\"update\",\"id\":\"4\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/pegawai/4', 'Chrome', 'Windows', '2026-06-16 21:21:53', '2026-06-16 21:21:53', 3, 3),
(47, 'Update Pegawai', '{\"aksi\":\"update\",\"id\":\"4\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/pegawai/4', 'Chrome', 'Windows', '2026-06-16 21:22:27', '2026-06-16 21:22:27', 3, 3),
(48, 'Tambah User', '{\"aksi\":\"create\",\"username\":\"newrole\",\"id_pegawai\":\"4\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/users', 'Chrome', 'Windows', '2026-06-16 21:23:10', '2026-06-16 21:23:10', 1, 1),
(49, 'Login', '{\"aksi\":\"login\",\"user\":\"hrd.manager\"}', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '::1', '/api/auth/login', 'Chrome', 'Windows', '2026-06-16 22:04:31', '2026-06-16 22:04:31', 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `master_data`
--

CREATE TABLE `master_data` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) DEFAULT NULL,
  `tipe` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `master_data`
--

INSERT INTO `master_data` (`id`, `nama`, `tipe`) VALUES
(1, 'Manager', 'jabatan'),
(2, 'Staf', 'jabatan'),
(3, 'Magang', 'jabatan'),
(4, 'Marketing', 'departemen'),
(5, 'HRD', 'departemen'),
(6, 'Production', 'departemen'),
(7, 'Executive', 'departemen'),
(8, 'Commissioner', 'departemen'),
(9, 'IT Department', 'departemen');

-- --------------------------------------------------------

--
-- Table structure for table `master_wilayah`
--

CREATE TABLE `master_wilayah` (
  `id` int(11) NOT NULL,
  `kecamatan` varchar(100) DEFAULT NULL,
  `kabupaten` varchar(100) DEFAULT NULL,
  `provinsi` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `master_wilayah`
--

INSERT INTO `master_wilayah` (`id`, `kecamatan`, `kabupaten`, `provinsi`) VALUES
(1, 'Kecamatan A', 'Kabupaten B', 'Provinsi C');

-- --------------------------------------------------------

--
-- Table structure for table `pegawai`
--

CREATE TABLE `pegawai` (
  `id` int(11) NOT NULL,
  `foto_pegawai` varchar(255) DEFAULT NULL,
  `nip` varchar(30) DEFAULT NULL,
  `nama_pegawai` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `nomor_hp` varchar(20) DEFAULT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `id_kecamatan` int(11) DEFAULT NULL,
  `alamat_lengkap` text DEFAULT NULL,
  `jarak_rumah_kantor` tinyint(2) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `status_kawin` enum('kawin','tidak kawin') DEFAULT NULL,
  `jumlah_anak` tinyint(2) DEFAULT 0,
  `tanggal_masuk` date DEFAULT NULL,
  `id_jabatan` int(11) DEFAULT NULL,
  `id_departemen` int(11) DEFAULT NULL,
  `usia` int(11) DEFAULT NULL,
  `status_kontrak` enum('tetap','kontrak','magang') DEFAULT 'kontrak',
  `status` enum('Aktif','Nonaktif') DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pegawai`
--

INSERT INTO `pegawai` (`id`, `foto_pegawai`, `nip`, `nama_pegawai`, `email`, `nomor_hp`, `tempat_lahir`, `id_kecamatan`, `alamat_lengkap`, `jarak_rumah_kantor`, `tanggal_lahir`, `status_kawin`, `jumlah_anak`, `tanggal_masuk`, `id_jabatan`, `id_departemen`, `usia`, `status_kontrak`, `status`, `created_at`, `updated_at`) VALUES
(1, 'default_photo.jpg', '198512342023011001', 'Budi Santoso', 'budi.santoso@company.com', '081234567890', 'Jakarta', 1, 'Jl. Mawar No. 123, Kecamatan A, Kabupaten B, Provinsi C', 5, '1985-12-31', 'kawin', 2, '2010-01-15', 1, 2, 38, 'tetap', 'Aktif', '2026-06-16 07:12:34', '2026-06-16 09:10:29'),
(2, 'foto_1781609995464.png', '198512342023031001', 'Dewi Lestari', 'dewi.lestari@company.com', '083456789012', 'Surabaya', 1, 'Jl. Anggrek No. 78, Kecamatan A, Kabupaten B, Provinsi C', 4, '1985-03-07', 'kawin', 2, '2012-06-28', 1, 5, 41, 'kontrak', 'Aktif', '2026-06-16 08:28:27', '2026-06-16 13:05:32'),
(3, 'hrd_admin.jpg', '199512342023032001', 'Rina Fitriani', 'rina.fitriani@company.com', '084567890123', 'Semarang', 1, 'Jl. Kenanga No. 56, Kecamatan A, Kabupaten B, Provinsi C', 2, '1995-08-20', 'tidak kawin', 0, '2020-11-01', 2, 5, 28, 'kontrak', 'Aktif', '2026-06-16 08:29:53', '2026-06-16 08:29:53'),
(4, NULL, '19851234202303100123', 'Adi Muzaki', 'zackyhokya045@gmail.com', '083456789012', 'Surabaya', NULL, 'AAASD', 2, '2002-04-15', 'tidak kawin', 0, '2026-06-01', 3, 9, 24, 'magang', 'Aktif', '2026-06-16 14:18:26', '2026-06-16 14:22:27');

-- --------------------------------------------------------

--
-- Table structure for table `pegawai_pendidikan`
--

CREATE TABLE `pegawai_pendidikan` (
  `id` int(11) NOT NULL,
  `id_pegawai` int(11) DEFAULT NULL,
  `tingkat_pendidikan` varchar(50) DEFAULT NULL,
  `nama_sekolah` varchar(255) DEFAULT NULL,
  `tahun_lulus` year(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pegawai_pendidikan`
--

INSERT INTO `pegawai_pendidikan` (`id`, `id_pegawai`, `tingkat_pendidikan`, `nama_sekolah`, `tahun_lulus`) VALUES
(1, 1, 'S1', 'Universitas Indonesia', 2008),
(2, 1, 'SMA', 'SMA Negeri 1 Jakarta', 2004),
(7, 3, 'S1', 'Universitas Diponegoro', 2018),
(8, 3, 'SMA', 'SMA Negeri 3 Semarang', 2014),
(15, 2, 'S2', 'Universitas Gadjah Mada', 2011),
(16, 2, 'S1', 'Universitas Airlangga', 2008);

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `id` int(11) NOT NULL,
  `id_role` smallint(6) DEFAULT NULL,
  `modul_fitur` varchar(100) DEFAULT NULL,
  `kode_modul` varchar(50) DEFAULT NULL,
  `akses` tinyint(1) DEFAULT 0,
  `create` tinyint(1) DEFAULT 0,
  `read` enum('All','Own','No') DEFAULT 'No',
  `update` enum('All','Own','No') DEFAULT 'No',
  `delete` enum('All','Own','No') DEFAULT 'No'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`id`, `id_role`, `modul_fitur`, `kode_modul`, `akses`, `create`, `read`, `update`, `delete`) VALUES
(1, 1, 'Login/Logout', 'auth', 1, 0, 'All', 'No', 'No'),
(2, 1, 'Kelola Role', 'roles', 1, 0, 'All', 'No', 'No'),
(3, 1, 'Kelola User', 'users', 1, 1, 'All', 'All', 'All'),
(4, 1, 'My Profile', 'profile', 1, 0, 'Own', 'Own', 'No'),
(5, 1, 'Dashboard', 'dashboard', 1, 0, 'All', 'No', 'No'),
(6, 1, 'Data Pegawai', 'pegawai', 1, 0, 'All', 'No', 'No'),
(7, 1, 'Tunjangan Transport', 'tunjangan', 0, 0, 'No', 'No', 'No'),
(8, 1, 'Setting Tunjangan', 'setting_tunjangan', 1, 0, 'No', 'No', 'No'),
(9, 1, 'Log Aktivitas', 'log', 1, 0, 'All', 'No', 'No'),
(10, 2, 'Login/Logout', 'auth', 1, 0, 'All', 'No', 'No'),
(11, 2, 'Kelola Role', 'roles', 0, 0, 'No', 'No', 'No'),
(12, 2, 'Kelola User', 'users', 0, 0, 'No', 'No', 'No'),
(13, 2, 'My Profile', 'profile', 1, 0, 'Own', 'Own', 'No'),
(14, 2, 'Dashboard', 'dashboard', 1, 0, 'All', 'No', 'No'),
(15, 2, 'Data Pegawai', 'pegawai', 1, 0, 'All', 'No', 'No'),
(16, 2, 'Tunjangan Transport', 'tunjangan', 1, 0, 'Own', 'No', 'No'),
(17, 2, 'Setting Tunjangan', 'setting_tunjangan', 0, 0, 'No', 'No', 'No'),
(18, 2, 'Log Aktivitas', 'log', 0, 0, 'No', 'No', 'No'),
(19, 3, 'Login/Logout', 'auth', 1, 0, 'All', 'No', 'No'),
(20, 3, 'Kelola Role', 'roles', 0, 0, 'No', 'No', 'No'),
(21, 3, 'Kelola User', 'users', 0, 0, 'No', 'No', 'No'),
(22, 3, 'My Profile', 'profile', 1, 0, 'Own', 'Own', 'No'),
(23, 3, 'Dashboard', 'dashboard', 1, 0, 'All', 'No', 'No'),
(24, 3, 'Data Pegawai', 'pegawai', 1, 1, 'All', 'All', 'All'),
(25, 3, 'Tunjangan Transport', 'tunjangan', 1, 0, 'Own', 'No', 'No'),
(26, 3, 'Setting Tunjangan', 'setting_tunjangan', 1, 1, 'All', 'All', 'All'),
(27, 3, 'Log Aktivitas', 'log', 0, 0, 'No', 'No', 'No'),
(28, 1, 'users', NULL, 1, 1, 'All', 'All', 'All'),
(29, 1, 'roles', NULL, 1, 1, 'All', 'All', 'All'),
(30, 1, 'Data Pegawai', 'pegawai', 1, 1, 'All', 'All', 'All');

-- --------------------------------------------------------

--
-- Table structure for table `setting_tunjangan`
--

CREATE TABLE `setting_tunjangan` (
  `id` int(11) NOT NULL,
  `base_fare` decimal(15,2) NOT NULL,
  `berlaku_mulai` date NOT NULL,
  `min_km` tinyint(3) NOT NULL DEFAULT 5,
  `max_km` tinyint(3) NOT NULL DEFAULT 25,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `setting_tunjangan`
--

INSERT INTO `setting_tunjangan` (`id`, `base_fare`, `berlaku_mulai`, `min_km`, `max_km`, `created_by`, `created_at`, `updated_at`) VALUES
(1, '5000.00', '2026-01-01', 0, 5, 1, '2026-06-16 11:31:03', '2026-06-16 11:31:03'),
(2, '10000.00', '2026-01-01', 6, 10, 1, '2026-06-16 11:31:03', '2026-06-16 11:31:03'),
(3, '15000.00', '2026-01-01', 11, 15, 1, '2026-06-16 11:31:03', '2026-06-16 11:31:03'),
(4, '20000.00', '2026-01-01', 16, 20, 1, '2026-06-16 11:31:03', '2026-06-16 11:31:03'),
(5, '25000.00', '2026-01-01', 21, 30, 1, '2026-06-16 11:31:03', '2026-06-16 11:31:03'),
(6, '35000.00', '2026-01-01', 31, 50, 1, '2026-06-16 11:31:03', '2026-06-16 11:31:03'),
(7, '50000.00', '2026-01-01', 51, 100, 1, '2026-06-16 11:31:03', '2026-06-16 11:31:03'),
(8, '61000.00', '2025-12-31', 60, 120, 3, '2026-06-16 12:15:53', '2026-06-16 13:40:20');

-- --------------------------------------------------------

--
-- Table structure for table `tunjangan_transport`
--

CREATE TABLE `tunjangan_transport` (
  `id` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL,
  `bulan` tinyint(2) NOT NULL,
  `tahun` year(4) NOT NULL,
  `km` tinyint(3) DEFAULT NULL,
  `hari_masuk` tinyint(3) DEFAULT NULL,
  `nominal` decimal(15,2) DEFAULT NULL,
  `id_setting` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tunjangan_transport`
--

INSERT INTO `tunjangan_transport` (`id`, `id_pegawai`, `bulan`, `tahun`, `km`, `hari_masuk`, `nominal`, `id_setting`, `created_at`, `updated_at`) VALUES
(21, 1, 4, 2026, 5, 22, '5000.00', 1, '2026-06-16 11:33:15', '2026-06-16 11:33:15'),
(22, 1, 5, 2026, 5, 21, '5000.00', 1, '2026-06-16 11:33:15', '2026-06-16 11:33:15'),
(23, 1, 6, 2026, 5, 22, '5000.00', 1, '2026-06-16 11:33:15', '2026-06-16 11:33:15'),
(24, 2, 4, 2026, 4, 22, '5000.00', 1, '2026-06-16 11:33:26', '2026-06-16 11:33:26'),
(25, 2, 5, 2026, 4, 21, '5000.00', 1, '2026-06-16 11:33:26', '2026-06-16 11:33:26'),
(26, 2, 6, 2026, 4, 22, '5000.00', 1, '2026-06-16 11:33:26', '2026-06-16 11:33:26');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `id_role` smallint(6) DEFAULT NULL,
  `id_pegawai` int(11) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `nomor_hp` varchar(20) DEFAULT NULL,
  `last_session` varchar(255) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `disabled` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `id_role`, `id_pegawai`, `username`, `password_hash`, `nama`, `email`, `nomor_hp`, `last_session`, `last_login`, `updated_at`, `created_at`, `disabled`) VALUES
(1, 1, 1, 'admin', '$2b$12$UR771SQ0dT5rF2SGiX0yV.0Xoz0MwcYoK9sK.BxMIUvDFf.lu313u', 'Admin', 'admin@gmail.com', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlkX3JvbGUiOjEsIm5hbWEiOiJBZG1pbiIsImlhdCI6MTc4MTYxNjM3NywiZXhwIjoxNzg0MjA4Mzc3fQ.sxO2lN249DuZng2ofX9xOzNcGyPqf6-zuWSn9O8r3iY', '2026-06-16 13:26:17', '2026-06-16 13:26:17', '2026-06-16 07:13:28', 0),
(2, 2, 2, 'hrd.manager', '$2b$12$SvUPfC/VHuH34o2T/EG7AeVzXnhS9InIOIy8J2IV1poLFNb8u8Tky', 'Dewi Lestari', 'dewi.lestari@company.com', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJocmQubWFuYWdlciIsImlkX3JvbGUiOjIsIm5hbWEiOiJEZXdpIExlc3RhcmkiLCJpYXQiOjE3ODE2MjIyNzEsImV4cCI6MTc4NDIxNDI3MX0.SUZlKgyCg-DARQ5w39lNNSxpEJlHGiy6xxKOUmyGBJ0', '2026-06-16 15:04:31', '2026-06-16 15:04:31', '2026-06-16 08:30:50', 0),
(3, 3, 3, 'hrd.admin', '$2b$12$JfFoMdVfW0qgCEMGWCuTaOsCgxYqrB1q/Juni24KN4KSfyKwiaHpC', 'Rina Fitriani', 'rina.fitriani@company.com', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJocmQuYWRtaW4iLCJpZF9yb2xlIjozLCJuYW1hIjoiUmluYSBGaXRyaWFuaSIsImlhdCI6MTc4MTYxNzgxNiwiZXhwIjoxNzg0MjA5ODE2fQ._LWQYhAf7iSFLd5t-3CqulLv9L8TWxFRZe7_N-Lfjr0', '2026-06-16 13:50:16', '2026-06-16 13:50:16', '2026-06-16 08:31:47', 0),
(4, 3, 4, 'newrole', '$2b$12$MG9CGVjSFcQuoC5Byk/WHehpAClE6iV4zAf/l2Wdeh7YDLSmNNora', 'Adi Muzaki', 'zackyhokya045@gmail.com', NULL, NULL, NULL, '2026-06-16 14:23:10', '2026-06-16 14:23:10', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `id` smallint(6) NOT NULL,
  `nama_role` varchar(100) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_role`
--

INSERT INTO `user_role` (`id`, `nama_role`, `deskripsi`, `created_at`) VALUES
(1, 'Superadmin', 'Akses penuh ke seluruh sistem', '2026-06-16 05:54:18'),
(2, 'Manager HRD', 'Manajer HRD, akses read pada data pegawai dan tunjangan', '2026-06-16 05:54:18'),
(3, 'Admin HRD', 'Admin HRD, akses CRUD pegawai dan pengelolaan tunjangan', '2026-06-16 05:54:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_activities_created` (`created_by`),
  ADD KEY `fk_activities_updated` (`updated_by`);

--
-- Indexes for table `master_data`
--
ALTER TABLE `master_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `master_wilayah`
--
ALTER TABLE `master_wilayah`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_kecamatan` (`kecamatan`);

--
-- Indexes for table `pegawai`
--
ALTER TABLE `pegawai`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_pegawai_jabatan` (`id_jabatan`),
  ADD KEY `fk_pegawai_departemen` (`id_departemen`),
  ADD KEY `fk_pegawai_kecamatan` (`id_kecamatan`);

--
-- Indexes for table `pegawai_pendidikan`
--
ALTER TABLE `pegawai_pendidikan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pendidikan_pegawai` (`id_pegawai`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_permission_role` (`id_role`);

--
-- Indexes for table `setting_tunjangan`
--
ALTER TABLE `setting_tunjangan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_setting_created` (`created_by`);

--
-- Indexes for table `tunjangan_transport`
--
ALTER TABLE `tunjangan_transport`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_pegawai_bulan_tahun` (`id_pegawai`,`bulan`,`tahun`),
  ADD KEY `fk_tunjangan_setting` (`id_setting`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `username` (`username`) USING BTREE,
  ADD KEY `user_ibfk_1` (`id_role`),
  ADD KEY `fk_user_pegawai` (`id_pegawai`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `master_data`
--
ALTER TABLE `master_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `master_wilayah`
--
ALTER TABLE `master_wilayah`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pegawai`
--
ALTER TABLE `pegawai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pegawai_pendidikan`
--
ALTER TABLE `pegawai_pendidikan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `setting_tunjangan`
--
ALTER TABLE `setting_tunjangan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tunjangan_transport`
--
ALTER TABLE `tunjangan_transport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_role`
--
ALTER TABLE `user_role`
  MODIFY `id` smallint(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `fk_activities_created` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_activities_updated` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pegawai`
--
ALTER TABLE `pegawai`
  ADD CONSTRAINT `fk_pegawai_departemen` FOREIGN KEY (`id_departemen`) REFERENCES `master_data` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pegawai_jabatan` FOREIGN KEY (`id_jabatan`) REFERENCES `master_data` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pegawai_kecamatan` FOREIGN KEY (`id_kecamatan`) REFERENCES `master_wilayah` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `pegawai_pendidikan`
--
ALTER TABLE `pegawai_pendidikan`
  ADD CONSTRAINT `fk_pendidikan_pegawai` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD CONSTRAINT `fk_permission_role` FOREIGN KEY (`id_role`) REFERENCES `user_role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `setting_tunjangan`
--
ALTER TABLE `setting_tunjangan`
  ADD CONSTRAINT `fk_setting_created` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tunjangan_transport`
--
ALTER TABLE `tunjangan_transport`
  ADD CONSTRAINT `fk_tunjangan_pegawai` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tunjangan_setting` FOREIGN KEY (`id_setting`) REFERENCES `setting_tunjangan` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `fk_user_pegawai` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`id_role`) REFERENCES `user_role` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
