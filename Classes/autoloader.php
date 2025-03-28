<?php

spl_autoload_register(function($class){
    $class=strtolower($class);                      //conversion to lowercase
    $class=str_replace("\\", "/", $class);          //Replace "\\" characters with "/" characters
    $paths=['','/Controller','/Model','/View'];     //Add paths

    foreach($paths as $path){
        $file = __DIR__.$path."/".$class.".php";    //Create file path
        if(file_exists($file)) require_once $file;  //Embed code from a file
    }   
});

?>