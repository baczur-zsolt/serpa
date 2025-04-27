<?php
class ConverterModel{

    public static function convertToStr($num){
        $result='';
        $oszto=1000000000;
        $osztoNev='milliárd';
        $EgyesStr = array('', 'egy', 'kettő', 'három', 'négy', 'öt', 'hat', 'hét', 'nyolc', 'kilenc');
        $TizesStr = array('', 'tíz', 'húsz', 'harminc', 'negyven', 'ötven', 'hatvan', 'hetven', 'nyolcvan', 'kilencven');  
        $TizenStr = array('', 'tizen', 'huszon', 'harminc', 'negyven', 'ötven', 'hatvan', 'hetven', 'nyolcvan', 'kilencven');  

        if ($num == 0)  
        {  
          $result = 'Nulla';
        }  
        else  
        {  
            $absNum = abs($num);  
            if ($absNum > 999999999999)  
            {  
                return $absNum;
            }
            
            while($oszto>=1){
                if ($absNum >= $oszto){  
                    if ( mb_strlen($result) > 0 ) $result = $result . '-';  

                    $num = $absNum / $oszto;
                    
                    if ($num >= 100) $result = $result .$EgyesStr[$num / 100]. 'száz';  
                    $num = $num % 100; 
                    if ($num % 10 !== 0) $result = $result . $TizenStr[$num / 10] . $EgyesStr[$num % 10] . $osztoNev;  
                    else $result = $result . $TizesStr[$num / 10] . $osztoNev;  
                }
                $absNum = $absNum % $oszto;

                $oszto=$oszto/1000;

                if($oszto==1000000)$osztoNev='millió';
                if($oszto==1000)$osztoNev='ezer';
                if($oszto==1)$osztoNev='';

            }

        }
        $result = ucfirst($result);  
            if ($num < 0 )  
            $result = 'Mínusz '.$result;        
        return $result;  
      }
}