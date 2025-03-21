<?php

class CardController {
    public static function main() {
        $cards=cardModel::getCards();
        echo json_encode($cards);
    }
}
