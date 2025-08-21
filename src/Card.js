
const cardsData = require('../assets/cards.json').cards;
const { types, extensions, CS } = require('../assets/types.json');

class Card {


    /*
    @param extension si renseigné, id de l'extension avec laquelle jouer uniquement
    [00-19][0-1] le premier si c'est 0 c'est aucune capacité 
    sinon c'est son numéro sur une liste 
    ensuite le 0 ou 1 c'est si c'est aura ou pas
    ex: lieutenant : 1140000000000000313
    */

    constructor(extension) {
        // Filtre la liste selon l'extension si précisé
        this.cards_list = extension
            ? cardsData.filter(obj => obj.id.startsWith(extension))
            : [...cardsData];
    }


    pickCard(){
        if (this.cards_list.length === 0) return null;
        let rand = Math.floor(Math.random() * this.cards_list.length);
        const cardData = this.cards_list[rand];
        this.name = cardData[process.env.BOT_LANG];
        this.buildCard(cardData.id);
        this.cards_list.splice(rand,1);
        return this;
    }


    // build card fromt id like 1115000000000223
    //                            2200000000000101
    //format is extension-type-CS-aura?-CS-CS-CS-CS-atq-hp-mana
    buildCard = function(id){
        this.extension= extensions[id.substring(0,2)];
        this.type = types[id[2]];
        this.attack = id[14];
        this.hp = id[15] != 0 ? id[15] : 0; 
        this.mana = id[16];
        this.image = `./assets/card_img/${process.env.BOT_LANG}/${this.name.toLocaleLowerCase().replace(' ','-')}.png`;
        this.cs = new Array();
        
        //CS list building
        const cs_list = [id.substring(3,6),id.substring(6,8),id.substring(8,10),id.substring(10,12),id.substring(12,14)];
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
