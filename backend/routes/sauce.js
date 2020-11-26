/* Ce fichier contiendra la logique de nos routes sauce */

/* Importation framework Express qui permet de déployer rapidement nos API */
const express = require('express');
/* Création router grace à la méthode Router d'Express */
const router = express.Router();

/* Importation du middleware de protection des routes et le passons comme argument aux routes à protéger */
const auth = require('../middleware/auth');
/* Imporation middleware multer puis mise à jour dans routes POST et PUT */
const multer = require('../middleware/multer-config');

/* Importation controleur */
const sauceCtrl = require('../controllers/sauce');

/* requete pour récupérer toutes les sauces */
router.get('/', auth, sauceCtrl.getAllsauce);
/* requete pour envoyer une sauce */
router.post('/', auth, multer, sauceCtrl.createSauce);
/* requete pour récupérer une sauce dont l'identifiant est id*/
router.get('/:id', auth, sauceCtrl.getOneSauce);
/* requete pour modifier une sauce */
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
/* requete pour supprimer une sauce */
router.delete('/:id', auth, sauceCtrl.deleteSauce);
/* requete pour like ou dislike une sauce */
router.post('/:id/like', auth, sauceCtrl.likeSauce);

/* Exportation router, le rendant par là même disponible pour notre application Express */
module.exports = router;