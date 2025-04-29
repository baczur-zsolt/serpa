<?php

class UserModel{
    
    public static function getUserNameById(){
        if (session_status() == PHP_SESSION_NONE) {
            session_start();  
        }
        if(isset($_SESSION['staff_ID'])){
            $id=$_SESSION['staff_ID'];
            $response=Db::Select("tbl_staff", "staff_ID,first_name,last_name", "staff_id=$id");
        }else{
            http_response_code(401);
            $response=null;
        }
        return $response;
    }
    public static function accessLevel() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();  
        }
    
        if (!isset($_SESSION['staff_ID'])) {
            $response = ([
                "response" => "error",
                "message" => "Nincs bejelentkezett felhasználó!"
            ]);
            return $response;
        }
    
        $staffId = $_SESSION['staff_ID']; // A bejelentkezett felhasználó ID-je
        $accessLevel = Db::Select("tbl_staff", "access_level", "staff_ID = $staffId");
    
        header('Content-Type: application/json');
    
        // Access Level megnevezések
        $roleNames = [
            1 => "Eladó",
            2 => "Vezető Eladó",
            3 => "Vezető",
            4 => "Szuperadmin"
        ];
    
        if ($accessLevel) {
            $level = $accessLevel[0]['access_level'];
            return ([
                "response" => "success",
                "access_level" => $level,
                "role_name" => $roleNames[$level] ?? "Ismeretlen szerepkör"
            ]);
        } else {
            return ([
                "response" => "error",
                "message" => "Nincs hozzáférési szint ehhez a felhasználóhoz."
            ]);
        }
    }
}
?>
