<?php

include_once 'classes/autoloader.php';

$router = new Router;
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];


// View
$router->addRoute('GET', '/vizsgamunkaMVC/home', function(){
    HomeController::main('homePage');
});
$router->addRoute('GET', '/vizsgamunkaMVC/login', function(){
    HomeController::main('login');
});
$router->addRoute('GET', '/vizsgamunkaMVC/body', function() {
    AccessController::accessLevel(1);
    PageController::main();
});
$router->addRoute('GET', '/vizsgamunkaMVC/dashboard', function() {
    AccessController::accessLevel(1);
    PageController::main('dashboard');
});
$router->addRoute('GET', '/vizsgamunkaMVC/products', function() {
    AccessController::accessLevel(2);
    PageController::main('products');
});
$router->addRoute('GET', '/vizsgamunkaMVC/partners', function() {
    AccessController::accessLevel(2);
    PageController::main('partners');
});
$router->addRoute('GET', '/vizsgamunkaMVC/employees', function() {
    AccessController::accessLevel(3);
    PageController::main('employees');
});
$router->addRoute('GET', '/vizsgamunkaMVC/statistics', function() {
    AccessController::accessLevel(3);
    PageController::main('statistics');
});
$router->addRoute('GET', '/vizsgamunkaMVC/finances', function() {
    AccessController::accessLevel(3);
    PageController::main('finances');
});



//Access
$router->addRoute('GET', '/vizsgamunkaMVC/logout', function(){
    AccessController::logout();
});
$router->addRoute('POST', '/vizsgamunkaMVC/login', function(){
    AccessController::login();
});
$router->addRoute('GET', '/vizsgamunkaMVC/access', function(){
    AccessController::accessLevel(1);
    AccessController::getUserAccessLevel();
});


//Card
$router->addRoute('GET', '/vizsgamunkaMVC/cards', function() {
    AccessController::accessLevel(1);
    CardController::main();
});


//User
$router->addRoute('GET', '/vizsgamunkaMVC/username', function(){
    AccessController::accessLevel(1);
    UserController::getUserName();
});
$router->addRoute('GET', '/vizsgamunkaMVC/access_level', function(){
    AccessController::accessLevel(1);
    UserController::getUserAccessLevel();
});


//Get, Set
$router->addRoute('GET', '/vizsgamunkaMVC/sale', function($id){
    AccessController::accessLevel(1);
    SaleController::getSale($id);
});
$router->addRoute('POST', '/vizsgamunkaMVC/sale', function(){
    AccessController::accessLevel(1);
    SaleController::setSale();
});
$router->addRoute('PUT', '/vizsgamunkaMVC/sale', function($id){
    AccessController::accessLevel(1);
    SaleController::updateSale($id);
});
$router->addRoute('DELETE', '/vizsgamunkaMVC/sale', function($id){
    AccessController::accessLevel(1);
    SaleController::deleteSale($id);
});


$router->matchRoute($method, $uri);

?>