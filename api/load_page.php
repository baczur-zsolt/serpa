<?php
session_start();

// Felhasználói jogosultság lekérése (pl. bejelentkezéskor beállított SESSION változó)
$user_role = $_SESSION['role'] ?? '';

// Jogosultságok és elérhető oldalak definiálása
$roles = [
    'Eladó' => ['products', 'sales'],
    'Vezető' => ['products', 'sales', 'stats'],
    'Vezető Eladó' => ['products', 'sales', 'employees'],
    'Adminisztrátor' => ['products', 'sales', 'stats', 'finance', 'employees']
];

// Ellenőrizzük, hogy melyik oldalhoz kér hozzáférést a felhasználó
$page = $_GET['page'] ?? '';

if (!$page || !isset($roles[$user_role]) || !in_array($page, $roles[$user_role])) {
    http_response_code(403); // 403 Forbidden, ha nincs engedélye
    echo "Hozzáférés megtagadva.";
    exit;
}

// Ha a felhasználónak van joga, betöltjük az oldalt
$page_file = "../pages/{$page}.html"; // Az oldalak a /pages mappában vannak

if (file_exists($page_file)) {
    echo file_get_contents($page_file);
} else {
    http_response_code(404);
    echo "Az oldal nem található.";
}
?>
