<?php

class SaleModel{
    
    public static function getSaleById($id=null){       //Returns the "tbl_sale" table data based on the "id" request

        if(!$id==null)$id='sale_ID='.$id;

        $response=Db::Select("tbl_sale", "*", $id);     //Querying the "tbl_sale" table with "id"
        
        if($response==null){
            http_response_code(404);
        }
        return $response;
    }
    public static function setSaleFromJSON(){           //Inserts the received data into table

        $json = file_get_contents('php://input');       //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);               //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        
        if(isset($data['staff_ID']) && isset($data['customer_ID']) && isset($data['product_ID']) && isset($data['quantity_sale'])){
            $values=$data['staff_ID'].","
            .$data['customer_ID'].","
            .$data['product_ID'].","
            .$data['quantity_sale'];
        }else{
            http_response_code(406);
            $response = ([
                "response" => "error",
                "message" => "Nem megfelelő adat!"
            ]);
            return $response;
        }
        $columns='staff_ID,customer_ID,product_ID,quantity_sale,total_price';
        
        $values=implode(",", array($values));                                               //Convert to string 
        Db::Insert('tbl_sale', $columns, $values);                                          //Call the insert function with columns and values
        $last_insert_id=Db::Select('tbl_sale', 'last_insert_id()')[0]['last_insert_id()'];  //Gets the "id" of the last row inserted into the "tbl_sale" table
        $response=Db::Select('tbl_sale', '*','sale_ID='.$last_insert_id);                   //Retrieves the entire row based on "id"
        http_response_code(201);
        return $response;
    }
    public static function updateSaleFromJSON($id){         //Updates the table data with the received data

        $json = file_get_contents('php://input');           //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);                   //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        $col_val=array();       
        foreach ($data as $x => $y) {
            array_push($col_val, "$x=$y");                  //Compiles the data from the received array into a new array by key-value pair
          };
        
        $columns_values=implode(",", ($col_val));           //Convert to string
        $where='sale_ID='.$id;
        
        Db::Update('tbl_sale', $columns_values, $where);    //Calls the update function with the column and value pairs and the where

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
