const {cards} = require('./../config/cards.json');

class Card {
    constructor() {
        let rand = Math.floor(Math.random() * (cards.length-1));

        Object.assign(this, cards[rand]);
    }

}

module.exports = Card
