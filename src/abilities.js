function abilitiesFunc() {
    return [
        {
            name: 'Aérienne',
            description: "Si *possesseur* est dans la Ligne du haut, il ne peut pas attaquer les Créatures adverses. Il attaque directement la Forteresse adverse, en ignorant les Créatures adverses. Octroyer aussi la capacité spéciale Rage au *possesseur* qui est sur la Ligne du haut n'a aucun effet. Octroyer aussi la capacité spéciale Défenseur au *possesseur* qui est sur la Ligne du haut l'empêcherait d'attaquer aussi bien les Créatures que la Forteresse adverse.",
            manaCost: {
                default: 0.5,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'aerienne.png',
            nb : 1
        },
        {
            name: 'Affûtage',
            description: "Lorsque le *possesseur* inflige assez de Blessures pour détruire une Créature, chaque Blessure excédentaire est infligée à la Forteresse adverse. Si plusieurs Créatures sont détruites par une même attaque (grâce à Splash ou Perforation par exemple), les Blessures excédentaires sont infligées en une seule fois à la Forteresse adverse. *possesseur* n'a aucun effet sur une Créature ayant la capacité spéciale Protection, puisqu'en réduisant la source de Blessures à 0, il n'y a pas de dégâts excédentaires.",
            manaCost: {
                default: 2,
                incantation: 3,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature', 'incantation'],
            href: 'affutage.png',
            nb :2
        },
        {
            name: 'Aquatique',
            description: "Tant que *possesseur* est adjacent à un Pont, il inflige le double de Blessures. Si *possesseur* bénéficie de la capacité spéciale Sprint, le bonus d'attaque octroyé par le Sprint sera aussi doublé.",
            manaCost: {
                default: 1,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'aquatique.png',
            nb : 3
        },
        {
            name: 'Berserk',
            description: "Chaque fois que *possesseur* attaque et détruit au moins une Créature adverse, il attaque une nouvelle fois. Résolvez toutes les attaques du *possesseur* avant de résoudre les attaques et effets des prochaines Créatures. Après avoir détruit la dernière Créature adverse de sa Ligne, comme il doit attaquer de nouveau, il attaque la Forteresse adverse (sauf s'il attaque lors de son tour d'arrivée en jeu grâce à la capacité spéciale Rage).",
            manaCost: {
                default: 1,
                incantation: 2,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature', 'incantation'],
            href: 'berserk.png',
            nb : 4
        },
        {
            name: 'Catalyseur',
            description: "Si *possesseur* est en jeu lors de votre Phase 1, gagnez +2 Mana ce tour. Il n'y a pas de limite au nombre de Mana qu'un joueur peut obtenir lors de la Phase 1 : Régénération du mana.",
            manaCost: {
                default: 1,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'catalyseur.png',
            nb : 5
        },
        {
            name: 'Défenseur',
            description: '*possesseur* peut attaquer les Créatures adverses, mais ne peut pas attaquer la Forteresse adverse. Cette capacité spéciale est un malus. En contrepartie, *possesseur* est intrinsèquement plus puissant que les autres cartes ayant le même coût de mana.',
            manaCost: {
                default: -1,
            },
            canBeAura: false,
            availableFor: ['champion', 'creature'],
            href: 'defenseur.png',
            nb : 6
        },
        {
            name: 'Dérobade',
            description: "Après que *possesseur* a subi au moins 1 Blessure sans être détruit, déplacez-le à l'emplacement le plus éloigné du Pont dans sa Ligne. Si c'est une Créature qui a attaqué *possesseur*, l'effet de la capacité spéciale Dérobade se déclenche une fois que la Créature qui l'a attaqué a terminé de résoudre toutes ses attaques. La capacité spéciale Dérobade se déclenche avant la capacité spéciale Instinct.",
            manaCost: {
                default: 0.5,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'derobade.png',
            nb : 7
        },
        {
            name: 'Indestructible',
            description: '*possesseur* ne subit pas les effets et les Blessures provenant des Incantations (il peut tout de même être ciblé).',
            manaCost: {
                default: 0.5,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'indestructible.png',
            nb : 8
        },
        {
            name: 'Instinct',
            description: "Après que *possesseur* a subi au moins 1 Blessure d'une Créature sans être détruit, il attaque la Créature adverse se trouvant le plus près du Pont dans sa Ligne une fois que la Créature qui l'a attaqué a terminé de résoudre toutes ses attaques. S'il n'y a pas de Créature adverse, *possesseur* attaque la Forteresse adverse. La capacité spéciale Instinct se déclenche après la capacité spéciale Dérobade.",
            manaCost: {
                default: 1,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'instinct.png',
            nb : 9
        },
        {
            name: 'Mercenaire',
            description: "Lorsque *possesseur* devrait retourner dans la main de son propriétaire, à la place il retourne à l'extrémité droite de la main de son adversaire (ou au-dessus de la pioche IA en partie Solo). Cette capacité spéciale est un malus. En contrepartie *possesseur* est intrinsèquement plus puissant que les autres cartes ayant le même coût de mana.",
            manaCost: {
                default: -1,
            },
            canBeAura: false,
            availableFor: ['creature', 'incantation'],
            href: 'mercenaire.png',
            nb : 10
        },
        {
            name: 'Symbiote',
            description: "Lorsque *possesseur* est posé, il peut être placé par-dessus une autre Créature de son Royaume déjà présente en jeu. La VA, les PV et les Capacités spéciales des deux Créatures se cumulent tant qu’elles sont en jeu. Lorsqu’elles sont détruites, les deux cartes remontent dans la main de leur propriétaire, en commençant par remonter *possesseur*. *possesseur* peut aussi être posé en jeu comme une Créature indépendante. *possesseur* ne peut pas être placé par-dessus une autre Créature ayant déjà la capacité spéciale Symbiote. Avec Symbiote, la Vulnérabilité ne se cumule pas avec la VA de l'autre créature, ignorez la VA indiquée et appliquez seulement la Vulnérabilité.",
            manaCost: {
                default: 2,
            },
            canBeAura: false,
            availableFor: ['champion', 'creature'],
            href: 'parasite.png',
            nb : 11
        },
        {
            name: 'Perforation',
            description: "*possesseur* inflige ses Blessures à la Créature ciblée ET à la Créature située derrière elle, dans la même Ligne. Cet effet est appliqué uniquement sur des Créatures, jamais sur la Forteresse adverse. Les Blessures d'une attaque avec plusieurs cibles se résolvent simultanément.",
            manaCost: {
                default: 1,
                incantation: 2,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature', 'incantation'],
            href: 'perforation.png',
            nb : 12
        },
        {
            name: 'Prix du sang',
            description: "Si vous n'avez pas assez de Mana pour payer l'intégralité du coût de *possesseur*, dépensez l'intégralité de votre Mana restant, et pour chaque Mana manquant, subissez une Blessure en décalant votre Forteresse d'un emplacement vers la droite dans votre main. Les Blessures ainsi subies sont infligées une à une.",
            manaCost: {
                default: 2,
                incantation: 3,
            },
            canBeAura: false,
            availableFor: ['champion', 'creature', 'incantation'],
            href: 'prix-du-sang.png',
            nb : 13
        },
        {
            name: 'Protection',
            description: "Lors de chaque tour, réduit à 0 la première source de Blessures dont *possesseur* est la cible. Est considéré comme une source de Blessures n'importe quelle Créature ou Incantation infligeant au moins 1 Blessure. Les effets de cette source de Blessures sont tout de même déclenchés (Splash, Perforation, etc.) et sont infligés normalement aux autres Créatures.",
            manaCost: {
                default: 2,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'protection.png',
            nb : 14
        },
        {
            name: 'Rage',
            description: "*possesseur* peut attaquer des Créatures adverses pendant le tour où il est posé en jeu. Cet effet ne permet pas d'attaquer la Forteresse adverse pendant le tour où *possesseur* est posé. S'il n'y a aucune Créature adverse à attaquer le tour où *possesseur* est posé, la capacité spéciale Rage est sans effet.",
            manaCost: {
                default: 1.5,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'rage.png',
            nb : 15
        },
        {
            name: 'Régénération',
            description: "Chaque fois que *possesseur* inflige des Blessures à une cible, décalez la Forteresse de son propriétaire d'un emplacement vers la gauche dans sa main. Si le Fort doit être décalé vers la gauche et qu'il est déjà à l'extrémité gauche de la main de son propriétaire, le Fort est alors pivoté afin que le Bastion soit à l'endroit, puis déplacé jusqu'à être la deuxième carte la plus à droite de la main de son propriétaire.",
            manaCost: {
                default: 1,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature', 'incantation'],
            href: 'regeneration.png',
            nb : 16
        },
        {
            name: 'Splash',
            description: "*possesseur* inflige ses Blessures à la Créature ciblée ET à la Créature située à la même place dans la Ligne voisine. Cet effet est appliqué uniquement sur des Créatures, jamais sur la Forteresse adverse. Les Blessures d'une attaque avec plusieurs cibles se résolvent simultanément.",
            manaCost: {
                default: 1,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature', 'incantation'],
            href: 'splash.png',
            nb : 17
        },
        {
            name: 'Sprint',
            description: "Chaque fois que *possesseur* attaque, déplacez-le jusqu'à ce qu'il soit le plus proche de la carte Pont. Pour ce tour, *possesseur* inflige +X Blessures, où X est égal au nombre de Créatures par-dessus lesquelles il s'est déplacé. Il n'attaque qu'une seule fois mais sa VA est modifiée jusqu'à la fin de la Phase 3 : Assaut.",
            manaCost: {
                default: 0.5,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'sprint.png',
            nb : 18
        },
        {
            name: 'Vulnérabilité',
            description: "La VA de *possesseur* inflige X Blessures à une Créature adverse ou à la Forteresse adverse, où X est égal aux PV de la cible -1. Si *possesseur* attaque plusieurs cibles (grâce à Splash ou Perforation par exemple), cet effet agit sur toutes les cibles de l'attaque. Cette Capacité spéciale ne détruit pas la cible mais l'affaiblit. Mais associée avec les Capacités spéciales Aquatique ou Sprint, *possesseur* peut détruire n'importe quelle cible en une seule attaque. Si *possesseur* attaque la Forteresse adverse, cela la déplace juste avant la carte à l'extrémité droite de sa main, sans changer son orientation (le Bastion reste orienté en Bastion).",
            manaCost: {
                default: 1,
            },
            canBeAura: true,
            availableFor: ['champion', 'creature'],
            href: 'vulnerabilite.png',
            nb : 19
        },
    ];
}

module.exports = {abilitiesFunc};