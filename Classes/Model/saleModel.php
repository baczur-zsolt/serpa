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

        $values=$data['staff_ID'].","
        .$data['customer_ID'].","
        .$data['product_ID'].","
        .$data['quantity_sale'].","
        .$data['total_price'];
        
        $values=implode(",", array($values));   //Convert to string
      
        Db::Insert('tbl_sale', $columns, $values);
        $last_insert_id=Db::Select('tbl_sale', 'last_insert_id()')[0]['last_insert_id()'];

        $response=Db::Select('tbl_sale', '*','sale_ID='.$last_insert_id);

        return $response;
    }
    public static function updateSaleFromJSON($id){

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);       //true = tömb , false = objektum

        $col_val=array();
        foreach ($data as $x => $y) {
            array_push($col_val, "$x=$y");
          };
        
        $columns_values=implode(",", ($col_val));
        $where='sale_ID='.$id;
        
        Db::Update('tbl_sale', $columns_values, $where);

        $response='OK';
        return $response;
    }
    public static function deleteSaleById($id){
        $where='sale_ID='.$id;
        Db::Delete('tbl_sale', $where);
        
        $response='OK';
        return $where;
    }
}
?>
