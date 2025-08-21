// services/WordingService.js
const wordingData = require('../assets/wording.json');

class WordingService {
  static getWording(key, lang = 'FR') {
    return wordingData[key]?.[lang] || null;
  }
}

module.exports = WordingService;
