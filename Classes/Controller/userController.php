<?php
    class UserController{

        public static function getUserName(){
            $response=UserModel::getUserNameById();
            echo json_encode($response);
        }
        public static function getUserAccessLevel(){
            $response=UserModel::accessLevel();
            echo json_encode($response);
        }
    }
?>