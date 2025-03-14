<?php
class PageModel{
    public static function getPage(){
        
        $level=$_SESSION['access_level'];
        
        ob_start();
        include_once 'Frontend/pages/header.html';
        include_once 'Frontend/pages/menu_level'.$level.'.html';
        include_once 'Frontend/pages/body.html';
        return ob_get_clean();
    }
}
?>