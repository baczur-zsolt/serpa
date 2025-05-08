-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Máj 08. 17:36
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `cms_db`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_brand`
--

CREATE TABLE `tbl_brand` (
  `brand_ID` int(11) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `brand_desc` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_brand`
--

INSERT INTO `tbl_brand` (`brand_ID`, `brand`, `brand_desc`) VALUES
(1, 'Fiskars', 'Minőségi kerti szerszámok Finnországból, tartós és ergonomikus eszközök.'),
(2, 'Bosch', 'Német precíziós szerszámok, megbízható technológia otthoni és professzionális használatra.'),
(3, 'Hecht', 'Megfizethető kerti gépek, jó ár-érték arány a hobbi kertészek számára.'),
(4, 'Stihl', 'Professzionális kerti eszközök, kiemelkedő teljesítmény és hosszú élettartam.');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_buy`
--

CREATE TABLE `tbl_buy` (
  `buy_ID` int(11) NOT NULL,
  `staff_ID` int(11) NOT NULL,
  `customer_ID` int(11) NOT NULL,
  `product_ID` int(11) NOT NULL,
  `quantity_buy` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `bill_number` varchar(50) DEFAULT NULL,
  `buy_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_buy`
--

INSERT INTO `tbl_buy` (`buy_ID`, `staff_ID`, `customer_ID`, `product_ID`, `quantity_buy`, `total_price`, `bill_number`, `buy_date`) VALUES
(1, 1, 14, 12, 3, 60000.00, 'INV-2025-JAN-001', '2025-01-02 10:00:00'),
(2, 2, 13, 21, 3, 165000.00, 'BILL-2025-JAN-002', '2025-01-06 11:20:00'),
(3, 3, 12, 19, 2, 96000.00, 'ORD-2025-JAN-003', '2025-01-09 12:30:00'),
(4, 4, 15, 28, 1, 50000.00, 'PURCHASE-2025-JAN-004', '2025-01-13 13:40:00'),
(5, 5, 11, 23, 1, 25000.00, 'OCT-2025-INV-005', '2025-01-17 14:50:00'),
(6, 2, 14, 25, 3, 105000.00, 'INV-2025-FEB-001', '2025-02-02 10:10:00'),
(7, 2, 13, 17, 1, 50000.00, 'BILL-2025-FEB-002', '2025-02-05 11:30:00'),
(8, 3, 12, 30, 2, 260000.00, 'ORD-2025-FEB-003', '2025-02-08 12:40:00'),
(9, 5, 15, 18, 1, 40000.00, 'PURCHASE-2025-FEB-004', '2025-02-12 13:50:00'),
(10, 5, 11, 22, 2, 120000.00, 'OCT-2025-INV-005', '2025-02-15 14:00:00'),
(11, 6, 14, 22, 2, 120000.00, 'INV-2025-MAR-001', '2025-03-02 09:00:00'),
(12, 7, 13, 17, 2, 100000.00, 'BILL-2025-MAR-002', '2025-03-06 11:45:00'),
(13, 1, 12, 19, 4, 192000.00, 'ORD-2025-MAR-003', '2025-03-10 13:30:00'),
(14, 2, 15, 25, 1, 35000.00, 'PURCHASE-2025-MAR-004', '2025-03-13 14:20:00'),
(15, 3, 11, 30, 2, 260000.00, 'OCT-2025-INV-005', '2025-03-18 12:55:00'),
(16, 4, 12, 23, 3, 75000.00, 'INV-2025-APR-001', '2025-04-02 09:15:00'),
(17, 2, 13, 28, 2, 100000.00, 'BILL-2025-APR-002', '2025-04-06 12:00:00'),
(18, 2, 14, 19, 4, 192000.00, 'ORD-2025-APR-003', '2025-04-09 13:25:00'),
(19, 3, 15, 30, 1, 130000.00, 'PURCHASE-2025-APR-004', '2025-04-12 14:50:00'),
(20, 6, 11, 17, 2, 100000.00, 'OCT-2025-INV-005', '2025-04-17 11:40:00');

--
-- Eseményindítók `tbl_buy`
--
DELIMITER $$
CREATE TRIGGER `calculate_total_price_on_insert_buy` BEFORE INSERT ON `tbl_buy` FOR EACH ROW BEGIN
    DECLARE product_cost DECIMAL(10, 2);
    
    SELECT product_price INTO product_cost
    FROM tbl_product
    WHERE product_ID = NEW.product_ID;
    
    SET NEW.total_price = product_cost * NEW.quantity_buy;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_balance_on_insert_buy` AFTER INSERT ON `tbl_buy` FOR EACH ROW BEGIN
    DECLARE current_balance DECIMAL(10, 2);
    
    SELECT balance INTO current_balance
    FROM tbl_finance
    ORDER BY date DESC
    LIMIT 1;
    
    SET current_balance = current_balance - NEW.total_price;
    
    INSERT INTO tbl_finance (buy_ID, sale_ID, balance, date)
    VALUES (NEW.buy_ID, NULL, current_balance, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_stock_on_insert_buy` AFTER INSERT ON `tbl_buy` FOR EACH ROW BEGIN
    
    UPDATE tbl_product
    SET stock_number = stock_number + NEW.quantity_buy
    WHERE product_ID = NEW.product_ID;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_category`
--

CREATE TABLE `tbl_category` (
  `category_ID` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `category_desc` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_category`
--

INSERT INTO `tbl_category` (`category_ID`, `category`, `category_desc`) VALUES
(1, 'Fűnyíró', 'Benzines és elektromos fűnyírók.'),
(2, 'Fűrész', 'Kézi és motoros fűrészek vágási feladatokhoz.'),
(3, 'Fúró', 'Elektromos fúrók barkácsoláshoz és professzionális munkákhoz.'),
(4, 'Fűkasza', 'Benzines és elektromos fűkaszák a nehezen elérhető területek karbantartására.'),
(5, 'Grill', 'Kerti grillek szabadtéri sütéshez és családi összejövetelekhez.'),
(6, 'Permetező', 'Kerti permetezők növények védelmére és gondozására.');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_constant`
--

CREATE TABLE `tbl_constant` (
  `constant_ID` int(11) NOT NULL,
  `AFA` decimal(5,2) NOT NULL,
  `perszuperbrutto` decimal(10,9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_constant`
--

INSERT INTO `tbl_constant` (`constant_ID`, `AFA`, `perszuperbrutto`) VALUES
(1, 27.00, 0.787401574);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_customer`
--

CREATE TABLE `tbl_customer` (
  `customer_ID` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `tax_number` varchar(13) DEFAULT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `zipcode` char(4) DEFAULT NULL,
  `address_city` varchar(100) DEFAULT NULL,
  `address_street` varchar(100) DEFAULT NULL,
  `address_number` varchar(10) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `stamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_customer`
--

INSERT INTO `tbl_customer` (`customer_ID`, `first_name`, `last_name`, `email`, `tax_number`, `status`, `zipcode`, `address_city`, `address_street`, `address_number`, `comment`, `stamp`) VALUES
(1, 'István', 'Kovács', 'istvan.kovacs@gmail.com', '12345678-2-41', 0, '1101', 'Budapest', 'Fő utca', '88', NULL, '2025-05-08 15:33:31'),
(2, 'Júlia', 'Szabó', 'julia.szabo@gmail.com', '23456789-2-42', 0, '1272', 'Budapest', 'Bartók Béla út', '4', NULL, '2025-05-08 15:33:31'),
(3, 'Károly', 'Tóth', 'karoly.toth@gmail.com', '34567890-2-43', 0, '1333', 'Budapest', 'Király utca', '29', NULL, '2025-05-08 15:33:31'),
(4, 'Lilla', 'Horváth', 'lilla.horvath@gmail.com', '45678901-2-44', 0, '1204', 'Budapest', 'Park tér', '33', NULL, '2025-05-08 15:33:31'),
(5, 'Miklós', 'Kiss', 'miklos.kiss@gmail.com', '56789012-2-45', 0, '1208', 'Budapest', 'Rákóczi út', '14', NULL, '2025-05-08 15:33:31'),
(6, 'Nóra', 'Molnár', 'nora.molnar@gmail.com', '67890123-2-46', 0, '1226', 'Budapest', 'Váci út', '66', NULL, '2025-05-08 15:33:31'),
(7, 'Olga', 'Balogh', 'olga.balogh@gmail.com', '78901234-2-47', 0, '1307', 'Budapest', 'Lehel utca', '18', NULL, '2025-05-08 15:33:31'),
(8, 'Péter', 'Nagy', 'peter.nagy@gmail.com', '89012345-2-48', 0, '1404', 'Budapest', 'Szabadság tér', '56', NULL, '2025-05-08 15:33:31'),
(9, 'Sándor', 'Fekete', 'sandor.fekete@gmail.com', '01234567-2-50', 0, '1210', 'Budapest', 'Erdő utca', '19', NULL, '2025-05-08 15:33:31'),
(10, 'Réka', 'Varga', 'reka.varga@gmail.com', '90123456-2-49', 0, '1509', 'Budapest', 'Kelenföldi út', '18', NULL, '2025-05-08 15:33:31'),
(11, 'Kft', 'AlphaTech', 'info@alphatech.hu', '10345678-2-51', 1, '1131', 'Budapest', 'Béke utca', '3', NULL, '2025-05-08 15:33:31'),
(12, 'Kft', 'GreenGarden', 'kapcsolat@greengarden.hu', '11456789-2-52', 1, '1156', 'Budapest', 'Kertész utca', '12', NULL, '2025-05-08 15:33:31'),
(13, 'Zrt', 'Hídépítő', 'office@hidepitozrt.hu', '12567890-2-53', 1, '1112', 'Budapest', 'Budafoki út', '101', NULL, '2025-05-08 15:33:31'),
(14, 'Kft', 'Nova-Design', 'hello@novadesign.hu', '13678901-2-54', 1, '1033', 'Budapest', 'Tímár utca', '5', NULL, '2025-05-08 15:33:31'),
(15, 'Kft', 'BioMarket', 'info@biomarket.hu', '14789012-2-55', 1, '1022', 'Budapest', 'Margit körút', '45', NULL, '2025-05-08 15:33:31'),
(16, 'Kft', 'City-Logistic', 'contact@citylog.hu', '15890123-2-56', 1, '1095', 'Budapest', 'Soroksári út', '135', NULL, '2025-05-08 15:33:31');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_enter`
--

CREATE TABLE `tbl_enter` (
  `enter_ID` int(11) NOT NULL,
  `staff_ID` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_enter`
--

INSERT INTO `tbl_enter` (`enter_ID`, `staff_ID`, `email`, `password`) VALUES
(1, 1, 'admin@admin.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'),
(2, 2, 'katona@gmail.com', '5be2bcf5718118eaeab4fe7ae57543262082a8fce89420a5fc4799d99af2f161'),
(3, 3, 'halasz@yahoo.com', '5be2bcf5718118eaeab4fe7ae57543262082a8fce89420a5fc4799d99af2f161'),
(4, 4, 'fekete@freemail.com', '5be2bcf5718118eaeab4fe7ae57543262082a8fce89420a5fc4799d99af2f161'),
(5, 5, 'gal@citromail.hu', '5be2bcf5718118eaeab4fe7ae57543262082a8fce89420a5fc4799d99af2f161'),
(6, 6, 'kisskata@gmail.com', '5be2bcf5718118eaeab4fe7ae57543262082a8fce89420a5fc4799d99af2f161'),
(7, 7, 'kocsis@gmail.com', '5be2bcf5718118eaeab4fe7ae57543262082a8fce89420a5fc4799d99af2f161'),
(8, 8, 'lengyel@gmail.com', '5be2bcf5718118eaeab4fe7ae57543262082a8fce89420a5fc4799d99af2f161');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_finance`
--

CREATE TABLE `tbl_finance` (
  `finance_ID` int(11) NOT NULL,
  `buy_ID` int(11) DEFAULT NULL,
  `sale_ID` int(11) DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_finance`
--

INSERT INTO `tbl_finance` (`finance_ID`, `buy_ID`, `sale_ID`, `balance`, `date`) VALUES
(1, NULL, NULL, 10000000.00, '2025-05-08 15:32:53'),
(2, NULL, 1, 10090000.00, '2025-05-08 15:33:31'),
(3, NULL, 2, 10254000.00, '2025-05-08 15:33:31'),
(4, NULL, 3, 10542000.00, '2025-05-08 15:33:31'),
(5, NULL, 4, 10617000.00, '2025-05-08 15:33:31'),
(6, NULL, 5, 10693000.00, '2025-05-08 15:33:31'),
(7, 1, NULL, 10633000.00, '2025-05-08 15:33:31'),
(8, 2, NULL, 10468000.00, '2025-05-08 15:33:31'),
(9, 3, NULL, 10372000.00, '2025-05-08 15:33:31'),
(10, 4, NULL, 10322000.00, '2025-05-08 15:33:31'),
(11, 5, NULL, 10297000.00, '2025-05-08 15:33:31'),
(12, NULL, 6, 10453000.00, '2025-05-08 15:33:31'),
(13, NULL, 7, 10603000.00, '2025-05-08 15:33:31'),
(14, NULL, 8, 11563000.00, '2025-05-08 15:33:31'),
(15, NULL, 9, 11623000.00, '2025-05-08 15:33:31'),
(16, NULL, 10, 11803000.00, '2025-05-08 15:33:31'),
(17, 6, NULL, 11698000.00, '2025-05-08 15:33:31'),
(18, 7, NULL, 11648000.00, '2025-05-08 15:33:31'),
(19, 8, NULL, 11388000.00, '2025-05-08 15:33:31'),
(20, 9, NULL, 11348000.00, '2025-05-08 15:33:31'),
(21, 10, NULL, 11228000.00, '2025-05-08 15:33:31'),
(22, NULL, 11, 11408000.00, '2025-05-08 15:33:31'),
(23, NULL, 12, 11633000.00, '2025-05-08 15:33:31'),
(24, NULL, 13, 11921000.00, '2025-05-08 15:33:31'),
(25, NULL, 14, 11973000.00, '2025-05-08 15:33:31'),
(26, NULL, 15, 12453000.00, '2025-05-08 15:33:31'),
(27, 11, NULL, 12333000.00, '2025-05-08 15:33:31'),
(28, 12, NULL, 12233000.00, '2025-05-08 15:33:31'),
(29, 13, NULL, 12041000.00, '2025-05-08 15:33:31'),
(30, 14, NULL, 12006000.00, '2025-05-08 15:33:31'),
(31, 15, NULL, 11746000.00, '2025-05-08 15:33:31'),
(32, NULL, 16, 11860000.00, '2025-05-08 15:33:31'),
(33, NULL, 17, 12010000.00, '2025-05-08 15:33:31'),
(34, NULL, 18, 12298000.00, '2025-05-08 15:33:31'),
(35, NULL, 19, 12538000.00, '2025-05-08 15:33:31'),
(36, NULL, 20, 12688000.00, '2025-05-08 15:33:31'),
(37, 16, NULL, 12613000.00, '2025-05-08 15:33:31'),
(38, 17, NULL, 12513000.00, '2025-05-08 15:33:31'),
(39, 18, NULL, 12321000.00, '2025-05-08 15:33:31'),
(40, 19, NULL, 12191000.00, '2025-05-08 15:33:31'),
(41, 20, NULL, 12091000.00, '2025-05-08 15:33:31');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_mycompany`
--

CREATE TABLE `tbl_mycompany` (
  `mycompany_ID` int(11) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `zipcode` char(4) NOT NULL,
  `address_city` varchar(100) DEFAULT NULL,
  `address_street` varchar(100) DEFAULT NULL,
  `address_number` varchar(10) DEFAULT NULL,
  `tax_number` varchar(13) DEFAULT NULL,
  `bank_account` varchar(30) DEFAULT NULL,
  `web` varchar(255) DEFAULT NULL,
  `phone_number` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `company_number` varchar(15) DEFAULT NULL,
  `profil` text DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `stamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='A saját cég adatait tartalmazó tábla';

--
-- A tábla adatainak kiíratása `tbl_mycompany`
--

INSERT INTO `tbl_mycompany` (`mycompany_ID`, `company_name`, `zipcode`, `address_city`, `address_street`, `address_number`, `tax_number`, `bank_account`, `web`, `phone_number`, `email`, `company_number`, `profil`, `comment`, `stamp`) VALUES
(1, 'Botanika Kft', '1034', 'Budapest', 'Galagonya utca', '13', '12345432-1-11', '12345678-12345678', 'www.botanika.hu', '+36303336464', 'botanika@gmail.hu', '01-09-876543', 'Kerti gépek és szerszámok értékesítése, forgalmazása és szervizelése.', 'Kis és nagykereskedelem.', '2025-05-08 15:32:53');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_product`
--

CREATE TABLE `tbl_product` (
  `product_ID` int(11) NOT NULL,
  `brand_ID` int(11) DEFAULT NULL,
  `category_ID` int(11) DEFAULT NULL,
  `product_number` varchar(50) DEFAULT NULL,
  `product_name` varchar(100) NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `product_profit_price` decimal(10,2) NOT NULL,
  `stock_number` int(11) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_product`
--

INSERT INTO `tbl_product` (`product_ID`, `brand_ID`, `category_ID`, `product_number`, `product_name`, `product_price`, `product_profit_price`, `stock_number`, `status`) VALUES
(1, 1, 1, 'FISK001', 'Fiskars Benzines Fűnyíró', 65000.00, 90000.00, 10, 1),
(2, 2, 1, 'BOSCH001', 'Bosch Elektromos Fűnyíró', 30000.00, 45000.00, 8, 1),
(3, 3, 1, 'HECHT001', 'Hecht Fűnyíró 2000W', 20000.00, 50000.00, 15, 1),
(4, 4, 2, 'STIHL001', 'Stihl Láncfűrész MS 180', 40000.00, 60000.00, 5, 1),
(5, 1, 2, 'FISK002', 'Fiskars Kézi Fűrész', 5000.00, 8000.00, 20, 1),
(6, 2, 3, 'BOSCH002', 'Bosch Akkus Fúró 18V', 15000.00, 22000.00, 12, 1),
(7, 3, 3, 'HECHT002', 'Hecht Elektromos Fúró', 10000.00, 15000.00, 18, 1),
(8, 4, 4, 'STIHL002', 'Stihl Benzines Fűkasza FS 55', 135000.00, 250000.00, 7, 1),
(9, 1, 4, 'FISK003', 'Fiskars Fűkasza Kézi', 18000.00, 27000.00, 10, 1),
(10, 2, 5, 'BOSCH003', 'Bosch Kerti Grill BBQ', 25000.00, 38000.00, 6, 1),
(11, 3, 5, 'HECHT003', 'Hecht Hordozható Grill', 15000.00, 23000.00, 9, 1),
(12, 4, 6, 'STIHL003', 'Stihl Permetező SG 20', 20000.00, 30000.00, 4, 1),
(13, 1, 4, 'FISK004', 'Fiskars PowerCut Fűkasza', 35000.00, 52000.00, 10, 1),
(14, 1, 4, 'FISK005', 'Fiskars Ergo Fűkasza', 28000.00, 42000.00, 10, 1),
(15, 1, 4, 'FISK006', 'Fiskars Professional Fűkasza', 45000.00, 67000.00, 10, 1),
(16, 1, 4, 'FISK007', 'Fiskars Light Fűkasza', 22000.00, 35000.00, 10, 1),
(17, 1, 4, 'FISK008', 'Fiskars Xtreme Fűkasza', 50000.00, 75000.00, 8, 1),
(18, 2, 4, 'BOSCH004', 'Bosch AKE 30 Fűkasza', 40000.00, 60000.00, 10, 1),
(19, 2, 4, 'BOSCH005', 'Bosch AKE 40 Fűkasza', 48000.00, 72000.00, 8, 1),
(20, 2, 4, 'BOSCH006', 'Bosch EasyCut Fűkasza', 32000.00, 49000.00, 10, 1),
(21, 2, 4, 'BOSCH007', 'Bosch Professional Fűkasza', 55000.00, 82000.00, 11, 1),
(22, 2, 4, 'BOSCH008', 'Bosch Cordless elektromos Fűkasza', 60000.00, 90000.00, 10, 1),
(23, 3, 4, 'HECHT004', 'Hecht 520 Fűkasza', 25000.00, 38000.00, 9, 1),
(24, 3, 4, 'HECHT005', 'Hecht 6200 Fűkasza', 30000.00, 45000.00, 10, 1),
(25, 3, 4, 'HECHT006', 'Hecht XXL-720 Fűkasza', 35000.00, 52000.00, 10, 1),
(26, 3, 4, 'HECHT007', 'Hecht Power-820 Fűkasza', 40000.00, 60000.00, 10, 1),
(27, 3, 4, 'HECHT008', 'Hecht Super-9200 Fűkasza', 45000.00, 67000.00, 10, 1),
(28, 3, 4, 'HECHT009', 'Hecht Mega-10020 Fűkasza', 50000.00, 75000.00, 10, 1),
(29, 4, 4, 'STIHL026', 'Stihl Fűkasza FSA 38', 120000.00, 220000.00, 10, 1),
(30, 4, 4, 'STIHL027', 'Stihl Fűkasza FS 50', 130000.00, 240000.00, 8, 1),
(31, 4, 4, 'STIHL028', 'Stihl Fűkasza FSA 70 C-E', 165000.00, 285000.00, 10, 1),
(32, 4, 4, 'STIHL029', 'Stihl Fűkasza FSA 91', 185000.00, 320000.00, 10, 1),
(33, 4, 4, 'STIHL030', 'Stihl Fűkasza FS 131', 210000.00, 360000.00, 10, 1),
(34, 4, 4, 'STIHL031', 'Stihl Fűkasza FSA 240', 225000.00, 385000.00, 10, 1);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_qualification`
--

CREATE TABLE `tbl_qualification` (
  `qualification_ID` int(11) NOT NULL,
  `qualification` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_qualification`
--

INSERT INTO `tbl_qualification` (`qualification_ID`, `qualification`) VALUES
(1, 'Alapfokú'),
(2, 'Középfokú'),
(3, 'Felsőfokú');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_sale`
--

CREATE TABLE `tbl_sale` (
  `sale_ID` int(11) NOT NULL,
  `staff_ID` int(11) NOT NULL,
  `customer_ID` int(11) NOT NULL,
  `product_ID` int(11) NOT NULL,
  `quantity_sale` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `bill_number` varchar(14) DEFAULT NULL,
  `sale_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_sale`
--

INSERT INTO `tbl_sale` (`sale_ID`, `staff_ID`, `customer_ID`, `product_ID`, `quantity_sale`, `total_price`, `bill_number`, `sale_date`) VALUES
(1, 1, 5, 12, 3, 90000.00, 'SB-2025-000001', '2025-01-01 09:00:00'),
(2, 2, 7, 21, 2, 164000.00, 'SB-2025-000002', '2025-01-04 10:30:00'),
(3, 3, 6, 19, 4, 288000.00, 'SB-2025-000003', '2025-01-08 14:00:00'),
(4, 4, 10, 28, 1, 75000.00, 'SB-2025-000004', '2025-01-12 13:45:00'),
(5, 5, 9, 23, 2, 76000.00, 'SB-2025-000005', '2025-01-16 11:30:00'),
(6, 1, 8, 25, 3, 156000.00, 'SB-2025-000006', '2025-02-01 09:30:00'),
(7, 2, 5, 17, 2, 150000.00, 'SB-2025-000007', '2025-02-03 11:45:00'),
(8, 3, 7, 30, 4, 960000.00, 'SB-2025-000008', '2025-02-07 13:00:00'),
(9, 7, 9, 18, 1, 60000.00, 'SB-2025-000009', '2025-02-10 12:15:00'),
(10, 5, 6, 22, 2, 180000.00, 'SB-2025-000010', '2025-02-14 10:50:00'),
(11, 6, 3, 22, 2, 180000.00, 'SB-2025-000011', '2025-03-01 08:00:00'),
(12, 7, 4, 17, 3, 225000.00, 'SB-2025-000012', '2025-03-05 09:30:00'),
(13, 1, 5, 19, 4, 288000.00, 'SB-2025-000013', '2025-03-09 13:15:00'),
(14, 2, 6, 25, 1, 52000.00, 'SB-2025-000014', '2025-03-12 10:40:00'),
(15, 3, 7, 30, 2, 480000.00, 'SB-2025-000015', '2025-03-16 12:05:00'),
(16, 4, 5, 23, 3, 114000.00, 'SB-2025-000016', '2025-04-01 08:00:00'),
(17, 2, 6, 28, 2, 150000.00, 'SB-2025-000017', '2025-04-04 11:30:00'),
(18, 2, 7, 19, 4, 288000.00, 'SB-2025-000018', '2025-04-08 12:10:00'),
(19, 3, 8, 30, 1, 240000.00, 'SB-2025-000019', '2025-04-11 13:40:00'),
(20, 6, 9, 17, 2, 150000.00, 'SB-2025-000020', '2025-04-15 10:25:00');

--
-- Eseményindítók `tbl_sale`
--
DELIMITER $$
CREATE TRIGGER `calculate_total_price_on_insert_sale` BEFORE INSERT ON `tbl_sale` FOR EACH ROW BEGIN
    DECLARE product_profit DECIMAL(10, 2);
    
    SELECT product_profit_price INTO product_profit
    FROM tbl_product
    WHERE product_ID = NEW.product_ID;
    
    SET NEW.total_price = product_profit * NEW.quantity_sale;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_balance_on_insert_sale` AFTER INSERT ON `tbl_sale` FOR EACH ROW BEGIN
    DECLARE current_balance DECIMAL(10, 2);
    
    SELECT balance INTO current_balance
    FROM tbl_finance
    ORDER BY date DESC
    LIMIT 1;
    
    SET current_balance = current_balance + NEW.total_price;
    
    INSERT INTO tbl_finance (buy_ID, sale_ID, balance, date)
    VALUES (NULL, NEW.sale_ID, current_balance, NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_stock_on_insert_sale` AFTER INSERT ON `tbl_sale` FOR EACH ROW BEGIN
    
    UPDATE tbl_product
    SET stock_number = stock_number - NEW.quantity_sale
    WHERE product_ID = NEW.product_ID;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `tbl_staff`
--

CREATE TABLE `tbl_staff` (
  `staff_ID` int(11) NOT NULL,
  `mycompany_ID` int(11) NOT NULL DEFAULT 1,
  `qualification_ID` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `birthdate` date NOT NULL,
  `job_position` varchar(50) NOT NULL,
  `access_level` tinyint(4) NOT NULL,
  `zipcode` char(4) NOT NULL,
  `address_city` varchar(100) NOT NULL,
  `address_street` varchar(100) NOT NULL,
  `address_number` varchar(10) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `superbrutto` decimal(10,2) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 1,
  `comment` text DEFAULT NULL,
  `stamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- A tábla adatainak kiíratása `tbl_staff`
--

INSERT INTO `tbl_staff` (`staff_ID`, `mycompany_ID`, `qualification_ID`, `first_name`, `last_name`, `birthdate`, `job_position`, `access_level`, `zipcode`, `address_city`, `address_street`, `address_number`, `phone_number`, `superbrutto`, `status`, `comment`, `stamp`) VALUES
(1, 1, 3, 'Admin', 'Admin', '1980-01-01', 'Szuperadmin', 4, '1234', 'Budapest', 'Jázmin utca', '1', '+36302221122', 1000000.00, 1, 'Rendszergazda, tilos törölni!', '2025-05-08 15:32:53'),
(2, 1, 2, 'Eszter', 'Katona', '1985-05-15', 'Vezető', 3, '1234', 'Budapest', 'Rét utca', '22', '+3623456789', 500000.00, 1, 'Vezető: A fizikai bolt napi vezetése', '2025-05-08 15:33:31'),
(3, 1, 2, 'Albert', 'Halász', '1990-10-20', 'Vezető Eladó', 2, '1034', 'Budapest', 'Erdő utca', '34', '+36606567656', 460000.00, 1, 'Vezető eladó: Eladás és Rendelés vezetése és egyéb feladatok', '2025-05-08 15:33:31'),
(4, 1, 2, 'Vilmos', 'Fekete', '1992-03-25', 'Vezető Eladó', 2, '1048', 'Budapest', 'Fenyves utca', '44', '+3660558901', 480000.00, 1, 'Vezető eladó: Személyzet, Eladás és Rendelés vezetése', '2025-05-08 15:33:31'),
(5, 1, 1, 'Ilona', 'Gál', '1995-07-30', 'Eladó', 1, '1234', 'Budapest', 'Mária utca', '115', '+3606802012', 400000.00, 1, 'Eladó: értékesítés', '2025-05-08 15:33:31'),
(6, 1, 1, 'Kata', 'Kiss', '1998-12-10', 'Eladó', 1, '1212', 'Budapest', 'Czinege utca', '6', '+3303673123', 400000.00, 1, 'Eladó: értékesítés', '2025-05-08 15:33:31'),
(7, 1, 2, 'Ferenc', 'Kocsis', '1993-04-15', 'Eladó', 1, '1018', 'Budapest', 'Akác utca', '73', '+3630901234', 440000.00, 1, 'Eladó és raktározás', '2025-05-08 15:33:31'),
(8, 1, 1, 'Csilla', 'Lengyel', '1996-09-05', 'Eladó', 1, '1002', 'Budapest', 'Sas utca', '8', '+3689044445', 400000.00, 0, 'Eladó: értékesítés', '2025-05-08 15:33:31');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `tbl_brand`
--
ALTER TABLE `tbl_brand`
  ADD PRIMARY KEY (`brand_ID`);

--
-- A tábla indexei `tbl_buy`
--
ALTER TABLE `tbl_buy`
  ADD PRIMARY KEY (`buy_ID`),
  ADD KEY `staff_ID` (`staff_ID`),
  ADD KEY `customer_ID` (`customer_ID`),
  ADD KEY `product_ID` (`product_ID`);

--
-- A tábla indexei `tbl_category`
--
ALTER TABLE `tbl_category`
  ADD PRIMARY KEY (`category_ID`);

--
-- A tábla indexei `tbl_constant`
--
ALTER TABLE `tbl_constant`
  ADD PRIMARY KEY (`constant_ID`);

--
-- A tábla indexei `tbl_customer`
--
ALTER TABLE `tbl_customer`
  ADD PRIMARY KEY (`customer_ID`),
  ADD UNIQUE KEY `email` (`email`);

--
-- A tábla indexei `tbl_enter`
--
ALTER TABLE `tbl_enter`
  ADD PRIMARY KEY (`enter_ID`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `staff_ID` (`staff_ID`);

--
-- A tábla indexei `tbl_finance`
--
ALTER TABLE `tbl_finance`
  ADD PRIMARY KEY (`finance_ID`),
  ADD KEY `buy_ID` (`buy_ID`),
  ADD KEY `sale_ID` (`sale_ID`);

--
-- A tábla indexei `tbl_mycompany`
--
ALTER TABLE `tbl_mycompany`
  ADD PRIMARY KEY (`mycompany_ID`);

--
-- A tábla indexei `tbl_product`
--
ALTER TABLE `tbl_product`
  ADD PRIMARY KEY (`product_ID`),
  ADD KEY `brand_ID` (`brand_ID`),
  ADD KEY `category_ID` (`category_ID`);

--
-- A tábla indexei `tbl_qualification`
--
ALTER TABLE `tbl_qualification`
  ADD PRIMARY KEY (`qualification_ID`);

--
-- A tábla indexei `tbl_sale`
--
ALTER TABLE `tbl_sale`
  ADD PRIMARY KEY (`sale_ID`),
  ADD KEY `staff_ID` (`staff_ID`),
  ADD KEY `customer_ID` (`customer_ID`),
  ADD KEY `product_ID` (`product_ID`);

--
-- A tábla indexei `tbl_staff`
--
ALTER TABLE `tbl_staff`
  ADD PRIMARY KEY (`staff_ID`),
  ADD KEY `qualification_ID` (`qualification_ID`),
  ADD KEY `mycompany_ID` (`mycompany_ID`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `tbl_brand`
--
ALTER TABLE `tbl_brand`
  MODIFY `brand_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT a táblához `tbl_buy`
--
ALTER TABLE `tbl_buy`
  MODIFY `buy_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT a táblához `tbl_category`
--
ALTER TABLE `tbl_category`
  MODIFY `category_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `tbl_constant`
--
ALTER TABLE `tbl_constant`
  MODIFY `constant_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `tbl_customer`
--
ALTER TABLE `tbl_customer`
  MODIFY `customer_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT a táblához `tbl_enter`
--
ALTER TABLE `tbl_enter`
  MODIFY `enter_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT a táblához `tbl_finance`
--
ALTER TABLE `tbl_finance`
  MODIFY `finance_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT a táblához `tbl_mycompany`
--
ALTER TABLE `tbl_mycompany`
  MODIFY `mycompany_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `tbl_product`
--
ALTER TABLE `tbl_product`
  MODIFY `product_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT a táblához `tbl_qualification`
--
ALTER TABLE `tbl_qualification`
  MODIFY `qualification_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `tbl_sale`
--
ALTER TABLE `tbl_sale`
  MODIFY `sale_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT a táblához `tbl_staff`
--
ALTER TABLE `tbl_staff`
  MODIFY `staff_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `tbl_buy`
--
ALTER TABLE `tbl_buy`
  ADD CONSTRAINT `tbl_buy_ibfk_1` FOREIGN KEY (`staff_ID`) REFERENCES `tbl_staff` (`staff_ID`),
  ADD CONSTRAINT `tbl_buy_ibfk_2` FOREIGN KEY (`customer_ID`) REFERENCES `tbl_customer` (`customer_ID`),
  ADD CONSTRAINT `tbl_buy_ibfk_3` FOREIGN KEY (`product_ID`) REFERENCES `tbl_product` (`product_ID`);

--
-- Megkötések a táblához `tbl_enter`
--
ALTER TABLE `tbl_enter`
  ADD CONSTRAINT `tbl_enter_ibfk_1` FOREIGN KEY (`staff_ID`) REFERENCES `tbl_staff` (`staff_ID`);

--
-- Megkötések a táblához `tbl_finance`
--
ALTER TABLE `tbl_finance`
  ADD CONSTRAINT `tbl_finance_ibfk_1` FOREIGN KEY (`buy_ID`) REFERENCES `tbl_buy` (`buy_ID`),
  ADD CONSTRAINT `tbl_finance_ibfk_2` FOREIGN KEY (`sale_ID`) REFERENCES `tbl_sale` (`sale_ID`);

--
-- Megkötések a táblához `tbl_product`
--
ALTER TABLE `tbl_product`
  ADD CONSTRAINT `tbl_product_ibfk_1` FOREIGN KEY (`brand_ID`) REFERENCES `tbl_brand` (`brand_ID`),
  ADD CONSTRAINT `tbl_product_ibfk_2` FOREIGN KEY (`category_ID`) REFERENCES `tbl_category` (`category_ID`);

--
-- Megkötések a táblához `tbl_sale`
--
ALTER TABLE `tbl_sale`
  ADD CONSTRAINT `tbl_sale_ibfk_1` FOREIGN KEY (`staff_ID`) REFERENCES `tbl_staff` (`staff_ID`),
  ADD CONSTRAINT `tbl_sale_ibfk_2` FOREIGN KEY (`customer_ID`) REFERENCES `tbl_customer` (`customer_ID`),
  ADD CONSTRAINT `tbl_sale_ibfk_3` FOREIGN KEY (`product_ID`) REFERENCES `tbl_product` (`product_ID`);

--
-- Megkötések a táblához `tbl_staff`
--
ALTER TABLE `tbl_staff`
  ADD CONSTRAINT `tbl_staff_ibfk_1` FOREIGN KEY (`qualification_ID`) REFERENCES `tbl_qualification` (`qualification_ID`),
  ADD CONSTRAINT `tbl_staff_ibfk_2` FOREIGN KEY (`mycompany_ID`) REFERENCES `tbl_mycompany` (`mycompany_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
