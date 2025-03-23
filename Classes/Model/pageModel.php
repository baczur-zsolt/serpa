<?php
class PageModel{
    public static function getPage($page = 'body'){
        if (session_status() == PHP_SESSION_NONE) {
            session_start();  
        }
        
        $level=$_SESSION['access_level'];

        ob_start();
        include_once 'Frontend/pages/header.html';
        include_once 'Frontend/pages/menu_level'.$level.'.html';
        include_once 'Frontend/pages/' . $page . '.html';
        return ob_get_clean();
    }
}
?>