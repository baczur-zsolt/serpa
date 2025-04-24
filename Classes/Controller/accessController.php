<?php
class AccessController{
    
    public static function login(){
        if(isset($_POST['email']) && isset($_POST['password'])){                                        //Checking the existence of email and password
            $where='email="'.$_POST['email'].'" AND password=SHA2("'.$_POST['password'].'", 256)';      //Create a "where" for the query
            $user=Db::Select("tbl_enter", "*", $where);                                                 //Querying the "tbl_enter" table with "where"
            if(!$user==null){                                                                       
                session_start();
                $_SESSION['staff_ID']=$user[0]['staff_ID'];                                             //Storing "staff_id" in the session
                
                $level=Db::Select("tbl_staff", "access_level", "staff_ID=".$user[0]['staff_ID']);       //Retrieving "staff" data from the "tbl_staff" table
                
                $_SESSION['access_level']=$level[0]['access_level'];    //Storing "access_level" in the session
                $_SESSION['session_id']=session_id();                   //Storing "session_id" in the session
                $_SESSION['time']=time();                               //Storing "time" in the session
                http_response_code(202);
                echo json_encode(['response' => 'success', 'message' => 'Accepted']);      //Response in JSON
            }
            else{
                http_response_code(401);
                echo json_encode(['response' => 'error', 'message' => 'Unauthorized access']);      //Response in JSON
            }
        }
        else{
            http_response_code(400);
            echo json_encode(['response' => 'error', 'message' => 'Bad Request']);      //Response in JSON
        }
    }
    public static function logout(){
        if (session_status() == PHP_SESSION_NONE) {     //Start session if not running
            session_start();  
        }
        session_unset();
        session_destroy();
        header("Location: ".$GLOBALS['myURL']."/home");           //Redirect to the home page
    }
    public static function validate($data){     //Validation of incoming data
        $data = trim($data);                    //Removes whitespace and other predefined characters
        $data = stripslashes($data);            //Removes backslashes
        $data = htmlspecialchars($data);        //Converts some predefined characters to HTML entities
        return $data;
    }
    public static function accessLevel($pageLevel){
        if (session_status() == PHP_SESSION_NONE) {     //Start session if not running
            session_start();  
        }

        $timeLimit=900;     //Timeout in seconds

        if(isset($_SESSION['access_level']) && $_SESSION['access_level']>=$pageLevel && $_SESSION['time']+$timeLimit>time()){   
            //Checks if the "access_level" exists and if the "access_level" is greater than or equal to "pageLevel and stored time + timelimit >= the current time
            $_SESSION['time']=time();   //Save current time
            return;
        }else{
            self::logout();     //Call logout function
            exit;
        }
    }
}
?>