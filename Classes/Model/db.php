<?php

class Db{
    private static $servername = "localhost";
    private static $database ="cms_20241128";
    private static $username = "root";
    private static $password = "";
    private static $pdo = null;

    public static function Query($sql, $params=[]){
        
        if(!self::$pdo){
            self::$pdo = new \PDO("mysql:host=".self::$servername.";dbname=".self::$database.";",self::$username, self::$password);
        }

        $query = self::$pdo->prepare($sql);
        $query->execute($params);

        return $query;
    }

    public static function Select($table, $select, $where = null){
        $sql = "SELECT $select FROM ". $table;
        if($where) $sql .= (" WHERE ". $where);

        $query = self::Query($sql);
        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function getUserName($id){
        $response=self::Select("tbl_staff", "first_name,last_name", "staff_id=$id");
        return $response[0];
    }
    
}
?>