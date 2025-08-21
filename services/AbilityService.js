// services/AbilityService.js
const abilitiesData = require('../assets/abilities.json');
const { sansAccent } = require('../utils/utils');


class AbilityService {
  static getAllAbilities(lang = 'FR') {
    return abilitiesData.abilities?.[lang] || [];
  }

  static getAbilityByName(name, lang = 'FR') {
    const abilities = abilitiesData.abilities?.[lang] || [];
    const search = sansAccent(name).toLowerCase();
    return abilities.find(ability => sansAccent(ability.name || '').toLowerCase() === search);
  }
}

module.exports = AbilityService;
