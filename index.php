<?php

include_once 'classes/autoloader.php';

$router = new Router;
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

$router->addRoute('GET', '/vizsgamunkaMVCTamas/page', function() {
    PageModel::getPage(); // A dinamikus menü adatainak küldése JSON-ban
});

$router->addRoute('GET', '/vizsgamunkaMVC', function(){
    HomeController::main('homePage');
});
$router->addRoute('GET', '/vizsgamunkaMVC/login', function(){
    HomeController::main('login');
});
$router->addRoute('GET', '/vizsgamunkaMVC/logout', function(){
    AccessController::logout();
});
$router->addRoute('POST', '/vizsgamunkaMVC/login', function(){
    AccessController::login();
});
$router->addRoute('GET', '/vizsgamunkaMVC/access', function(){
    AccessController::access();
});
$router->addRoute('GET', '/vizsgamunkaMVC/cards', function() {
    CardController::main();
});
$router->addRoute('GET', '/vizsgamunkaMVC/username', function(){
    UserController::getUserName();
});
$router->addRoute('GET', '/vizsgamunkaMVC/access_level', function(){
    UserController::accessLevel();
});
$router->addRoute('GET', '/vizsgamunkaMVC/sale', function(){
    SaleController::getSale();
});
$router->addRoute('GET', '/vizsgamunkaMVC/buy/', function($id){
    SaleController::getSale($id);
});
$router->addRoute('POST', '/vizsgamunkaMVC/buy', function(){
    SaleController::setSale();
});
$router->addRoute('GET', '/vizsgamunkaMVC/dashboard', function() {
    PageController::main('dashboard');
});
$router->addRoute('GET', '/vizsgamunkaMVC/products', function() {
    PageController::main('products');
});
$router->addRoute('GET', '/vizsgamunkaMVC/partners', function() {
    PageController::main('partners');
});
$router->addRoute('GET', '/vizsgamunkaMVC/employees', function() {
    PageController::main('employees');
});
$router->addRoute('GET', '/vizsgamunkaMVC/statistics', function() {
    PageController::main('statistics');
});
$router->addRoute('GET', '/vizsgamunkaMVC/finances', function() {
    PageController::main('finances');
});

$router->matchRoute($method, $uri);

?>