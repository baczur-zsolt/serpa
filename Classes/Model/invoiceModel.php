<?php
    class InvoiceModel{
    
    public static function getInvoiceById($in){
        if(!isset($in)){
            http_response_code(404);
            exit;
        }
        if(!$in==null)$in='bill_number LIKE "%'.$in.'"';

        $mySale=Db::Select("tbl_sale", "*", $in);     //Querying the "tbl_sale" table with "id"
        $myCompany=Db::Select("tbl_mycompany", "*");

        if($mySale==null){
            http_response_code(404);
            exit;
        }


        // require_once('tcpdf_include.php');

        // create new PDF document
        $pdf = new MYPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->mySale=$mySale;
        $pdf->myCompany=$myCompany;
        // set document information
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('Nicola Asuni');
        $pdf->SetTitle('TCPDF Example 003');
        $pdf->SetSubject('TCPDF Tutorial');
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
        $pdf->SetFont('times', 'BI', 8);

        // add a page
        $pdf->AddPage();


        // set some text to print
        $txt = <<<EOD

        EOD;

        // print a block of text using Write()
        $pdf->Write(0, $txt, '', 0, 'C', true, 0, false, false, 0);

        // ---------------------------------------------------------

        $pdf->MultiCell(180, 220, 'Vevő számlázási adatai:', 1, 'L', 0, 1, 15, 50, true, 0, false, true, 3, 'T', true);



        //Close and output PDF document
        $pdf->Output('example_003.pdf', 'I');

        //============================================================+
        // END OF FILE
        //============================================================+
            


    }
    
}

class MYPDF extends TCPDF {
    public $mySale;
    public $myCompany;
    //Page header
    public function Header() {
        // Logo
        $image_file = K_PATH_IMAGES.'logo_example.jpg';
        $this->Image($image_file, 10, 10, 15, '', 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        // Set font
        $this->SetFont('helvetica', 'B', 20);
        // Title
        //Cell($w, $h=0, $txt='', $border=0, $ln=0, $align='', $fill=0, $link='', $stretch=0, $ignore_min_height=false, $calign='T', $valign='M')
        $this->MultiCell(30, 10, 'SZÁMLA', 0, 'L', 0, 0, '', 10, true, 0, false, true, 5, 'M', true);
        $this->MultiCell('', 1, '1. (eredeti példány)', 0, 'C', 0, 1, '', 10, true, 0, false, true, 3, 'M', true);
        $this->MultiCell(30, 1, 'Számlaszám: '.$this->mySale[0]['bill_number'], 0, 'C', 0, 1, 150, 10, true, 0, false, true, 3, 'M', true);
        // $this->MultiCell('', 5, '1. (eredeti példány)', 1, 'C', 0, 1, '', 15, true, 0, false, true, 5, 'M', true);
        $this->MultiCell(90, 30, 'Kibocsátó adatai:<br>
                        <pre style="font-size: 15px; line-height:20%">'.$this->myCompany[0]["company_name"].
                        '<pre style="font-size: 10px; line-height:50%">'.$this->myCompany[0]["zipcode"].' '.$this->myCompany[0]["address_city"].', '.$this->myCompany[0]["address_street"].' '.$this->myCompany[0]["address_number"].'.'.
                        '<pre style="font-size: 10px; line-height:50%">Telefon: '.$this->myCompany[0]["phone_number"].
                        '<pre style="font-size: 10px; line-height:50%">Web: '.$this->myCompany[0]["web"]
                        , 1, 'L', 0, 1, '', 20, true, 0, true, true, '', 'T', true);
        $this->MultiCell(90, 30, 'Vevő számlázási adatai:', 1, 'L', 0, 1, 105, 20, true, 0, false, true, 3, 'T', true);


    }

    // Page footer
    public function Footer() {
        // Position at 15 mm from bottom
        $this->SetY(-15);
        // Set font
        $this->SetFont('helvetica', 'I', 8);
        // Page number
        $this->Cell(0, 10, 'Page '.$this->getAliasNumPage().'/'.$this->getAliasNbPages(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
    }
}

?>