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
    public static function updateBuyFromJSON($id){         //Updates the table data with the received data

        $json = file_get_contents('php://input');           //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);                   //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        $col_val=array();
        if(!$data==null){
            foreach ($data as $x => $y) {
                if($x=='staff_ID' && is_int($y) || $x=='customer_ID' && is_int($y) || $x=='product_ID' && is_int($y) || 
                $x=='quantity_sale' && is_int($y) || $x=='bill_number' && is_string($y)){
                    array_push($col_val, "$x=$y");                  //Compiles the data from the received array into a new array by key-value pair
                };
            };
        };
        if(!$col_val==null){
            $columns_values=implode(",", ($col_val));           //Convert to string
            $where='sale_ID='.$id;         
            $rows=Db::Update('tbl_sale', $columns_values, $where);    //Calls the update function with the column and value pairs and the where
            $response='Updated '.$rows.' rows';
            return $response;
        }else{
            http_response_code(406);
            $response = ([
                "response" => "error",
                "message" => "Nem megfelelő adat!"
            ]);
            return $response;
        }
    }
    public static function deleteBuyById($id){
        // Db::SetFKChecks(0);
        // $where='sale_ID='.$id;
        // $rows=Db::Delete('tbl_sale', $where);       
        // Db::SetFKChecks(1);
        // $response='Deleted '.$rows.' rows';
        $data=self::getBuyById($id);
        $request=array(
                "staff_ID"=>$data[0]['staff_ID'],
                "customer_ID"=>$data[0]['customer_ID'],
                "product_ID"=>$data[0]['product_ID'],
                "quantity_sale"=>$data[0]['quantity_sale']*-1,
                "bill_number"=>$data[0]['bill_number']
        );

        $response=self::setBuyFromJSON(json_encode($request));
        return $response;
    }
}
?>
