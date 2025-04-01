<?php
    class PartnerController{
        
        public static function getPartner($id=null){
            $response=PartnerModel::getPartnerById($id);
            echo json_encode($response);
        }
        public static function setPartner(){ 
            $response=PartnerModel::setPartnerFromJSON(); 
            echo json_encode($response);
        }
        public static function updatePartner($id){
            $response=PartnerModel::updatePartnerFromJSON($id);
            echo json_encode($response);
        }
        public static function deletePartner($id){
            $response=PartnerModel::deletePartnerById($id);
            echo json_encode($response);
        }
    }
?>