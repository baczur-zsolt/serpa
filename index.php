<?php

include_once "classes/autoloader.php";
require_once('tcpdf/tcpdf.php');

$router = new Router;
$method = $_SERVER["REQUEST_METHOD"];
$uri = $_SERVER["REQUEST_URI"];
$myURL = "/serpa";


// Show pages
$router->addRoute("GET", "$myURL/home", function(){
    HomeController::main("homePage");
});
$router->addRoute("GET", "$myURL/login", function(){
    HomeController::main("login");
});
$router->addRoute("GET", "$myURL/dashboard", function() {
    AccessController::accessLevel(1);
    PageController::main();
});
$router->addRoute("GET", "$myURL/sales", function() {
    AccessController::accessLevel(1);
    PageController::main("sales");
});
$router->addRoute("GET", "$myURL/products", function() {
    AccessController::accessLevel(2);
    PageController::main("products");
});
$router->addRoute("GET", "$myURL/partners", function() {
    AccessController::accessLevel(2);
    PageController::main("partners");
});
$router->addRoute("GET", "$myURL/employees", function() {
    AccessController::accessLevel(3);
    PageController::main("employees");
});
$router->addRoute("GET", "$myURL/statistics", function() {
    AccessController::accessLevel(3);
    PageController::main("statistics");
});
$router->addRoute("GET", "$myURL/finances", function() {
    AccessController::accessLevel(3);
    PageController::main("finances");
});


//Show cards
$router->addRoute("GET", "$myURL/cards", function() {
    AccessController::accessLevel(1);
    CardController::main();
});


//Access management
$router->addRoute("POST", "$myURL/login", function(){
    AccessController::login();
});
$router->addRoute("GET", "$myURL/logout", function(){
    AccessController::logout();
});


//JSON data request, response
//User
$router->addRoute("GET", "$myURL/username", function(){
    AccessController::accessLevel(1);
    UserController::getUserName();
});
$router->addRoute("GET", "$myURL/access_level", function(){
    AccessController::accessLevel(1);
    UserController::getUserAccessLevel();
});
//Sales
$router->addRoute("GET", "$myURL/sale", function($id){
    AccessController::accessLevel(1);
    SaleController::getSale($id);
});
$router->addRoute("POST", "$myURL/sale", function(){
    AccessController::accessLevel(1);
    SaleController::setSale();
});
$router->addRoute("PUT", "$myURL/sale", function($id){
    AccessController::accessLevel(1);
    SaleController::updateSale($id);
});
$router->addRoute("DELETE", "$myURL/sale", function($id){
    AccessController::accessLevel(1);
    SaleController::deleteSale($id);
});
//Buy
$router->addRoute("GET", "$myURL/buy", function($id){
    AccessController::accessLevel(1);
    BuyController::getBuy($id);
});
$router->addRoute("POST", "$myURL/buy", function(){
    AccessController::accessLevel(1);
    BuyController::setBuy();
});
//Products
$router->addRoute("GET", "$myURL/product", function($id){
    AccessController::accessLevel(2);
    ProductController::getProduct($id);
});
$router->addRoute("POST", "$myURL/product", function(){
    AccessController::accessLevel(2);
    ProductController::setProduct();
});
$router->addRoute("PUT", "$myURL/product", function($id){
    AccessController::accessLevel(2);
    ProductController::updateProduct($id);
});
$router->addRoute("DELETE", "$myURL/product", function($id){
    AccessController::accessLevel(2);
    ProductController::deleteProduct($id);
});
//Partners
$router->addRoute("GET", "$myURL/partner", function($id){
    AccessController::accessLevel(2);
    PartnerController::getPartner($id);
});
$router->addRoute("POST", "$myURL/partner", function(){
    AccessController::accessLevel(2);
    PartnerController::setPartner();
});
$router->addRoute("PUT", "$myURL/partner", function($id){
    AccessController::accessLevel(2);
    PartnerController::updatePartner($id);
});
$router->addRoute("DELETE", "$myURL/partner", function($id){
    AccessController::accessLevel(2);
    PartnerController::deletePartner($id);
});
//Eployees
$router->addRoute("GET", "$myURL/employee", function($id){
    AccessController::accessLevel(3);
    EmployeeController::getEmployee($id);
});
$router->addRoute("POST", "$myURL/employee", function(){
    AccessController::accessLevel(3);
    EmployeeController::setEmployee();
});
$router->addRoute("PUT", "$myURL/employee", function($id){
    AccessController::accessLevel(3);
    EmployeeController::updateEmployee($id);
});
$router->addRoute("DELETE", "$myURL/employee", function($id){
    AccessController::accessLevel(3);
    EmployeeController::deleteEmployee($id);
});
//Finance
$router->addRoute("GET", "$myURL/finance", function($id){
    AccessController::accessLevel(3);
    FinanceController::getFinance($id);
});
//Invoice
$router->addRoute("GET", "$myURL/invoice", function($in){
    AccessController::accessLevel(1);
    InvoiceController::getInvoice($in);
});

$router->matchRoute($method, $uri);
?>
