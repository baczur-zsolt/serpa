<?php

spl_autoload_register(function($class){
    $class=strtolower($class);
    $class=str_replace("\\", "/", $class);
    $paths=['','/Controller','/Model','/View'];

    foreach($paths as $path){
        $file = __DIR__.$path."/".$class.".php";
        if(file_exists($file)) require_once $file;
    }   
});

?>