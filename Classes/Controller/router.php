<?php
class Router{

protected $routes = [];

public function addRoute(string $method, string $uri, $closure){
    $this->routes[$method][$uri]=$closure;
}
public function matchRoute(string $method, string $uri){

    $exp=explode('/', $uri);
    $url="/".$exp[1]."/".$exp[2];
    
    if(isset($exp[3])){
        $id=(int)$exp[3];
        if($id==0)$id=null;
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