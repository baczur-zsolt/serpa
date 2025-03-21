<?php

// Jogosultságok beállítása
$rolePermissions = [
    'adminisztrator' => ['Összes eladás', 'Összes termék', 'Partnerek', 'Alkalmazottak', 'Statisztika', 'Pénzügy'],
    'Vezető Eladó'   => ['Összes eladás', 'Összes termék', 'Partnerek', 'Alkalmazottak'],
    'Vezető'         => ['Összes eladás', 'Összes termék', 'Partnerek'],
    'Eladó'          => ['Összes eladás', 'Összes termék']
];

$userRole = $_SESSION['access_level'] ?? 'Eladó'; // Alapértelmezett szerepkör, ha nincs bejelentkezve
$allowedCards = $rolePermissions[$userRole] ?? [];

$cardIcons = [
    'Összes eladás' => '<svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>',
    'Összes termék' => '<svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="0 -960 960 960" width="24px" fill="#F3F3F3">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>',
    'Partnerek' => '<svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="http://www.w3.org/2000/svg" width="48px" fill="#e3e3e3"><path d="M512-960h-64v960h64V-960zM-960-480h1920v64H-960v-64z"/></svg>',
    'Alkalmazottak' => '<svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="http://www.w3.org/2000/svg" width="48px" fill="#e3e3e3"><path d="M960-480h-1920v64h1920v-64z"/></svg>',
    'Statisztika' => '<svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="http://www.w3.org/2000/svg" width="48px" fill="#e3e3e3"><path d="M450-154v-309L180-619v309l270 156Z"/></svg>',
    'Pénzügy' => '<svg xmlns="http://www.w3.org/2000/svg" height="64px" viewBox="http://www.w3.org/2000/svg" width="48px" fill="#e3e3e3"><path d="M450-154v-309L180-619v309l270 156Z"/></svg>',
];
?>

<div class="content">
    <?php
    switch ($userRole) {
        case 'adminisztrator':
            echo "<h1>Admin Dashboard</h1>";
            echo "<p>Üdvözöllek, Admin!</p>";
            echo "<a href='manage_users.php'>Felhasználók kezelése</a>";
            break;

        case 'Vezető':
            echo "<h1>Vezetői Kezelőfelület</h1>";
            echo "<p>Üdvözöllek, Vezető!</p>";
            echo "<a href='reports.php'>Statisztikák</a>";
            break;

        case 'Vezető Eladó':
            echo "<h1>Senior Eladó Dashboard</h1>";
            echo "<p>Üdvözöllek, Vezető Eladó!</p>";
            echo "<a href='sales_overview.php'>Eladások áttekintése</a>";
            break;

        case 'Eladó':
            echo "<h1>Eladói Felület</h1>";
            echo "<p>Üdvözöllek, Eladó!</p>";
            echo "<a href='new_sale.php'>Új eladás</a>";
            break;

        default:
            echo "<h1>Ismeretlen szerepkör</h1>";
            echo "<p>Nincs jogosultságod az oldal megtekintésére.</p>";
    }
    ?>
</div>

<?php 
$conn = new mysqli("localhost", "root", "", "cms_20241128");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$allSales = $conn->query("SELECT COUNT(*) AS total_sales FROM tbl_transaction")->fetch_assoc()['total_sales'];
$allProducts = $conn->query("SELECT COUNT(*) AS total_products FROM tbl_stock")->fetch_assoc()['total_products'];
$partners = $conn->query("SELECT COUNT(*) AS total_partners FROM tbl_customers")->fetch_assoc()['total_partners'];
$employees = $conn->query("SELECT COUNT(*) AS total_employees FROM tbl_staff")->fetch_assoc()['total_employees'];
//$stats = $conn->query("SELECT COUNT(*) AS total_stats FROM statistics")->fetch_assoc()['total_stats'];
//$finance = $conn->query("SELECT SUM(amount) AS total_finance FROM finances")->fetch_assoc()['total_finance'];

$conn->close(); // Kapcsolat lezárása



$allCardsData = [
    'Összes eladás' => $allSales,
    'Összes termék' => $allProducts,
    'Partnerek' => $partners,
    'Alkalmazottak' => $employees,
    //'Statisztika' => $stats,
    //'Pénzügy' => $finance . " Ft"
];

// Kártyák megjelenítése
    foreach ($allCardsData as $cardName => $value) {
        if (in_array($cardName, $allowedCards)) {
            // SVG és kártya tartalom megjelenítése
            echo "
            <div class='flex flex-col shadow p-4 bg-white rounded-md h-full'>
                <div class='flex items-center justify-between'>
                    <div>
                        <h6 class='text-xs font-medium leading-none tracking-wider text-gray-500 uppercase'>$cardName</h6>
                        <span class='text-xl font-semibold'>$value</span>
                    </div>
                    <div>
                        <span>
                            {$cardIcons[$cardName]}
                        </span>
                    </div>
                </div>
            </div>";

        
            }
        }


    ?>
