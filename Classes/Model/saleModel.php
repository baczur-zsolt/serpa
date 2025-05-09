<?php

class SaleModel{
    
    public static function getSaleByBillNumber($in=null){       //Returns the "tbl_sale" table data based on the "id" request

        $in=str_pad($in, 6, "0", STR_PAD_LEFT);
        if(!$in==null)$in='bill_number LIKE "%-'.$in.'"';

        $response=Db::Select("tbl_sale", "*", $in);     //Querying the "tbl_sale" table with "id"
        
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
    public static function setSaleFromJSON($json=null){           //Inserts the received data into table

        if($json==null)$json = file_get_contents('php://input');       //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data_in = json_decode($json, true);               //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE

        $b_n = Db::Select("tbl_sale", "MAX(bill_number)");
        foreach($data_in as $data){
            if(isset($data['staff_ID']) && isset($data['customer_ID']) && isset($data['product_ID']) && isset($data['quantity_sale'])
            && is_int($data['staff_ID']) && is_int($data['customer_ID']) && is_int($data['product_ID']) && is_int($data['quantity_sale'])) {
                
                
                $number = explode("-", $b_n[0]["MAX(bill_number)"]);
                $num=$number[2]+1;
                $comment='';

                while(strlen($num)<6) $num="0".$num;

                $bill_number = $number[0]."-".$number[1]."-".$num;

                $values=$data['staff_ID'].","
                .$data['customer_ID'].","
                .$data['product_ID'].","
                .$data['quantity_sale'].",'"
                .$bill_number."'";
                if(isset($data['comment'])){
                    $values.=",'".$data['comment']."'";
                    $comment=',comment';
                }
            }else{
                http_response_code(406);
                $response = ([
                    "response" => "error",
                    "message" => "Nem megfelelő adat!"
                ]);
                return $response;
            }
           
            $columns='staff_ID,customer_ID,product_ID,quantity_sale,bill_number'.$comment;
            
            $values=implode(",", array($values));                                               //Convert to string 
            Db::Insert('tbl_sale', $columns, $values);                                          //Call the insert function with columns and values
            $last_insert_id=Db::Select('tbl_sale', 'last_insert_id()')[0]['last_insert_id()'];  //Gets the "id" of the last row inserted into the "tbl_sale" table
            $response=Db::Select('tbl_sale', '*','sale_ID='.$last_insert_id);                   //Retrieves the entire row based on "id"
        }
        http_response_code(201);
        return $data;
    }
    public static function updateSaleFromJSON($id){         //Updates the table data with the received data

        $json = file_get_contents('php://input');           //"php://input" is a read-only stream that allows you to read raw data from the request body
        $data = json_decode($json, true);                   //Decoding json data returns an ARRAY if the parameter is TRUE, an OBJECT if it is FALSE
        $col_val=array();
        if(!$data==null){
            foreach ($data as $x => $y) {
                if($x=='staff_ID' && is_int($y) || $x=='customer_ID' && is_int($y) || $x=='product_ID' && is_int($y) || 
                $x=='quantity_sale' && is_int($y) || $x=='bill_number' && is_string($y) || $x=='comment' && is_string($y)){
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
    public static function deleteSaleByBillNumber($in){
        // Db::SetFKChecks(0);
        // $where='sale_ID='.$id;
        // $rows=Db::Delete('tbl_sale', $where);       
        // Db::SetFKChecks(1);
        // $response='Deleted '.$rows.' rows';
        $data=self::getSaleByBillNumber($in);
        $invoice=Db::Select("tbl_sale", "*");
        foreach($invoice as $in){
            if($in['comment']=="A(z) ".$data[0]['bill_number']." számú számla jóváírása."){
                http_response_code(406);
                $response = ([
                    "response" => "error",
                    "message" => "Ehhez a számlához már készült jóváíró számla!"
                ]);
                return $response;
                exit;
            }
        }
        $request=array();
        for($i=0; $i<count($data); $i++){
            $a=array(
                "staff_ID"=>$data[$i]['staff_ID'],
                "customer_ID"=>$data[$i]['customer_ID'],
                "product_ID"=>$data[$i]['product_ID'],
                "quantity_sale"=>$data[$i]['quantity_sale']*-1,
                "comment"=>"A(z) ".$data[$i]['bill_number']." számú számla jóváírása."
            );
            array_push($request, $a);
        }
        $response=self::setSaleFromJSON(json_encode($request));
        return $response;
    }
}
?>
