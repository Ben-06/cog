// services/TypeService.js
const typesData = require('../assets/types.json');

class TypeService {
  static getAllTypes() {
    return typesData;
  }

  static getTypeByName(name, lang = 'FR') {
    return typesData.find(type => type[lang]?.toLowerCase() === name.toLowerCase());
  }
}

module.exports = TypeService;
