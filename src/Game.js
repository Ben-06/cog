const fs = require('fs');
const logger = require('../utils/logger');
const { AttachmentBuilder } = require('discord.js');
const ConfigService = require('../services/ConfigService');
const Card = require('./Card');
const { levenshteinDistance, cropImage } = require('../utils/utils');
const maxPoints = ConfigService.getValue('maxPoints');
const MESSAGE_COLORS = new Array(0xff0000,0xDD521E,0xDD781E,0xDDC01E,0xDDD41E,0xD4DD1E,0xC6DA21,0xAADA21,0x9CDA21,0x91DA21,0x00FF00);

class Game {

    constructor(extension, speed, duree) {
        this.turn = 1;
        this.max_turn = duree;
        this.speed=speed;
        this.scores = {};
        logger.info(`[Game] Nouvelle partie : ${extension ? `Extension : ${extension}` : 'Aucune extension spécifiée'}`);
        logger.info(`[Game] Vitesse : ${speed}ms, Durée : ${duree} tours`);
        // Créer une seule instance de Card pour toute la partie
        this.cardPicker = new Card(extension);
        const card = this.cardPicker.pickCard();
        this.crd = card;
        logger.info(`[Game] Carte sélectionnée : ${this.crd ? this.crd.name : 'Aucune'}`);
        this.extension = extension;
        this.wrong = {};
        this.end_turn = false;
        this.channel = null; // Canal Discord pour envoyer les messages
        this.gameActive = false;
        this.currentTimer = null; // Timer actuel pour pouvoir l'annuler
    }

    //build the liste of tips in random order (exept the last one)
    buildIndicesList = async() => {
        let sortedIndices = new Array();

        if(! this.extension) 
            sortedIndices.push(" je fais partie de l'extension " + this.crd.extension);
        sortedIndices.push("je suis de type " + this.crd.type);
        sortedIndices.push("je coûte " + this.crd.mana +" mana");
        sortedIndices.push("mon attaque est de " + this.crd.attack);
        if (this.crd.hp)
            sortedIndices.push("mes points de vie sont de " + this.crd.hp);
        
        //if no CS
        if(this.crd.cs?.length == 0){
            sortedIndices.push(" je ne possède pas de CS");
        } else {
            this.crd.cs.forEach(cs => {
                sortedIndices.push("je possède la CS " + cs);
            });
        }
        this.indices = sortedIndices.sort((a, b) => 0.5 - Math.random());

        //last tip will be 1st and last letter + size (P _ _ _ _ _ _ E)
        let tip = "";
        let words = this.crd.name.split(/( |-)/);
        words.forEach(word => {
            if(word == ' ' || word == '-'){
                tip = tip += word;
            } else {
                tip = tip + word.substring(0,1);

                for(let i= 1; i < word.length -1 ; i++){
                    tip = tip += " \\_ ";
                }
                tip = tip + word.substring(word.length-1);
            }

        });

        this.indices.push("mon nom est "+tip.toUpperCase());
        this.nbIndices=this.indices.length;

        //and VERY last tip, image crop

        // file name for cropped image
        let outputImage = 'croppedImage.jpg';

        if(fs.existsSync(this.crd.image)){
            const cropped = await cropImage(this.crd.image, outputImage);
            if(cropped !== null){
                this.indices.push(cropped);
                this.nbIndices=this.indices.length;
            }
        }
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
    goodResponse = async(winner) => {
        let points = -1;

        if(winner){
            points = Math.max(maxPoints - this.nbIndices + this.indices.length - (this.wrong[winner] ? Number(this.wrong[winner]) : 0), 0);
            this.scores[winner] = (this.scores[winner] ? Number(this.scores[winner]) : 0) + points;
        }

        if(this.turn < this.max_turn) {
            //next turn
            // Réutiliser la même instance de Card pour éviter les doublons
            const card = this.cardPicker.pickCard();
            if (!card) {
                // Plus de cartes disponibles, terminer le jeu
                logger.info(`[Game] Plus de cartes disponibles, fin de partie anticipée`);
                this.turn = -1;
                this.gameActive = false;
            } else {
                this.crd = card;
                logger.info(`[Game] Carte sélectionnée : ${this.crd ? this.crd.name : 'Aucune'}`);
                this.turn=this.turn + 1;
                this.wrong = {};
                this.end_turn = false;
                await this.buildIndicesList();
            }
        } else {
            this.turn = -1;
            this.gameActive = false;
        }

        return points;
    }

    // Démarre le jeu avec le canal Discord
    async startGame(channel) {
        this.channel = channel;
        this.gameActive = true;
        await this.buildIndicesList();
        await this.startRound();
    }

    // Démarre une nouvelle manche
    async startRound() {
        if (!this.gameActive) return;
        
        // Réinitialiser l'état de fin de tour
        this.end_turn = false;
        
        // Annuler le timer précédent s'il existe
        if (this.currentTimer) {
            clearTimeout(this.currentTimer);
            this.currentTimer = null;
        }
        
        await this.channel.send(`Devinez cette carte !  (${this.turn}/${this.max_turn})`);
        this.currentTimer = setTimeout(() => this.sendNextIndice(), this.speed);
    }

    // Boucle récursive pour envoyer les indices
    async sendNextIndice() {
        if (!this.gameActive || this.end_turn) return;
        
        if (this.indices && this.indices.length > 0) {
            const indiceMsg = this.newIndice();
            await this.channel.send(indiceMsg);
            
            // Vérifier si c'était le dernier indice (après l'appel à newIndice)
            if (this.end_turn) {
                // C'était le dernier indice, attendre puis gérer la fin
                // Stocker le timer pour pouvoir l'annuler
                this.noWinnerTimeout = setTimeout(() => this.handleNoWinner(), this.speed);
            } else {
                // Programmer le prochain indice
                this.currentTimer = setTimeout(() => this.sendNextIndice(), this.speed);
            }
        }
    }

    // Gère le cas où personne n'a trouvé
    async handleNoWinner() {
        this.end_turn = true;
        await this.channel.send(`Personne n'a trouvé, dommage ! La réponse était **${this.crd.name}**`);
        
        if (fs.existsSync(this.crd.image)) {
            const file = new AttachmentBuilder(this.crd.image, { name: `${this.crd.name}.png` });
            await this.channel.send({ files: [file] });
        }
        
        await this.goodResponse();
        await this.showScoresAndContinue();
    }

    // Gère une bonne réponse
    async handleGoodResponse(winner, userId) {
        // Annuler immédiatement le timer d'indices en cours
        if (this.currentTimer) {
            clearTimeout(this.currentTimer);
            this.currentTimer = null;
        }
        // Annuler le timer de "no winner" si il existe
        if (this.noWinnerTimeout) {
            clearTimeout(this.noWinnerTimeout);
            this.noWinnerTimeout = null;
        }
        this.end_turn = true;
        await this.channel.send({ content: `Bravo <@${userId}> ! La bonne réponse était **${this.crd.name}**.` });
        // Stocker l'ID utilisateur avec le score au lieu du username
        await this.goodResponse(userId);
        await this.showScoresAndContinue();
    }

    // Affiche les scores et continue le jeu
    async showScoresAndContinue() {
        const scores = this.getScores();
        
        // Vérifier si c'est la fin de la partie
        if (this.turn === -1) {
            await this.showFinalResults();
            return;
        }
        
        if (scores.length > 0) {
            const guild = this.channel.guild;
            const fieldsWithNames = await Promise.all(scores.map(async field => {
                let displayName = field.name; // Par défaut, utiliser l'ID/username
                if (guild) {
                    try {
                        // field.name contient maintenant l'ID utilisateur
                        const member = await guild.members.fetch(field.name).catch(() => null);
                        if (member) displayName = member.displayName;
                    } catch (err) {
                        logger.error(`[showScoresAndContinue] Erreur lors de la récupération du membre: ${err}`);
                    }
                }
                return { ...field, name: displayName };
            }));
            
            setTimeout(async () => {
                await this.channel.send({ embeds: [{
                    color: 0x00ff00,
                    title: 'Rappel des scores',
                    description: 'Voici le classement actuel :',
                    fields: fieldsWithNames
                }] });
                
                // Continuer le jeu si il reste des tours
                if (this.turn !== -1) {
                    this.currentTimer = setTimeout(() => this.startRound(), this.speed);
                }
            }, 2000);
        } else if (this.turn !== -1) {
            // Pas de scores à afficher mais le jeu continue
            this.currentTimer = setTimeout(() => this.startRound(), this.speed);
        }
    }

    // Affiche les résultats finaux avec félicitations au vainqueur
    async showFinalResults() {
        const scores = this.getScores();
        if (scores.length === 0) {
            await this.channel.send({ embeds: [{
                color: 0xff0000,
                title: '🏁 Fin de partie !',
                description: 'Aucun joueur n\'a marqué de points. Essayez de nouveau !'
            }] });
            return;
        }

        const guild = this.channel.guild;
        const fieldsWithNames = await Promise.all(scores.map(async (field, index) => {
            let userId = field.name; // field.name contient maintenant l'ID utilisateur
            let displayName = field.name; // Par défaut, utiliser l'ID
            
            if (guild) {
                try {
                    // field.name contient maintenant l'ID utilisateur
                    const member = await guild.members.fetch(field.name).catch(() => null);
                    if (member) {
                        displayName = member.displayName;
                        userId = member.user.id;
                    }
                } catch (err) {
                    logger.error(`[showFinalResults] Erreur lors de la récupération du membre: ${err}`);
                }
            }
            
            // Ajouter les médailles pour le podium
            let medal = '';
            if (index === 0) medal = '🥇 ';
            else if (index === 1) medal = '🥈 ';
            else if (index === 2) medal = '🥉 ';
            else medal = `${index + 1}. `;
            
            return { 
                ...field, 
                name: `${medal}${displayName}`,
                displayName: displayName, // Pseudo sans médaille
                userId: userId // Garder l'ID pour les mentions
            };
        }));

        // Message de félicitations au vainqueur
        const winner = fieldsWithNames[0];
        let congratsMessage = '';
        if (winner) {
            congratsMessage = `🎉 Félicitations ${winner.displayName} ! 🎉\nVous remportez cette partie avec **${winner.value} points** !`;
        }

        await this.channel.send({ embeds: [{
            color: 0xffd700, // Couleur or
            title: '🏁 Classement final',
            description: congratsMessage,
            fields: fieldsWithNames.map(field => ({
                name: field.name,
                value: `${field.value} points`,
                inline: true
            })),
            footer: {
                text: `Partie terminée • ${this.max_turn} tours joués`
            }
        }] });
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
