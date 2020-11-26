/* Ce fichier contien les routes pour authentification */

/* Importation framework Express qui permet de déployer rapidement nos API */
const express = require('express');
/* Création router grace à la méthode Router d'Express */
const router = express.Router();

/* Importation controleur des authentification */
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

/* Exportation router, le rendant par là même disponible pour notre application Express */
module.exports = router;