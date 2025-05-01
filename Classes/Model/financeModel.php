<?php
class financeModel{
    public static function getFinancebyId($id){
        if(!$id==null)$id='finance_ID='.$id;

        $response=Db::Select("tbl_finance", "*", $id);     //Querying the "tbl_finance" table with "id"

        if($response==null){
            http_response_code(404);
        }
        return $response;
    }
}