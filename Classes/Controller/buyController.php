<?php
    class BuyController{
        
        public static function getBuy($id=null){
            $response=BuyModel::getBuyById($id);
            echo json_encode($response);
        }
        public static function setBuy(){ 
            $response=BuyModel::setBuyFromJSON(); 
            echo json_encode($response);
        }
    }
?>