<?php

class PartnerModel{
    
    public static function getPartnerById($id=null){       //Returns the "tbl_costumer" table data based on the "id" request

        if(!$id==null)$id='customer_ID='.$id;

        $response=Db::Select("tbl_customer", "*", $id);     //Querying the "tbl_costumer" table with "id"

        if($response==null){
            http_response_code(404);
        }
        return $response;
    }
    public static function setPartnerFromJSON(){           //Inserts the received data into table

        $json = file_get_contents('php://input');       //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);               //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        
        if(isset($data['first_name']) && isset($data['last_name']) && isset($data['status']) && isset($data['zipcode']) 
        && isset($data['address_city']) && isset($data['address_street']) && isset($data['address_number'])
        && is_string($data['first_name']) && is_string($data['last_name']) && is_bool($data['status']) 
        && is_string($data['zipcode']) && is_string($data['address_city']) && is_string($data['address_street']) && is_string($data['address_number'])){    
            
            $values='"'.$data['first_name'].'","'
            .$data['last_name'].'",'
            .(int)$data['status'].',"'
            .$data['zipcode'].'","'
            .$data['address_city'].'","'
            .$data['address_street'].'","'
            .$data['address_number'].'"';
            
            $email='';
            $tax_number='';
            $comment='';

            if(isset($data['email']) && is_string($data['email'])){
                $values.=',"'.$data['email'].'"';
                $email=',email';
            };
            if(isset($data['tax_number']) && is_string($data['tax_number'])){
                $values.=',"'.$data['tax_number'].'"';
                $tax_number=',tax_number';
            };
            if(isset($data['comment']) && is_string($data['comment'])){
                $values.=',"'.$data['comment'].'"';
                $comment=',comment';
            };
            
        }else{
            http_response_code(406);
            $response = ([
                "response" => "error",
                "message" => "Nem megfelelő adat!"
            ]);
            return $response;
        }
        $columns='first_name,last_name,status,zipcode,address_city,address_street,address_number'.$email.$tax_number.$comment;
        
        $values=implode(",", array($values));                                               //Convert to string 
        Db::Insert('tbl_customer', $columns, $values);                                          //Call the insert function with columns and values
        $last_insert_id=Db::Select('tbl_customer', 'last_insert_id()')[0]['last_insert_id()'];  //Gets the "id" of the last row inserted into the "tbl_sale" table
        $response=Db::Select('tbl_customer', '*','customer_ID='.$last_insert_id);                   //Retrieves the entire row based on "id"
        http_response_code(201);
        return $response;
    }
    public static function updatePartnerFromJSON($id){         //Updates the table data with the received data

        $json = file_get_contents('php://input');           //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);                   //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        $col_val=array();
        if(!$data==null){
            foreach ($data as $x => $y) {
                if($x=='first_name' && is_string($y) || $x=='last_name' && is_string($y) || $x=='email' && is_string($y) || $x=='tax_number' && is_string($y)
                || $x=='status' && is_bool($y) || $x=='zipcode' && is_string($y) || $x=='address_city' && is_string($y) 
                || $x=='address_street' && is_string($y) || $x=='address_number' && is_string($y) || $x=='comment' && is_string($y)){
                    if (is_bool($y)) $y=(int)$y;
                    if (is_string($y)) $y='"'.$y.'"';
                    array_push($col_val, "$x=$y");                  //Compiles the data from the received array into a new array by key-value pair
                };
            };
        };
        if(!$col_val==null){
            $columns_values=implode(",", ($col_val));           //Convert to string
            $where='customer_ID='.$id;         
            $rows=Db::Update('tbl_customer', $columns_values, $where);    //Calls the update function with the column and value pairs and the where
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
    public static function deletePartnerById($id){
        Db::SetFKChecks(0);
        $where='customer_ID='.$id;
        $rows=Db::Delete('tbl_customer', $where);       
        Db::SetFKChecks(1);
        $response='Deleted '.$rows.' rows';
        return $response;
    }
}
?>
