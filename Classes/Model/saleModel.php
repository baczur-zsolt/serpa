<?php

class SaleModel{
    
    public static function getSaleById($id=null){

        if(!$id==null)$id='sale_ID='.$id;

        $response=Db::Select("tbl_sale", "*", $id);
        
        if($response==null){
            http_response_code(404);
        }
        return $response;
    }
    public static function setSaleFromJSON(){
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);       //true = tömb , false = objektum

        $columns=implode(",", array_keys($data));   //Convert to string

        $values="'".$data['sale_date']."',".$data['quantity'].",".$data['total_price'];
        $values=implode(",", array($values));
         
        $response=Db::Insert('tbl_sale', $columns, $values);

        return $response;
    }
}
?>
