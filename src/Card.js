const {cards} = require('./../config/cards.json');

class Card {
    constructor() {
        let rand = Math.floor(Math.random() * (cards.length));

        Object.assign(this, cards[rand]);
    }

}

module.exports = Card
