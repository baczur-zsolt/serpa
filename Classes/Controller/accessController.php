<?php
class AccessController{
    
    public static function login(){
        if(isset($_POST['email']) && isset($_POST['password'])){
            $where='email="'.$_POST['email'].'" AND password=SHA2("'.$_POST['password'].'", 256)';
            $user=Db::Select("tbl_enter", "*", $where);
            if(!$user==null){
                session_start();
                $_SESSION['staff_ID']=$user[0]['staff_ID'];
                
                $level=Db::Select("tbl_staff", "access_level", "staff_ID=".$user[0]['staff_ID']);
                
                $_SESSION['access_level']=$level[0]['access_level'];
                $_SESSION['session_id']=session_id();
                $_SESSION['time']=time();
                header("Location: body");
            }
            else{
                header("Location: login");
            }
        }
        else{
            header("Location: login");
        }
    }
    public static function logout(){
        if (session_status() == PHP_SESSION_NONE) {
            session_start();  
        }
        session_unset();
        session_destroy();
        header("Location: home");
    }
    public static function validate($data){
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
    public static function getUserAccessLevel(){    
        if (session_status() == PHP_SESSION_NONE) {
            session_start();  
        }
        header('Content-Type: application/json');
        
        if(isset($_SESSION['session_id']) && session_id()==$_SESSION['session_id']){
            echo json_encode(['response' => 'success', 'access_level' => $_SESSION['access_level']]);
        }
        else{
            echo json_encode(['response' => 'error', 'message' => 'Unauthorized access']);
        }
    }
    public static function accessLevel($pageLevel){
        if (session_status() == PHP_SESSION_NONE) {
            session_start();  
        }

        $timeLimit=900;

        if(isset($_SESSION['access_level']) && $_SESSION['access_level']>=$pageLevel && $_SESSION['time']+$timeLimit>time()){
            $_SESSION['time']=time();
            return;
        }else{
            self::logout();
            exit;
        }
    }
}
?>