<?php
    class InvoiceController{
        
        public static function getInvoice($in){
            $response=InvoiceModel::getInvoiceByBillNumber($in);
            echo json_encode($response);
        }
        // public static function setEmployee(){ 
        //     $response=EmployeeModel::setEmployeeFromJSON(); 
        //     echo json_encode($response);
        // }
        // public static function updateEmployee($id){
        //     $response=EmployeeModel::updateEmployeeFromJSON($id);
        //     echo json_encode($response);
        // }
        // public static function deleteEmployee($id){
        //     $response=EmployeeModel::deleteEmployeeById($id);
        //     echo json_encode($response);
        // }
    }
?>