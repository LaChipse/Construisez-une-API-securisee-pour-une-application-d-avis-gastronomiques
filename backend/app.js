  /* Ce fichier correspond à l'application */

/* Importation framework Express qui permet de déployer rapidement nos API */
const express = require('express');

/* Importation Mongoose qui correspond à la couche de base de données */
const mongoose = require('mongoose');
/* Importation router sauce */
const sauceRoutes = require('./routes/sauce');
/* Importation router authentification */
const userRoutes = require('./routes/user');
/* Importation pour accéder au path du serveur */
const path = require('path');

/* Importation package body-parser pour extraction de l'objet JSON des demandes */
const bodyParser = require('body-parser');
const app = express();

/* Connection a Mongoosedb */
mongoose.connect('mongodb+srv://VCombettes:Mickey3d@cluster0.rmuvw.mongodb.net/<dbname>?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.json());

/* Ces headers permettent :
    d'accéder à notre API depuis n'importe quelle origine ( '*' ) ;
    d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) ;
    d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.). */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

  /* Indique à Express qu'il faut gérer la ressource images de manière statique (un sous-répertoire de notre répertoire de base, __dirname ) à chaque fois qu'elle reçoit une requête vers la route /images */
  app.use('/images', express.static(path.join(__dirname, 'images')));
  
  /* Enregistrement de notre routeur pour toutes les demandes effectuées vers /api/sauce */
  app.use('/api/Sauces', sauceRoutes);
  /* Enregistrement de notre routeur pour toutes les demandes effectuées vers /api/auth */
  app.use('/api/auth', userRoutes);
  
/* Exportation app, le rendant par là même disponible pour notre application Express */
module.exports = app;