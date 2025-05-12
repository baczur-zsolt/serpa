<?php
    class InvoiceController{
        
        public static function getInvoice($in){
            $response=InvoiceModel::getInvoiceByBillNumber($in);
            echo json_encode($response);
        }
    }
?>