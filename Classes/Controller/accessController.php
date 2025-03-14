<?php
class AccessController{
    
    public static function login($login){
        if(isset($_POST['email']) && isset($_POST['password'])){
            $where='email="'.$login['email'].'" AND password="'.$login['password'].'"';
            $user=Db::Select("tbl_staff", "*", $where);
            if(!$user==null){
                session_start();
                $_SESSION['staff_id']=$user[0]['staff_id'];
                $_SESSION['access_level']=$user[0]['access_level'];
                $_SESSION['session_id']=session_id();
                PageController::main();
            }
            else{
                HomeController::main('login');
            }
        }
        else{
            HomeController::main('login');
        }
    }
    public static function validate($data){
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
    public static function access(){
        session_start();
        if(isset($_SESSION['session_id']) && session_id()==$_SESSION['session_id']){
            echo json_encode(['response' => $_SESSION]);
        }
        else{
            HomeController::main('homePage');
        }
    }
    public static function logout(){
        session_start();
        session_unset();
        session_destroy();
        HomeController::main('homePage');
    }
}
?>