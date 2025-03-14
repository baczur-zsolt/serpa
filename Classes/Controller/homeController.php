<?php
class HomeController{
    
    public static function main($page){
        $homeModel=HomeModel::getPage($page);
        PageView::showPage($homeModel);
    }
}
?>