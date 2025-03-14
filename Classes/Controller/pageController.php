<?php
class PageController{
    
    public static function main(){
        $pageModel=PageModel::getPage();
        PageView::showPage($pageModel);
    }
}
?>