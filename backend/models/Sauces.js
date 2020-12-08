/* Ce fichier contient un modèle des objets importés dans le serveur */

/* Importation Mongoose qui correspond à la couche de base de données */
const mongoose = require('mongoose');

/* Utilisation méthode Schéma de mongoose pour créations schéma de données contenant champs souhaités pour chaque sauce, 
indique leur type ainsi que leur caractère (obligatoire ou non) */
const sauceSchema = mongoose.Schema({
  userId: { type: String },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true}, 
  description: { type: String, required: true },
  mainPepper: { type: String, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  usersLiked: [String],
  usersDisliked: [String],
});

/* Exportation schéma en tant que modèle Mongoose appelé « Sauce », le rendant par là même disponible pour notre application Express */
module.exports = mongoose.model('Sauce', sauceSchema);