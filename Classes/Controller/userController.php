<?php
    class UserController{

        public static function getUserName(){
            $response=UserModel::getUserNameById();
            echo json_encode($response);
        }
        public static function accessLevel() {
            session_start();  // Biztosítja, hogy a session változókat elérjük
        
            if (!isset($_SESSION['staff_id'])) {
                echo json_encode([
                    "response" => "error",
                    "message" => "Nincs bejelentkezett felhasználó!"
                ]);
                return;
            }
        
            $staffId = $_SESSION['staff_id']; // A bejelentkezett felhasználó ID-je
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
                echo json_encode([
                    "response" => "success",
                    "access_level" => $level,
                    "role_name" => $roleNames[$level] ?? "Ismeretlen szerepkör"
                ]);
            } else {
                echo json_encode([
                    "response" => "error",
                    "message" => "Nincs hozzáférési szint ehhez a felhasználóhoz."
                ]);
            }
        }
        
    }
?>