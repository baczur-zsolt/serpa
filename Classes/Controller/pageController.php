<?php
class PageController{
    
    public static function main($page='body'){
        $pageModel=PageModel::getPage($page);
        PageView::showPage($pageModel);
    }
}
?>