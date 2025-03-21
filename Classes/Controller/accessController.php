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
        header('Content-Type: application/json');
        
        if(isset($_SESSION['session_id']) && session_id()==$_SESSION['session_id']){
            echo json_encode(['response' => 'success', 'access_level' => $_SESSION['access_level']]);
        }
        else{
            echo json_encode(['response' => 'error', 'message' => 'Unauthorized access']);
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