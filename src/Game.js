const {maxPoints} = require('../config/config.json');
const Card = require('./Card.js');

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

        //last tip will be 1st and last letter + size (P......E)
        let name = this.crd.name.substring(0,1);

        for(let i= 1; i < this.crd.name.length -1 ; i++){
            name = name += (this.crd.name[i] != " " ? " - " : "   ");
        }
        name = name + this.crd.name.substring(this.crd.name.length-1);
        
        this.indices.push("mon nom est "+name);

        this.nbIndices=this.indices.length;
    }

    //build the next tip for the current card
    newIndice(){
        let message  = null;
        const tip = this.indices.shift();
        const tipNumber = this.nbIndices - this.indices.length;
        const tipName = '** '+ (tipNumber == 1 ? '1er' : (tipNumber == this.nbIndices) ? 'dernier' : tipNumber+'e' )+' indice : **';

        message = { name : tipName, value : tip };

        if(this.indices.length == 0)
            this.end_turn = true;

        return message;
    }

    //compare given response with the answer. If incorrect, attribute malus point
    checkResponse(response, author){
        if(this.crd.name === response.toLowerCase())
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
