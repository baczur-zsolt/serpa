<?php
    class SaleController{
        
        public static function getSale($id=null){
            $response=SaleModel::getSaleById($id);
            echo json_encode($response);
        }
        public static function setSale(){
            
            $response=SaleModel::setSaleFromJSON(); 
            echo json_encode($response);
        }
    }
?>