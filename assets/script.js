class TypeProduit {
    _id = 0;
    name;
    content;

    constructor(name) {
        this.name = name;

        // Sauvegarde la promesse à la place de la valeur directe
        this.content = this.loadContent(name);
    }

    // Récupère les données JSON de manière asynchrone
    async loadContent(name) {
        const data = await getJSON(`assets/produits/${name}.json`);
        if (data && data.length > 0) {
            return data;
        } else {
            // Valeur par défaut si le fichier JSON est vide ou invalide
            return [
                {
                    "id": 0,
                    "nom": "indéfini",
                    "description": "indéfinie",
                    "image": "path/to/default-image.jpg"
                }
            ];
        }
    }

    get id() {
        return this._id;
    }

    set id(new_id) {
        this.content.then(content => {
            // Normaliser l'index pour qu'il soit dans la plage des contenus disponibles
            if (new_id >= content.length)
                new_id = new_id % content.length;
            else if (new_id < 0)
                new_id = content.length - 1; // Si négatif, revenir à la fin

            this._id = new_id;
        });
    }

    async getCurrentContent() {
        // Attendre la résolution de la promesse de contenu
        const content = await this.content;
        return content[this.id];
    }
}

// Objets TypeProduit pour chaque catégorie de produits
const types_produits = {
    "boulangerie": new TypeProduit("boulangerie"),
    "patisseries": new TypeProduit("patisseries"),
    "sandwicherie": new TypeProduit("sandwicherie"),
    "pizzas": new TypeProduit("pizzas"),
    "gourmandises": new TypeProduit("gourmandises"),
};

// Fonction d'initialisation des événements
setTypeProduitOnclick();

// Récupération des données JSON
async function getJSON(link) {
    return await fetch(link)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Unable to fetch data:", error);
            return null;  // Retourne null en cas d'erreur
        });
}

// Fonction de mise à jour du produit affiché
async function actualiseProduit(type_produit) {
    const titre = document.getElementById(`${type_produit.name}-nom`);
    const description = document.getElementById(`${type_produit.name}-description`);
    const banner = document.getElementById(`banner-${type_produit.name}`);

    console.log(`Titre ID: ${titre}`);
    console.log(`Description ID: ${description}`);
    console.log(`Banner ID: ${banner}`);

    if (titre == null || description == null || banner == null) {
        throw new Error(`Aucun titre ou description n'existe dans la page pour le type de produit :\n
            type produit : ${type_produit.name}\n
            titre id : ${type_produit.name}-nom\n
            description id : ${type_produit.name}-description\n
            banner id : banner-${type_produit.name}
        `);
    }

    // Attendre la récupération des données du produit actuel
    const current_content = await type_produit.getCurrentContent();

    if (!current_content) {
        throw new Error(`Le contenu pour le produit ${type_produit.name} n'est pas disponible.`);
    }

    // Mise à jour du contenu de la page avec le produit actuel
    titre.innerHTML = current_content["nom"];
    description.innerHTML = current_content["description"];
    banner.style.backgroundImage = `url("${current_content["image"]}")`;  // Mise à jour de l'image
}

// Définir les événements onClick pour les boutons "Next" et "Prev"
function setTypeProduitOnclick() {
    for (const type_produit of Object.values(types_produits)) {
        setPrevOnclick(type_produit.name);
        setNextOnclick(type_produit.name);
    }
}

// Gestion du bouton "Précédent" (Prev)
function setPrevOnclick(type_produit_name) {
    const element = document.getElementById(`${type_produit_name}-prev`);

    if (element == null)
        throw new Error(`Aucun element HTML avec l'id ${type_produit_name}-prev a été trouvé`);

    element.addEventListener("click", async event => {
        const nom = event.target.id.split("-")[0];
        const type_produit = types_produits[nom];
        
        type_produit.id--;  // Décrémente l'ID du produit

        await actualiseProduit(type_produit);  // Actualise l'affichage
    });
}

// Gestion du bouton "Suivant" (Next)
function setNextOnclick(type_produit_name) {
    const element = document.getElementById(`${type_produit_name}-next`);

    if (element == null)
        throw new Error(`Aucun element HTML avec l'id ${type_produit_name}-next a été trouvé`);

    element.addEventListener("click", async event => {
        const nom = event.target.id.split("-")[0];
        const type_produit = types_produits[nom];

        type_produit.id++;  // Incrémente l'ID du produit

        await actualiseProduit(type_produit);  // Actualise l'affichage
    });
}

async function chargerEtAfficherProduit(typeProduit) {
    try {
        // Charger le fichier JSON
        const response = await fetch(`assets/produits/${typeProduit}.json`);
        if (!response.ok) {
            throw new Error(`Erreur lors du chargement du fichier JSON : ${response.status}`);
        }
        
        const data = await response.json();

        // Vérifier que le fichier JSON contient des données
        if (data.length > 0) {
            const premierProduit = data[0];  // Obtenir le premier produit

            // Mettre à jour le DOM avec les données du premier produit
            document.getElementById(`${typeProduit}-nom`).innerHTML = premierProduit.nom;
            document.getElementById(`${typeProduit}-description`).innerHTML = premierProduit.description;
            document.getElementById(`banner-${typeProduit}`).style.backgroundImage = `url("${premierProduit.image}")`;
        } else {
            console.warn(`Aucun produit trouvé dans le fichier ${typeProduit}.json`);
        }
    } catch (error) {
        console.error("Une erreur est survenue :", error);
    }
}

// Appeler la fonction pour chaque type de produit
const typesProduits = ["boulangerie", "patisseries", "sandwicherie", "pizzas", "gourmandises"];
typesProduits.forEach(typeProduit => {
    chargerEtAfficherProduit(typeProduit);
});