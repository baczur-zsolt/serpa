<?php

include_once 'classes/autoloader.php';

$router = new Router;
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];


// Show pages
$router->addRoute('GET', '/vizsgamunkaMVC/home', function(){
    HomeController::main('homePage');
});
$router->addRoute('GET', '/vizsgamunkaMVC/login', function(){
    HomeController::main('login');
});
$router->addRoute('GET', '/vizsgamunkaMVC/dashboard', function() {
    AccessController::accessLevel(1);
    PageController::main();
});
$router->addRoute('GET', '/vizsgamunkaMVC/sales', function() {
    AccessController::accessLevel(1);
    PageController::main('sales');
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


//Show cards
$router->addRoute('GET', '/vizsgamunkaMVC/cards', function() {
    AccessController::accessLevel(1);
    CardController::main();
});


//Access management
$router->addRoute('POST', '/vizsgamunkaMVC/login', function(){
    AccessController::login();
});
$router->addRoute('GET', '/vizsgamunkaMVC/logout', function(){
    AccessController::logout();
});


//JSON data request, response
//User
$router->addRoute('GET', '/vizsgamunkaMVC/username', function(){
    AccessController::accessLevel(1);
    UserController::getUserName();
});
$router->addRoute('GET', '/vizsgamunkaMVC/access_level', function(){
    AccessController::accessLevel(1);
    UserController::getUserAccessLevel();
});
//Sales
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
//Products
$router->addRoute('GET', '/vizsgamunkaMVC/product', function($id){
    AccessController::accessLevel(2);
    ProductController::getProduct($id);
});
$router->addRoute('POST', '/vizsgamunkaMVC/product', function(){
    AccessController::accessLevel(2);
    ProductController::setProduct();
});
$router->addRoute('PUT', '/vizsgamunkaMVC/product', function($id){
    AccessController::accessLevel(2);
    ProductController::updateProduct($id);
});
$router->addRoute('DELETE', '/vizsgamunkaMVC/product', function($id){
    AccessController::accessLevel(2);
    ProductController::deleteProduct($id);
});


$router->matchRoute($method, $uri);
?>
