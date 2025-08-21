// services/LocalisationService.js
const localisationData = require('../assets/localisation.json');

class LocalisationService {
  static getLocalisation(key, lang = 'FR') {
    return localisationData[key]?.[lang] || null;
  }
}

module.exports = LocalisationService;
