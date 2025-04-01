<?php
    class ProductController{
        
        public static function getProduct($id=null){
            $response=ProductModel::getProductById($id);
            echo json_encode($response);
        }
        public static function setProduct(){ 
            $response=ProductModel::setProductFromJSON(); 
            echo json_encode($response);
        }
        public static function updateProduct($id){
            $response=ProductModel::updateProductFromJSON($id);
            echo json_encode($response);
        }
        public static function deleteProduct($id){
            $response=ProductModel::deleteProductById($id);
            echo json_encode($response);
        }
    }
?>