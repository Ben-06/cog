// services/ConfigService.js
const configData = require('../assets/config.json');

class ConfigService {
  static getConfig() {
    return configData;
  }

  static getValue(key) {
    return configData[key];
  }
}

module.exports = ConfigService;
