<?php
    class UserController{
        public static function userName(){
            session_start();
            $response=Db::getUserName($_SESSION['staff_id']);
            echo json_encode([$response]);
        }
    }
?>