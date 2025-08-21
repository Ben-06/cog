// services/CardService.js
const cardsData = require('../assets/cards.json').cards;

class CardService {
  static getAllCards() {
    return cardsData;
  }

  static getCardById(id) {
    return cardsData.find(card => card.id === id);
  }

  static getCardByName(name, lang = 'FR') {
    return cardsData.find(card => card[lang]?.toLowerCase() === name.toLowerCase());
  }

  static getRandomCard() {
    const idx = Math.floor(Math.random() * cardsData.length);
    return cardsData[idx];
  }
}

module.exports = CardService;
