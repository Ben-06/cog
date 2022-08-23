const sharp = require('sharp');
const { AttachmentBuilder } = require('discord.js');
const {maxPoints} = require('../config/config.json');
const Card = require('./Card.js');
const MESSAGE_COLORS = new Array(0xff0000,0xDD521E,0xDD781E,0xDDC01E,0xDDD41E,0xD4DD1E,0xC6DA21,0xAADA21,0x9CDA21,0x91DA21,0x00FF00);

const levenshteinDistance = (str1 = '', str2 = '') => {
    
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
 };

class Game {

    constructor(extension, speed, duree) {
        this.turn = 1;
        this.max_turn = duree;
        this.speed=speed;
        this.scores = {};
        this.crd = new Card(extension);
        this.crd.pickCard();
        this.extension = extension;
        this.wrong = {};
        this.end_turn = false;
        this.buildIndicesList();
    }

    //build the liste of tips in random order (exept the last one)
    buildIndicesList = function(){
        let sortedIndices = new Array();

        if(! this.extension) 
            sortedIndices.push(" je fais partie de l'extension " + this.crd.extension);
        sortedIndices.push("je suis de type " + this.crd.type);
        sortedIndices.push("je coûte " + this.crd.mana +" mana");
        sortedIndices.push("mon attaque est de " + this.crd.attack);
        if (this.crd.hp)
            sortedIndices.push("mes points de vie sont de " + this.crd.hp);
        
        //if no CS
        if(this.crd.cs.length == 0){
            sortedIndices.push(" je ne possède pas de CS");
        } else {
            this.crd.cs.forEach(cs => {
                sortedIndices.push("je possède la CS " + cs);
            });
        }
        this.indices = sortedIndices.sort((a, b) => 0.5 - Math.random());

        //last tip will be 1st and last letter + size (P _ _ _ _ _ _ E)
        let tip = "";
        let words = this.crd.name.split(' ');
        words.forEach(word => {
            tip = tip + word.substring(0,1);

            for(let i= 1; i < word.length -1 ; i++){
                tip = tip += (word[i] != " " ? " \\_ " : "   ");
            }
            tip = tip + word.substring(word.length-1)+' ';

        });

        this.indices.push("mon nom est "+tip.toUpperCase());


        //and VERY last tip, image crop

        // file name for cropped image
        let outputImage = 'croppedImage.jpg';

        sharp(this.crd.image).extract({ width: 290, height: 290, left: 80, top: 90 }).toFile(outputImage)
        .then(function(new_file_info) {
            sortedIndices.push(outputImage);
        })
        .catch( err => { console.log(err) });

        this.nbIndices=this.indices.length;
    }

    //build the next tip for the current card
    newIndice(){
        let message  = null;
        const tip = this.indices.shift();
        const tipNumber = this.nbIndices - this.indices.length;
        const tipName = '** '+ (tipNumber == 1 ? '1er' : (tipNumber == this.nbIndices-1) ? 'dernier' : tipNumber+'e' )+' indice : **';

        if(tip === 'croppedImage.jpg'){
            const file = new AttachmentBuilder(tip);
            message = 
            {
                embeds : [
                    {
                        color: MESSAGE_COLORS[this.indices.length],
                        fields: [
                            { name : 'Toujours pas ?', value :  'Allez, un dernier ... '  }
                        ],
                        image: {
                            url: 'attachment://croppedImage.jpg',
                        }
                    }
                    
                ],
                files : [file]
            };
        } else {
            message = 
            {
                embeds : [
                    {
                        color: MESSAGE_COLORS[this.indices.length],
                        fields: [
                            { name : tipName, value : tip }
                        ]
                    }
                ]
            };
        }

        if(this.indices.length == 0)
            this.end_turn = true;

        return message;
    }

    //compare given response with the answer. If incorrect, attribute malus point
    checkResponse(response, author){

        const dist = levenshteinDistance(response.toLowerCase(),this.crd.name );
        if(dist <= 2)
        {
            return true;
        } else {
            //count wrong responses to attribute malus
            this.wrong[author] = (this.wrong[author] ? Number(this.wrong[author]) : 0) + 1;
            return false;
        }
    }

    //function called when someone gave the good answer
    goodResponse(winner){
        let points = -1;

        if(winner){
            points = Math.max(maxPoints - this.nbIndices + this.indices.length - (this.wrong[winner] ? Number(this.wrong[winner]) : 0), 0);
            this.scores[winner] = (this.scores[winner] ? Number(this.scores[winner]) : 0) + points;
        }

        if(this.turn < this.max_turn) {
            //next turn
            this.crd.pickCard();
            this.turn=this.turn + 1;
            this.wrong = {};
            this.end_turn = false;
            this.buildIndicesList();
        } else {
            this.turn = -1;
        }

        return points;
    }

    //build embed with scores sorted
    getScores(){

        const sorted = Object.entries(this.scores)
        .sort(([, v1], [, v2]) => v2 - v1)
        .reduce((obj, [k, v]) => ({
            ...obj,
            [k]: v
        }), {})

        let fields = new Array();
        for (var key in sorted) {
            fields.push(
                {
                    name: key,
                    value: sorted[key]
                }
            );
        }        
        return fields;
    }
}

module.exports = Game
