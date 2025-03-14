<?php

include_once 'classes/autoloader.php';

$router = new Router;
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

$router->addRoute('GET', '/vizsgamunkaMVC/', function(){
    HomeController::main('homePage');
});
$router->addRoute('GET', '/vizsgamunkaMVC/login', function(){
    HomeController::main('login');
});
$router->addRoute('GET', '/vizsgamunkaMVC/logout', function(){
    AccessController::logout();
});
$router->addRoute('POST', '/vizsgamunkaMVC/login', function(){
    AccessController::login($_POST);
});
$router->addRoute('GET', '/vizsgamunkaMVC/access', function(){
    AccessController::access();
});
$router->addRoute('GET', '/vizsgamunkaMVC/username', function(){
    UserController::userName();
});

$router->matchRoute($method, $uri);
?>