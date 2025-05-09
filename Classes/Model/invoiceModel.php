<?php
    class InvoiceModel{
    
    public static function getInvoiceByBillNumber($in){
        if(!isset($in)){
            http_response_code(404);
            exit;
        }
        $in=str_pad($in, 6, "0", STR_PAD_LEFT);
        if(!$in==null)$in='bill_number LIKE "%-'.$in.'"';

        $mySale=Db::Select("tbl_sale LEFT JOIN tbl_staff ON tbl_sale.staff_ID=tbl_staff.staff_ID 
                                    LEFT JOIN tbl_product ON tbl_sale.product_ID=tbl_product.product_ID
                                    LEFT JOIN tbl_category ON tbl_product.category_ID=tbl_category.category_ID
                                    LEFT JOIN tbl_brand ON tbl_product.brand_ID=tbl_brand.brand_ID",
                                    "tbl_sale.*, CONCAT(tbl_staff.last_name,' ',tbl_staff.first_name) as staff_name, tbl_product.*, tbl_category.*, tbl_brand.*", $in);
        if($mySale==null){
            http_response_code(404);
            exit;
        }
        $cus_id='customer_ID='.$mySale[0]["customer_ID"];
        $customer=Db::Select("tbl_customer", "*", $cus_id);
        $myCompany=Db::Select("tbl_mycompany", "*");
        $afaSelect=Db::Select("tbl_constant", "AFA");
        $afa=(int)$afaSelect[0]['AFA']."%";

        if($mySale==null){
            http_response_code(404);
            exit;
        }


        // require_once('tcpdf_include.php');

        // create new PDF document
        $pdf = new MYPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->mySale=$mySale;
        $pdf->myCompany=$myCompany;
        $pdf->customer=$customer;
        $pdf->afa=$afa;

        // set document information
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('sERPa');
        $pdf->SetTitle('Számla');
        $pdf->SetSubject('TCPDF');
        $pdf->SetKeywords('TCPDF, PDF, example, test, guide');

        // set default header data
        $pdf->SetHeaderData(PDF_HEADER_LOGO, PDF_HEADER_LOGO_WIDTH, PDF_HEADER_TITLE, PDF_HEADER_STRING);

        // set header and footer fonts
        $pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
        $pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));

        // set default monospaced font
        $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

        // set margins
        $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
        $pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
        $pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

        // set auto page breaks
        $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

        // set image scale factor
        $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

        // set some language-dependent strings (optional)
        if (@file_exists(dirname(__FILE__).'/lang/eng.php')) {
            require_once(dirname(__FILE__).'/lang/eng.php');
            $pdf->setLanguageArray($l);
        }

        // ---------------------------------------------------------

        // set font
        $pdf->SetFont('dejavusans', 'A', 8);

        // add a page
        $pdf->AddPage();


        // set some text to print
        $txt = <<<EOD

        EOD;

        // print a block of text using Write()
        $pdf->Write(0, $txt, '', 0, 'C', true, 0, false, false, 0);

        // ---------------------------------------------------------

        $y_pos=72;
        $afa=0;
        $sumAll=0;
        for($i=0;$i<count($pdf->mySale);$i++) {
            $pdf->MultiCell(75, 5, "<p><b>".$pdf->mySale[$i]["product_name"]."<b></p>"
                        , 0, 'L', 0, 1, 15, $y_pos, true, 0, true, true, 3, 'T', true);
            $pdf->MultiCell(25, 5, "<p><i>".$pdf->mySale[$i]["category"]."<i></p>"
                        , 0, 'L', 0, 1, 90, $y_pos, true, 0, true, true, 3, 'T', true);
            $pdf->MultiCell(25, 5, "<p><b>".$pdf->mySale[$i]["quantity_sale"]."<b></p>"
                        , 0, 'R', 0, 1, 115, $y_pos, true, 0, true, true, 3, 'T', true);
            $pdf->MultiCell(30, 5, "<p><b>".number_format($pdf->mySale[$i]["product_profit_price"],2,",","")."<b></p>"
                        , 0, 'R', 0, 1, 140, $y_pos, true, 0, true, true, 3, 'T', true);
            $sum=$pdf->mySale[$i]["product_profit_price"]*$pdf->mySale[$i]["quantity_sale"];
            $afa=$afa+$sum*0.27;
            $sumAll=$sumAll+$sum;
            $pdf->MultiCell(25, 5, "<p><b>".number_format($sum,2,",","")."<b></p>"
                        , 0, 'R', 0, 1, 170, $y_pos, true, 0, true, true, 3, 'T', true);
            
            $pdf->MultiCell(75, 5, "<p>".$pdf->mySale[$i]["product_number"]."</p>"
                        , 0, 'L', 0, 1, 15, $y_pos+4, true, 0, true, true, 3, 'T', true);
            $pdf->MultiCell(25, 5, $pdf->afa
                        , 0, 'C', 0, 1, 90, $y_pos+4, true, 0, true, true, 3, 'T', true);
            $pdf->MultiCell(25, 5, "<p>".number_format(($sum*0.27),2,",","")."</p>"
                        , 0, 'R', 0, 1, 115, $y_pos+4, true, 0, true, true, 3, 'T', true);
            $pdf->MultiCell(30, 5, "<p>".number_format($pdf->mySale[$i]["product_profit_price"]*1.27,2,",","")."</p>"
                        , 0, 'R', 0, 1, 140, $y_pos+4, true, 0, true, true, 3, 'T', true);
            $pdf->MultiCell(25, 5, "<p>".number_format($sum*1.27,2,",","")."</p>"
                        , 0, 'R', 0, 1, 170, $y_pos+4, true, 0, true, true, 3, 'T', true);
            $pdf->MultiCell(180, 5, "<p> <hr></p>"
                        , 0, 'L', 0, 1, 15, $y_pos+4, true, 0, true, true, 3, 'T', true);

            $y_pos=$y_pos+10;
            if($y_pos>=260){
                $y_pos=72;
                $pdf->AddPage('P', 'A4');
            }
        }

        $pdf->MultiCell(180, 10, '<hr>'
                        , 0, 'C', 0, 2, 15, $y_pos, true, 0, true, true, 3, 'T', true);
        $pdf->MultiCell(25, 5, 'ÁFA típus'
                        , 0, 'C', 0, 2, 90, $y_pos, true, 0, true, true, 3, 'T', true);
        $pdf->MultiCell(25, 5, 'ÁFA'
                        , 0, 'R', 0, 2, 115, $y_pos, true, 0, true, true, 3, 'T', true);
        $pdf->MultiCell(30, 5, 'Nettó'
                        , 0, 'R', 0, 2, 140, $y_pos, true, 0, true, true, 3, 'T', true);
        $pdf->MultiCell(25, 5, 'Bruttó'
                        , 0, 'R', 0, 2, 170, $y_pos, true, 0, true, true, 3, 'T', true);
        
        $pdf->MultiCell(25, 5, $pdf->afa
                        , 0, 'C', 0, 2, 90, $y_pos+5, true, 0, true, true, 3, 'T', true);
        $pdf->MultiCell(25, 5, "<b>".number_format($afa,0,","," ")."</b>"
                        , 0, 'R', 0, 2, 115, $y_pos+5, true, 0, true, true, 3, 'T', true);
        $pdf->MultiCell(30, 5, "<b>".number_format($sumAll,0,","," ")."</b>"
                        , 0, 'R', 0, 2, 140, $y_pos+5, true, 0, true, true, 3, 'T', true);
        $pdf->MultiCell(25, 5, "<b>".number_format($sumAll+$afa,0,","," ")."</b>"
                        , 0, 'R', 0, 2, 170, $y_pos+5, true, 0, true, true, 3, 'T', true);
        
        $pdf->MultiCell(180, 10, '<h3>Fizetendő (bruttó) mindösszessen: '.number_format($sumAll+$afa,0,","," ")."Ft</h3>"
                        , 0, 'R', 0, 2, 15, $y_pos+10, true, 0, true, true, 3, 'T', true);
        $sumStr=ConverterModel::convertToStr($sumAll+$afa);
        $pdf->MultiCell(180, 10, '<b>'.$sumStr." Ft</b>"
                        , 0, 'R', 0, 2, 15, $y_pos+15, true, 0, true, true, 3, 'T', true);
        


        //Close and output PDF document
        $pdfName=str_replace("-", "_", $mySale[0]['bill_number']);
        $pdf->Output($pdfName.'.pdf', 'I');

        //============================================================+
        // END OF FILE
        //============================================================+
            


    }
    
}

class MYPDF extends TCPDF {
    public $mySale;
    public $myCompany;
    public $customer;
    public $afa;
    //Page header
    public function Header() {
        // Logo
        $image_file = K_PATH_IMAGES.'logo_example.jpg';
        $this->Image($image_file, 10, 10, 15, '', 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        // Set font
        $this->SetFont('dejavusans', 'A', 8);
        // Title
        //Cell($w, $h=0, $txt='', $border=0, $ln=0, $align='', $fill=0, $link='', $stretch=0, $ignore_min_height=false, $calign='T', $valign='M')
        $this->MultiCell(30, 10, '<p style="font-weight: bold; font-size: 20px">SZÁMLA', 0, 'L', 0, 0, '', 10, true, 0, true, true, 5, 'M', true);
        $this->MultiCell('', 1, '<p style="font-weight: bold; font-size: 10px">1. eredeti példány', 0, 'C', 0, 1, '', 10, true, 0, true, true, 3, 'M', true);
        $this->MultiCell(50, 1, '<p style="font-weight: bold; font-size: 10px">Számlaszám: '.$this->mySale[0]['bill_number'], 0, 'R', 0, 1, 145, 10, true, 0, true, true, 3, 'M', true);
        
        $this->MultiCell(90, 30, '<p><span style="font-weight: bold; font-size: 10px;">Kibocsátó adatai:</span><br>'.
                        '<span style="font-weight: bold; font-size: 15px;">'.$this->myCompany[0]["company_name"].'</span><br>'.
                        $this->myCompany[0]["zipcode"].' '.$this->myCompany[0]["address_city"].', '.$this->myCompany[0]["address_street"].' '.$this->myCompany[0]["address_number"].'.<br>'.
                        'Telefon: '.$this->myCompany[0]["company_number"].'&emsp;'.$this->myCompany[0]["phone_number"].'<br>'.
                        'Web: '.$this->myCompany[0]["web"].'<br>'.
                        'Banksz.: '.$this->myCompany[0]["bank_account"].'<br>'.
                        'Adószám: '.$this->myCompany[0]["tax_number"].'</p>'     
                        , 1, 'L', 0, 6, '', 20, true, 0, true, true, '', 'T', true);
        $this->MultiCell(90, 30, '<p><span style="font-weight: bold; font-size: 10px;">Vevő számlázási adatai:</span><br>'.
                        '<span style="font-weight: bold; font-size: 15px;">'.$this->customer[0]["last_name"]." ".$this->customer[0]["first_name"].'</span><br>'.
                        $this->customer[0]["zipcode"].' '.$this->customer[0]["address_city"].', '.$this->customer[0]["address_street"].' '.$this->customer[0]["address_number"].'.<br>'.
                        'Adószám: '.$this->customer[0]["tax_number"].'</p>'
                        , 1, 'L', 0, 6, 105, 20, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(60, 10, 'Információ:<br>'.
                        $this->customer[0]["comment"]
                        , 1, 'L', 0, 2, '', 50, true, 0, true, true, 3, 'T', true);

        $dateTime=date_create($this->mySale[0]["sale_date"]);
        $date=date_format($dateTime,"Y-m-d");

        $this->MultiCell(30, 10, 'Fizetési határidő:<br>'.            
                        '<b>'.$date.'</b>'
                        , 1, 'C', 0, 2, 75, 50, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(30, 10, 'Teljesítés napja:<br>'.            
                        '<b>'.$date.'</b>'
                        , 1, 'C', 0, 2, 105, 50, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(30, 10, 'Fizetési mód:<br>'.            
                        '<b>Készpénz</b>'
                        , 1, 'C', 0, 2, 135, 50, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(30, 10, 'Kibocsátás napja:<br>'.            
                        '<b>'.$date.'</b>'
                        , 1, 'C', 0, 2, 165, 50, true, 0, true, true, 3, 'T', true);

        $this->MultiCell(75, 5, '<b>Megnevezés:</b>'
                        , 1, 'L', 0, 1, '', 60, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(25, 5, '<i>Besorolás</i>'
                        , 1, 'L', 0, 1, 90, 60, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(25, 5, '<b>Mennyiség</b>'
                        , 1, 'R', 0, 1, 115, 60, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(30, 5, '<b>Nettó egységár</b>'
                        , 1, 'C', 0, 1, 140, 60, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(25, 5, '<b>Nettó érték</b>'
                        , 1, 'C', 0, 1, 170, 60, true, 0, true, true, 3, 'T', true);
        
        $this->MultiCell(75, 5, '<p>Cikkszám:</p>'
                        , 1, 'L', 0, 1, '', 65, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(25, 5, '<p>ÁFA típus</p>'
                        , 1, 'C', 0, 1, 90, 65, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(25, 5, '<p>ÁFA érték</p>'
                        , 1, 'R', 0, 1, 115, 65, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(30, 5, '<p>Bruttó egységár</p>'
                        , 1, 'C', 0, 1, 140, 65, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(25, 5, '<p>Bruttó érték</p>'
                        , 1, 'C', 0, 1, 170, 65, true, 0, true, true, 3, 'T', true);

    }

    // Page footer
    public function Footer() {
        // Position at 15 mm from bottom
        $this->SetY(-15);
        // Set font
        $this->SetFont('dejavusans', 'A', 8);
        // Page number
        $image_file = K_PATH_IMAGES.'ERP.jpg';
        $this->Image($image_file, 28, 269, '', 5, 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        $this->MultiCell(180, '', '<hr width="100%" size="2">'
                        , 0, 'L', 0, 1, 15, 268, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(90, 10, 'Készült a'
                        , 0, 'L', 0, 1, 15, 270, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(90, 10, 'ERP rendszerével.'
                        , 0, 'C', 0, 1, 15, 270, true, 0, true, true, 3, 'T', true);
        $this->MultiCell('', 10, 'A számla megfelel a hatályos jogszabályoknak. Ez a számla aláírás és bélyegző nélkül is hiteles.'
                        , 0, 'L', 0, 1, 15, 274, true, 0, true, true, 3, 'T', true);
        $this->MultiCell(90, 10, 'Készítette: '.$this->mySale[0]["staff_name"]
                        , 0, 'R', 0, 1, 105, 270, true, 0, true, true, 3, 'T', true);
        $this->MultiCell('', 5, '<i>Oldal '.$this->getAliasNumPage().'/'.$this->getAliasNbPages().'</i>'
                        , 0, 'L', 0, 1, 100, 280, true, 0, true, true, 3, 'M', true);

        // $this->Cell(0, 5, 'Oldal '.$this->getAliasNumPage().'/'.$this->getAliasNbPages(), 1, false, 'C', 0, '', 0, false, 'T', 'M');
    }
}

?>