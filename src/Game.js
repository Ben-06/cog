const {turns, maxPoints} = require('../config/config.json');
const Card = require('./Card.js');

class Game {

    constructor() {
        this.turn = 1;
        this.scores = {};
        this.crd = new Card();
        this.indice=1;
        this.wrong = {};
        this.end_turn = false;
    }

    //build the next tip for the current card
    newIndice(){
        let message  = null;

        if (this.indice == 1)
            message = { name : "** 1er indice : **", value : " je fais partie de l'extension " + this.crd.extension };
        else if (this.indice == 2)
            message = { name :"** 2e indice : ** ", value : "je suis de type " + this.crd.type};
        else if (this.indice == 3)
            message = { name : "** 3e indice : ** ", value : "je coûte " + this.crd.mana +" mana"};
        else if (this.indice == 4)
            message = { name :"** 4e indice : ** ", value : "mon attaque est de " + this.crd.attack};
        else if (this.indice == 5 && this.crd.hp)
            message = { name : "** 5e indice : ** ", value : "mes points de vie sont de  " + this.crd.hp};
        else
        {
            //if no CS
            if(this.crd.cs.length == 0 && this.indice == (this.crd.hp ? 6 : 5)){
                message = { name : "** "+(this.crd.hp ? 6 : 5)+"e indice : **", value : " je ne possède pas de CS"};
            } else {
                let cs_nb = this.indice-5-1;
                if(this.crd.cs[cs_nb])
                message = { name : "** "+(this.indice)+"e indice : ** ", value : "je possède la CS " + this.crd.cs[cs_nb]};   
            }

            //after listing CS, last tip will be 1st and last letter + size (P......E)
            if(message === null){
                let name = this.crd.name.substring(0,1);

                for(let i= 0; i < this.crd.name.length -2 ; i++){
                    name = name += ".";
                }

                name = name + this.crd.name.substring(this.crd.name.length-1);
                message = {name : "** dernier indice : ** ", value : "mon nom est "+name};

                this.end_turn = true;
            }
        }
        this.indice = this.indice +1;
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
            points = Math.max(maxPoints - this.indice - (this.wrong[winner] ? Number(this.wrong[winner]) : 0), 0);
            this.scores[winner] = (this.scores[winner] ? Number(this.scores[winner]) : 0) + points;
        }

        if(this.turn < turns) {
            //next turn
            this.indice=1;
            this.crd=new Card();
            this.turn=this.turn + 1;
            this.wrong = {};
            this.end_turn = false;
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
