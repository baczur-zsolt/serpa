<?php

class ProductModel{
    
    public static function getProductById($id=null){       //Returns the "tbl_sale" table data based on the "id" request

        if(!$id==null)$id='product_ID='.$id;

        $response=Db::Select("tbl_product", "*", $id);     //Querying the "tbl_sale" table with "id"
        
        $productId='product_ID='.$response[0]['product_ID'];

        // $res2=Db::Select("tbl_product", "product_name", $productId);   
        // array_push($response, $res2[0]);

        if($response==null){
            http_response_code(404);
        }
        return $response;
    }
    public static function setProductFromJSON(){           //Inserts the received data into table

        $json = file_get_contents('php://input');       //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);               //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        
        if(isset($data['product_number']) && isset($data['product_name']) && isset($data['product_price']) 
        && isset($data['product_profit_price']) && isset($data['stock_number']) && isset($data['status'])
        && is_string($data['product_number']) && is_string($data['product_name']) && is_int($data['product_price']) 
        && is_int($data['product_profit_price']) && is_int($data['stock_number']) && is_bool($data['status'])){    
            
            $values='"'.$data['product_number'].'","'
            .$data['product_name'].'",'
            .$data['product_price'].','
            .$data['product_profit_price'].','
            .$data['stock_number'].','
            .(int)$data['status'];
            
            $brand_ID='';
            $category_ID='';
            if(isset($data['brand_ID']) && is_int($data['brand_ID'])){
                $values.=','.$data['brand_ID'];
                $brand_ID=',brand_ID';
            };
            if(isset($data['category_ID']) && is_int($data['category_ID'])){
                $values.=','.$data['category_ID'];
                $category_ID=',category_ID';
            };
        }else{
            http_response_code(406);
            $response = ([
                "response" => "error",
                "message" => "Nem megfelelő adat!"
            ]);
            return $response;
        }
        $columns='product_number,product_name,product_price,product_profit_price,stock_number,status'.$brand_ID.$category_ID;
        
        $values=implode(",", array($values));                                               //Convert to string 
        Db::Insert('tbl_product', $columns, $values);                                          //Call the insert function with columns and values
        $last_insert_id=Db::Select('tbl_product', 'last_insert_id()')[0]['last_insert_id()'];  //Gets the "id" of the last row inserted into the "tbl_sale" table
        $response=Db::Select('tbl_product', '*','product_ID='.$last_insert_id);                   //Retrieves the entire row based on "id"
        http_response_code(201);
        return $response;
    }
    public static function updateProductFromJSON($id){         //Updates the table data with the received data

        $json = file_get_contents('php://input');           //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);                   //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        $col_val=array();
        if(!$data==null){
            foreach ($data as $x => $y) {
                if($x=='product_number' && is_string($y) || $x=='product_name' && is_string($y) || $x=='product_price' && is_int($y)
                || $x=='product_profit_price' && is_int($y) || $x=='stock_number' && is_int($y) || $x=='status' && is_bool($y) 
                || $x=='brand_ID' && is_int($y) || $x=='category_ID' && is_int($y)){
                    if (is_bool($y)) $y=(int)$y;
                    if (is_string($y)) $y='"'.$y.'"';
                    array_push($col_val, "$x=$y");                  //Compiles the data from the received array into a new array by key-value pair
                };
            };
        };
        if(!$col_val==null){
            $columns_values=implode(",", ($col_val));           //Convert to string
            $where='product_ID='.$id;         
            $rows=Db::Update('tbl_product', $columns_values, $where);    //Calls the update function with the column and value pairs and the where
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
    public static function deleteProductById($id){
        Db::SetFKChecks(0);
        $where='product_ID='.$id;
        $rows=Db::Delete('tbl_product', $where);       
        Db::SetFKChecks(1);
        $response='Deleted '.$rows.' rows';
        return $response;
    }
}
?>
