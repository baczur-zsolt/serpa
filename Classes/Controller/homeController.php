<?php
class HomeController{
    
    public static function main($page){
        $homeModel=HomeModel::getPage($page);
        HomeView::showPage($homeModel);
    }
}
?>