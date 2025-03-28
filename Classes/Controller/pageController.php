<?php
class PageController{
    
    public static function main($page='dashboard'){
        $pageModel=PageModel::getPage($page);
        PageView::showPage($pageModel);
    }
}
?>