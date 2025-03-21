<?php

class UserModel{
    
    public static function getUserNameById(){
        session_start();
        if(isset($_SESSION['staff_ID'])){
            $id=$_SESSION['staff_ID'];
            $response=Db::Select("tbl_staff", "first_name,last_name", "staff_id=$id");
        }else{
            http_response_code(401);
            $response=null;
        }
        return $response;
    }
}
?>
