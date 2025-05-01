<?php
class FinanceController{
    public static function getFinance($id=null){
        $response=FinanceModel::getFinanceById($id);
        echo json_encode($response);
    }
}