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
/* Importation pour accéder a helmet */
const helmet = require('helmet');
/* Importation pour accéder a express-session*/
const session = require('express-session');
/* Importation d'express-mongo-sanitize pour prévenir des injections en désinfectant les données utilisateurs */
const mongoSanitize = require('express-mongo-sanitize');
 /* Importation d'express-rate-limit et express-slow-down pour controler les répétition d'une requète et de protéger des attaques par force brute */
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
/* Configuration environnement local qui sépare celui-ci du code et protège les données */
require('dotenv').config()

const app = express();

/* Le middleware express-session stocke les données de session sur le serveur ; il ne sauvegarde que l’ID session dans le cookie lui-même, mais pas les données de session
il garanti que les cookies n’ouvrent pas votre application aux attaques */
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

/* Connection a Mongoosedb */
mongoose.connect('mongodb+srv://VCombettes:Mickey3d@cluster0.rmuvw.mongodb.net/<dbname>?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(bodyParser.json());
app.use(mongoSanitize());
/* helmet configure nos http et protège des injections de scripts et d’iframes non sollicitées */
app.use(helmet());

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

/* Si l'user tente de se connectéun certains nombres de fois sans succés (ici 100), l'activité est bloqué pour 5 min */
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: "Trop de tentatives de connexion. Compte bloqué pour 5 minutes"
});
app.use(limiter);

/* Empêche le user de faire de nombreuses tentatives rapidement */
const speedLimiter = slowDown({
  windowMs: 1 * 60 * 1000,
  delayAfter: 10,
  maxDelayMs: 30000,
});
app.use(speedLimiter);

  /* Indique à Express qu'il faut gérer la ressource images de manière statique (un sous-répertoire de notre répertoire de base, __dirname ) à chaque fois qu'elle reçoit une requête vers la route /images */
  app.use('/images', express.static(path.join(__dirname, 'images')));
  
  /* Enregistrement de notre routeur pour toutes les demandes effectuées vers /api/sauce */
  app.use('/api/Sauces', sauceRoutes);
  /* Enregistrement de notre routeur pour toutes les demandes effectuées vers /api/auth */
  app.use('/api/auth', userRoutes);
  
/* Exportation app, le rendant par là même disponible pour notre application Express */
module.exports = app;