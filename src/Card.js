if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const {cards} = require('./../config/cards.json');
const {types, extensions, CS} = require('./../config/types.json');
var cards_list = new Array();
class Card {


    /*
    @param extension si renseigné, id de l'extension avec laquelle jouer uniquement
    [00-19][0-1] le premier si c'est 0 c'est aucune capacité 
    sinon c'est son numéro sur une liste 
    ensuite le 0 ou 1 c'est si c'est aura ou pas
    ex: lieutenant : 1140000000000000313
    */
    constructor(extension) {

        Object.assign(cards_list, cards);

        if(extension){
            cards_list = cards.filter(obj => {
                return obj.id.startsWith(extension);
              })
        }

    }

    pickCard(){

        let rand = Math.floor(Math.random() * (cards_list.length));

        this.name = cards_list[rand][process.env.BOT_LANG];

        this.buildCard(cards_list[rand].id);

        cards_list.splice(rand,1);
    }


    // build card fromt id like 1115000000000223
    //                            2200000000000101
    //format is extension-type-CS-aura?-CS-CS-CS-CS-atq-hp-mana
    buildCard = function(id){

        this.extension= extensions[id[0]];
        this.type = types[id[1]];
        this.attack = id[13];
        this.hp = id[14] != 0 ? id[14] : 0; 
        this.mana = id[15];
        this.image = `./card_img/${process.env.BOT_LANG}/${this.name.replace(' ','-')}.png`;
        this.cs = new Array();
        
        //CS list building
        const cs_list = [id.substring(2,5),id.substring(5,7),id.substring(7,9),id.substring(9,11),id.substring(11,13)];
        if(cs_list[0].substring(0,2) != "00") {
            this.cs.push((cs_list[0][2] == '1'? "aura " : "") + CS[cs_list[0].substring(0,2)]);
        }
        for(let i = 1; i< cs_list.length; i++){
            if(cs_list[i] != "00"){
                this.cs.push(CS[cs_list[i]]);
            }
        }
    }

}

module.exports = Card
