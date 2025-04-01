<?php
    class EmployeeController{
        
        public static function getEmployee($id=null){
            $response=EmployeeModel::getEmployeeById($id);
            echo json_encode($response);
        }
        public static function setEmployee(){ 
            $response=EmployeeModel::setEmployeeFromJSON(); 
            echo json_encode($response);
        }
        public static function updateEmployee($id){
            $response=EmployeeModel::updateEmployeeFromJSON($id);
            echo json_encode($response);
        }
        public static function deleteEmployee($id){
            $response=EmployeeModel::deleteEmployeeById($id);
            echo json_encode($response);
        }
    }
?>