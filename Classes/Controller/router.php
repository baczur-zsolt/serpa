<?php
class Router{

protected $routes = [];

public function addRoute(string $method, string $uri, $closure){
    $this->routes[$method][$uri]=$closure;
}
public function matchRoute(string $method, string $uri){
    if(isset($this->routes[$method][$uri])){
        call_user_func($this->routes[$method][$uri]);
        return;
    }
    HomeController::main('homePage');
}
    
}


?>