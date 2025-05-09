<?php
    class SaleController{
        
        public static function getSale($in=null){
            $response=SaleModel::getSaleByBillNumber($in);
            echo json_encode($response);
        }
        public static function setSale(){ 
            $response=SaleModel::setSaleFromJSON(); 
            echo json_encode($response);
        }
        public static function updateSale($id){
            $response=SaleModel::updateSaleFromJSON($id);
            echo json_encode($response);
        }
        public static function deleteSale($in){
            $response=SaleModel::deleteSaleByBillNumber($in);
            echo json_encode($response);
        }
    }
?>