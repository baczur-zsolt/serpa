<?php
class Router{

protected $routes = [];

public function addRoute(string $method, string $uri, $closure){
    $this->routes[$method][$uri]=$closure;
}
public function matchRoute(string $method, string $uri){

    $exp=explode('%7B', $uri);
    $url=$exp[0];
    
    if(isset($exp[1])){
        preg_match('/\d+/', $exp[1], $id);
        $id=$id[0];
    }else{
        $id=null;
    }
    
    if(isset($this->routes[$method][$url])){
        call_user_func($this->routes[$method][$url], $id);
        return;
    }
    header("Location: home");
}
    
}


?>