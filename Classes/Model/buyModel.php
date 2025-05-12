<?php

class BuyModel{
    
    public static function getBuyById($id=null){       //Returns the "tbl_sale" table data based on the "id" request

        if(!$id==null)$id='buy_ID='.$id;

        $response=Db::Select("tbl_buy", "*", $id);     //Querying the "tbl_sale" table with "id"
        
        for($i=0; $i<count($response); $i++){
            $productId='product_ID='.$response[$i]['product_ID'];
            $res2=Db::Select("tbl_product", "product_name", $productId);
            $response[$i]+=$res2[0];
        }

        if($response==null){
            http_response_code(404);
        }
        return $response;
    }
    public static function setBuyFromJSON($json=null){           //Inserts the received data into table

        if($json==null)$json = file_get_contents('php://input');       //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data_in = json_decode($json, true);               //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        
        foreach($data_in as $data){
            if(isset($data['staff_ID']) && isset($data['customer_ID']) && isset($data['product_ID']) && isset($data['quantity_buy']) && isset($data['bill_number'])
            && is_int($data['staff_ID']) && is_int($data['customer_ID']) && is_int($data['product_ID']) && is_int($data['quantity_buy']) && is_string($data['bill_number'])) {
                
                $values=$data['staff_ID'].","
                .$data['customer_ID'].","
                .$data['product_ID'].","
                .$data['quantity_buy'].",'"
                .$data['bill_number']."'";
            }else{
                http_response_code(406);
                $response = ([
                    "response" => "error",
                    "message" => "Nem megfelelő adat!"
                ]);
                return $response;
            }
           
            $columns='staff_ID,customer_ID,product_ID,quantity_buy,bill_number';
            
            $values=implode(",", array($values));                                               //Convert to string 
            Db::Insert('tbl_buy', $columns, $values);                                          //Call the insert function with columns and values
            $last_insert_id=Db::Select('tbl_buy', 'last_insert_id()')[0]['last_insert_id()'];  //Gets the "id" of the last row inserted into the "tbl_sale" table
            $response=Db::Select('tbl_buy', '*','buy_ID='.$last_insert_id);                   //Retrieves the entire row based on "id"
        }
        http_response_code(201);
        return $data_in;
    }
}
?>
