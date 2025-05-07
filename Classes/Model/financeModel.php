<?php
class financeModel{
    public static function getFinancebyId($id){
        if(!$id==null)$id='finance_ID='.$id;

        $response=Db::Select("tbl_finance LEFT JOIN tbl_sale ON tbl_finance.sale_ID=tbl_sale.sale_ID
                                          LEFT JOIN tbl_buy ON tbl_finance.buy_ID=tbl_buy.buy_ID", "*", $id);     //Querying the "tbl_finance (join tbl_sale and tbl_buy)" table with "id"

        if($response==null){
            http_response_code(404);
        }
        return $response;
    }
}