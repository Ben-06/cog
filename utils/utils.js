// utils/utils.js

/**
 * Supprime les accents d'une chaîne de caractères.
 * @param {string} str
 * @returns {string}
 */
function sansAccent(str) {
    var accent = [
        /[\300-\306]/g, /[\340-\346]/g, // A, a
        /[\310-\313]/g, /[\350-\353]/g, // E, e
        /[\314-\317]/g, /[\354-\357]/g, // I, i
        /[\322-\330]/g, /[\362-\370]/g, // O, o
        /[\331-\334]/g, /[\371-\374]/g, // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
    var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];
    for (var i = 0; i < accent.length; i++) {
        str = str.replace(accent[i], noaccent[i]);
    }
    return str;
}

function levenshteinDistance(str1 = '', str2 = '') {
    str1 = str1.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    str2 = str2.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[str2.length][str1.length];
}

const sharp = require('sharp');
async function cropImage(img, dest) {
    try {
        const crop = await sharp(img).extract({ width: 290, height: 290, left: 80, top: 90 }).toFile(dest);
        return dest;
    } catch (err) { return null; }
}

module.exports = {
    sansAccent,
    levenshteinDistance,
    cropImage
};
