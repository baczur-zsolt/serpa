<?php

class EmployeeModel{
    
    public static function getEmployeeById($id=null){       //Returns the "tbl_costumer" table data based on the "id" request

        if(!$id==null)$id='staff_ID='.$id;

        $response=Db::Select("tbl_staff", "*", $id);     //Querying the "tbl_costumer" table with "id"

        if($response==null){
            http_response_code(404);
        }
        return $response;
    }
    public static function setEmployeeFromJSON(){           //Inserts the received data into table

        $json = file_get_contents('php://input');       //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);               //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        
        if(isset($data['first_name']) && isset($data['last_name']) && isset($data['birthdate']) && isset($data['job_position']) && isset($data['access_level']) 
        && isset($data['zipcode']) && isset($data['address_city']) && isset($data['address_street']) && isset($data['address_number']) && isset($data['phone_number'])
        && isset($data['superbrutto']) && isset($data['status'])
        && is_string($data['first_name']) && is_string($data['last_name']) && is_string($data['birthdate']) && is_string($data['job_position']) && is_int($data['access_level']) 
        && is_string($data['zipcode']) && is_string($data['address_city']) && is_string($data['address_street']) && is_string($data['address_number']) && is_string($data['phone_number'])
        && is_int($data['superbrutto']) && is_bool($data['status'])){    
            
            $values='"'.$data['first_name'].'","'
            .$data['last_name'].'","'
            .$data['birthdate'].'","'
            .$data['job_position'].'",'
            .$data['access_level'].',"'
            .$data['zipcode'].'","'
            .$data['address_city'].'","'
            .$data['address_street'].'","'
            .$data['address_number'].'","'
            .$data['phone_number'].'",'
            .$data['superbrutto'].','
            .(int)$data['status'];
            
            $qualification_ID='';
            $comment='';
            if(isset($data['qualification_ID']) && is_int($data['qualification_ID'])){
                $values.=','.$data['qualification_ID'];
                $qualification_ID=',qualification_ID';
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
        $columns='first_name,last_name,birthdate,job_position,access_level,zipcode,address_city,address_street,address_number,phone_number,superbrutto,status'.$qualification_ID.$comment;
        
        $values=implode(",", array($values));                                               //Convert to string 
        Db::Insert('tbl_staff', $columns, $values);                                          //Call the insert function with columns and values
        $last_insert_id=Db::Select('tbl_staff', 'last_insert_id()')[0]['last_insert_id()'];  //Gets the "id" of the last row inserted into the "tbl_sale" table
        $response=Db::Select('tbl_staff', '*','staff_ID='.$last_insert_id);                   //Retrieves the entire row based on "id"
        http_response_code(201);
        return $response;
    }
    public static function updateEmployeeFromJSON($id){         //Updates the table data with the received data

        $json = file_get_contents('php://input');           //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);                   //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        $col_val=array();
        if(!$data==null){
            foreach ($data as $x => $y) {
                if($x=='qualification_ID' && is_int($y) || $x=='first_name' && is_string($y) || $x=='last_name' && is_string($y) || $x=='birthdate' && is_string($y)
                || $x=='job_position' && is_string($y) || $x=='birthdate' && is_string($y) || $x=='access_level' && is_int($y) || $x=='zipcode' && is_string($y) 
                || $x=='address_city' && is_string($y) || $x=='address_street' && is_string($y) || $x=='address_number' && is_string($y) 
                || $x=='phone_number' && is_string($y) || $x=='superbrutto' && is_int($y) || $x=='status' && is_bool($y) || $x=='comment' && is_string($y)){
                    if (is_bool($y)) $y=(int)$y;
                    if (is_string($y)) $y='"'.$y.'"';
                    array_push($col_val, "$x=$y");                  //Compiles the data from the received array into a new array by key-value pair
                };
            };
        };
        if(!$col_val==null){
            $columns_values=implode(",", ($col_val));           //Convert to string
            $where='staff_ID='.$id;         
            $rows=Db::Update('tbl_staff', $columns_values, $where);    //Calls the update function with the column and value pairs and the where
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
    public static function deleteEmployeeById($id){
        Db::SetFKChecks(0);
        $where='staff_ID='.$id;
        $rows=Db::Delete('tbl_staff', $where);       
        Db::SetFKChecks(1);
        $response='Deleted '.$rows.' rows';
        return $response;
    }
}
?>
