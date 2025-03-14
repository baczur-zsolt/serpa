<?php
class HomeModel{
    public static function getPage($page){
        ob_start();
        include_once 'Frontend/pages/'.$page.'.html';
        return ob_get_clean();
    }
}
?>