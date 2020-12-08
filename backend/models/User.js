/* Ce fichier correspond à un modèle pour l'authentification */

/* Importation Mongoose qui correspond à la couche de base de données */
const mongoose = require('mongoose');
/* Importation package pour créer notre propre modèle utilisateur */
const uniqueValidator = require('mongoose-unique-validator');

/* Pour s'assurer que deux utilisateurs ne peuvent pas utiliser la même adresse e-mail, nous utiliserons le mot clé unique pour l'attribut email du schéma d'utilisateur userSchema */
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

/* La valeur unique , avec l'élément mongoose-unique-validator passé comme plug-in, s'assurera qu'aucun des deux utilisateurs ne peut partager la même adresse e-mail */
userSchema.plugin(uniqueValidator);

/* Exportation modèle mongoose, le rendant par là même disponible pour notre application Express */
module.exports = mongoose.model('User', userSchema);