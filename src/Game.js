const {turns} = require('../config/config.json');
const Card = require('./Card.js');

class Game {

    constructor() {
        this.turn = 1;
        this.scores = {};
        this.crd = new Card();
        this.indice=1;
    }

    newIndice(){
        let message  = null;

        if (this.indice == 1)
            message = "** 1er indice : ** je fais partie de l'extension " + this.crd.extension;
        else if (this.indice == 2)
            message = "** 2e indice : ** je suis de type " + this.crd.type;
        else if (this.indice == 3)
            message = "** 3e indice : ** je coûte " + this.crd.mana +" mana";
        else if (this.indice == 4)
            message = "** 4e indice : ** mon attaque est de " + this.crd.attack;
        else if (this.indice == 5)
            message = "** 5e indice : ** mes points de vie sont de  " + this.crd.hp;
        else if (this.indice > 5)
        {
            if(this.crd.cs.length == 0 && this.indice == 6)
                message = "** 6e indice : ** je ne possède pas de CS";

            let cs_nb = this.indice-5-1;
            if(this.crd.cs[cs_nb])
            message = "** "+(this.indice)+"e indice : ** je possède la CS  " + this.crd.cs[cs_nb];   
        }
        this.indice = this.indice +1;
        return message;
    }

    checkResponse(response){
        return this.crd.name === response.toLowerCase();
    }

    goodResponse(winner){
        
        this.scores[winner] = (this.scores[winner] ? Number(this.scores[winner]) : 0) + 8 - this.indice;

        if(this.turn < turns) {
            //next turn
            this.indice=1;
            this.crd=new Card();
            this.turn=this.turn + 1;
        } else {
            this.turn = -1;
        }
    }

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
