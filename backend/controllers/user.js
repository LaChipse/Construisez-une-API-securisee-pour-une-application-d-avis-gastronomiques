/* Ce fichier contient le controleur des authentifications */

/* Importation package de chriffrement */
const bcrypt = require('bcrypt');
/* Imporation package de création et vérification des tokens d'authentification */
const jwt = require('jsonwebtoken');

const User = require('../models/User');

/* Dans cette fonction :
    nous appelons la fonction de hachage de bcrypt dans notre mot de passe et lui demandons de « saler » le mot de passe 10 fois;
    il s'agit d'une fonction asynchrone qui renvoie une Promise dans laquelle nous recevons le hash généré ;
    dans notre bloc then , nous créons un utilisateur et l'enregistrons dans la base de données, en renvoyant une réponse de réussite en cas de succès, et des erreurs avec le code d'erreur en cas d'échec */
exports.signup = (req, res, next) => {
  const password = req.body.password;
  const regex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,15}$")
  if(regex.test(password)){
      bcrypt.hash(password, 10)
        .then(hash => {
          const user = new User({
            email: req.body.email,
            password: hash
          });
          user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
  } else {
    res.status(400).json({ error: "Le mot de passe doit comporter entre 6 et 15 caractères, posséder au moins un chiffre, une lettre majuscule et minuscule et l'un des caractères spéciaux suivants: #?!@$%^&*-."});
  }
}


  /* Dans cette fonction :
    nous utilisons notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données :
        dans le cas contraire, nous renvoyons une erreur 401 Unauthorized ,
        si l'e-mail correspond à un utilisateur existant, nous continuons ;

    nous utilisons la fonction compare debcrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données :
        s'ils ne correspondent pas, nous renvoyons une erreur 401 Unauthorized et un message « Mot de passe incorrect ! » ;
        s'ils correspondent, les informations d'identification de notre utilisateur sont valides. Dans ce cas, nous renvoyons une réponse 200 contenant l'ID utilisateur et un token. */
  exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
        /* Dans le code :
          nous utilisons la fonction sign dejsonwebtoken pour encoder un nouveau token ;
          ce token contient l'ID de l'utilisateur en tant que payload (les données encodées dans le token) ;
          nous utilisons une chaîne secrète de développement temporaire RANDOM_SECRET_KEY pour encoder notre token (à remplacer par une chaîne aléatoire beaucoup plus longue pour la production) ;
          nous définissons la durée de validité du token à 24 heures. L'utilisateur devra donc se reconnecter au bout de 24 heures ;
          nous renvoyons le token au front-end avec notre réponse */
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };