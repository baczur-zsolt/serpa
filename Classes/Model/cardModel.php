<?php

class cardModel {
    public static function getCards() {
        session_start();
        $accessLevel = $_SESSION['access_level'] ?? 'guest';

        $icons = [
            'sale' => '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#D3E0E3"><path d="M286.79-81Q257-81 236-102.21t-21-51Q215-183 236.21-204t51-21Q317-225 338-203.79t21 51Q359-123 337.79-102t-51 21Zm400 0Q657-81 636-102.21t-21-51Q615-183 636.21-204t51-21Q717-225 738-203.79t21 51Q759-123 737.79-102t-51 21ZM235-741l110 228h288l125-228H235Zm-30-60h589.07q22.97 0 34.95 21 11.98 21-.02 42L694-495q-11 19-28.56 30.5T627-453H324l-56 104h491v60H277q-42 0-60.5-28t.5-63l64-118-152-322H51v-60h117l37 79Zm140 288h288-288Z"/></svg>',
            'product' => '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#D3E0E3"><path d="M450-154v-309L180-619v309l270 156Zm60 0 270-156v-310L510-463v309Zm-60 69L150-258q-14-8-22-22t-8-30v-340q0-16 8-30t22-22l300-173q14-8 30-8t30 8l300 173q14 8 22 22t8 30v340q0 16-8 30t-22 22L510-85q-14 8-30 8t-30-8Zm194-525 102-59-266-154-102 59 266 154Zm-164 96 104-61-267-154-104 60 267 155Z"/></svg>',
            'partner' => '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#D3E0E3"><path d="M0-240v-53q0-38.57 41.5-62.78Q83-380 150.38-380q12.16 0 23.39.5t22.23 2.15q-8 17.35-12 35.17-4 17.81-4 37.18v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-19.86-3.5-37.43T765-377.27q11-1.73 22.17-2.23 11.17-.5 22.83-.5 67.5 0 108.75 23.77T960-293v53H780Zm-480-60h360v-6q0-37-50.5-60.5T480-390q-79 0-129.5 23.5T300-305v5ZM149.57-410q-28.57 0-49.07-20.56Q80-451.13 80-480q0-29 20.56-49.5Q121.13-550 150-550q29 0 49.5 20.5t20.5 49.93q0 28.57-20.5 49.07T149.57-410Zm660 0q-28.57 0-49.07-20.56Q740-451.13 740-480q0-29 20.56-49.5Q781.13-550 810-550q29 0 49.5 20.5t20.5 49.93q0 28.57-20.5 49.07T809.57-410ZM480-480q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm.35-60Q506-540 523-557.35t17-43Q540-626 522.85-643t-42.5-17q-25.35 0-42.85 17.15t-17.5 42.5q0 25.35 17.35 42.85t43 17.5ZM480-300Zm0-300Z"/></svg>',
            'staff' => '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#D3E0E3"><path d="M180-217q60-56 135.9-90.5 75.89-34.5 164-34.5 88.1 0 164.1 34.5T780-217v-563H180v563Zm302-204q58 0 98-40t40-98q0-58-40-98t-98-40q-58 0-98 40t-40 98q0 58 40 98t98 40ZM180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm43-60h513q-62-53-125.5-77.5T480-282q-67 0-130.5 24.5T223-180Zm259-301q-32.5 0-55.25-22.75T404-559q0-32.5 22.75-55.25T482-637q32.5 0 55.25 22.75T560-559q0 32.5-22.75 55.25T482-481Zm-2-18Z"/></svg>',
            'profit' => '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="http://www.w3.org/2000/svg" width="24px" fill="#F3F3F3"><path d="m136-240-56-56 296-298 160 160 208-206H640v-80h240v240h-80v-104L536-320 376-480 136-240Z"/></svg>',
            'payouts' => '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="http://www.w3.org/2000/svg" width="24px" fill="#F3F3F3"><path d="M200-280v-280h80v280h-80Zm240 0v-280h80v280h-80ZM80-120v-80h800v80H80Zm600-160v-280h80v280h-80ZM80-640v-80l400-200 400 200v80H80Zm178-80h444-444Zm0 0h444L480-830 258-720Z"/></svg>',
        ];

        // Alap kártyák
        $cards = [
            ['name' => 'Összes eladás','button' => 'Értékesítés', 'value'  => self::getSalesCount(), 'icon' => $icons['sale']],
            ['name' => 'Összes termék','button' => 'Termékek', 'value' => self::getProductCount(), 'icon' => $icons['product']],
        ];

        if ($accessLevel === 2) {
            $cards[] = ['name' => 'Partnerek', 'button' => 'Partnerek', 'value' => self::getPartnerCount(), 'icon' => $icons['partner']];
        }

        if ($accessLevel === 3) {
            $cards[] = ['name' => 'Partnerek','button' => 'Partnerek', 'value' => self::getPartnerCount(), 'icon' => $icons['partner']];
            $cards[] = ['name' => 'Alkalmazottak','button' => 'Alkalmazottak', 'value' => self::getEmployeeCount(), 'icon' => $icons['staff']];
        }

        if ($accessLevel === 4) {
            $cards[] = ['name' => 'Partnerek','button' => 'Partnerek', 'value' => self::getPartnerCount(), 'icon' => $icons['partner']];
            
            $cards[] = ['name' => 'Alkalmazottak','button' => 'Alkalmazottak', 'value' => self::getEmployeeCount(), 'icon' => $icons['staff']];
            /*
            $cards[] = ['name' => 'Statisztika', 'value' => self::getStatisticsCount(), 'icon' => $icons['profit']];
            */
            $cards[] = ['name' => 'Pénzügy','button' => 'Pénzügyek', 'value' => self::getFinanceSum(), 'icon' => $icons['payouts']];
            
        }
        
        return $cards;
    }
    
    public static function getEmployeeCount() {
        $result=Db::Select("tbl_staff", "COUNT(*) AS total");
        return $result['total'] ?? 0;
    }

    public static function getProductCount() {
        $result=Db::Select("tbl_product", "COUNT(*) AS total");
        return $result['total'] ?? 0;
    }

    public static function getPartnerCount() {
        $result=Db::Select("tbl_customer", "COUNT(*) AS total");
        return $result['total'] ?? 0;
    }

    public static function getSalesCount() {
        $result=Db::Select("tbl_sale", "COUNT(*) AS total");
        return $result['total'] ?? 0;
    }
/*
    public static function getStatisticsCount() {
        $result=Db::Select("statistics", "COUNT(*) AS total");
        return $result['total'] ?? 0;
    }
        */

    public static function getFinanceSum() {
        $result=Db::Select("tbl_finance", "COUNT(*) AS total");
        return $result['total'] ?? 0;
    }

}
