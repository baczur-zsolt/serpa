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
        public static function updateBuy($id){
            $response=BuyModel::updateBuyFromJSON($id);
            echo json_encode($response);
        }
        public static function deleteBuy($id){
            $response=BuyModel::deleteBuyById($id);
            echo json_encode($response);
        }
    }
?>