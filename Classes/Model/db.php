<?php

class Db{
    private static $servername = "localhost";
    private static $database ="cms_20250314";
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
    public static function Insert($table, $columns, $values){
 
        $sql = "INSERT INTO ".$table." (".$columns.") VALUES (".$values.");";      
        $query = self::Query($sql);
        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }
   
}
?>