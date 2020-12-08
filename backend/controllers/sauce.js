/* Ce fichier contien notre contrôleur sauce */

/* Importation Mongoose qui correspond à la couche de base de données */
const Sauce = require('../models/Sauces');
/* Importation package fs de Node qui nous donne accès aux fonctions qui nous permettent de modifier le système de fichiers, y compris aux fonctions permettant de supprimer les fichiers */
const fs = require('fs');

/* Pour ajouter un fichier à la requête, le front-end doit envoyer les données de la requête sous la forme form-data, et non sous forme de JSON. Le corps de la requête contient une chaîne sauce, qui est simplement un objet sauce converti en chaîne. Nous devons donc l'analyser à l'aide de JSON.parse() pour obtenir un objet utilisable.
  Nous devons également résoudre l'URL complète de notre image, car req.file.filename ne contient que le segment filename. 
  Nous utilisons req.protocol pour obtenir le premier segment (dans notre cas 'http' ). Nous ajoutons '://' , puis utilisons req.get('host') pour résoudre l'hôte du serveur (ici, 'localhost:3000' ). Nous ajoutons finalement '/images/' et le nom de fichier pour compléter notre URL. */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  /* Création instance du modèle Sauce en lui passant un objet JavaScript contenant toutes les informations requises du corps de requête analysé 
  (en ayant supprimé en amont le faux_id envoyé par le front-end) */
  const sauce = new Sauce({
    /* L'opérateur spread ... est utilisé pour faire une copie de tous les éléments de req.body */
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`});
  /* Méthode save() qui enregistre Sauce dans la base de données */
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

/* Dans cette route :
    nous utilisons la méthode get() pour répondre uniquement aux demandes GET à cet endpoint ;
    nous utilisons deux-points : en face du segment dynamique de la route pour la rendre accessible en tant que paramètre ;
    nous utilisons ensuite la méthode findOne() dans notre modèle Sauce pour trouver la sauce unique ayant le même _id que le paramètre de la requête ;
    cette sauce est ensuite retourné dans une Promise et envoyé au front-end ;
    si aucune sauce n'est trouvé ou si une erreur se produit, nous envoyons une erreur 404 au front-end, avec l'erreur générée. */
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id })
    .then((sauce) => {res.status(200).json(sauce)})
    .catch((error) => {res.status(404).json({error: error});
    }
  );
};

/* Création d'un objet sauceObject qui regarde si req.file existe ou non. 
S'il existe, on traite la nouvelle image ; s'il n'existe pas, on traite simplement l'objet entrant. 
On crée ensuite une instance de Sauce à partir de sauceObject , puis on effectue la modification */
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  /* Utilisation de la méthode updateOne() dans notre modèle Sauce. 
  Cela nous permet de mettre à jour la sauce qui correspond à l'objet que nous passons comme premier argument. 
  Nous utilisons aussi le paramètre id passé dans la demande et le remplaçons par la sauce passée comme second argument */
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

/* Dans cette fonction :
    nous utilisons l'ID que nous recevons comme paramètre pour accéder à la sauce correspondante dans la base de données ;
    nous utilisons le fait de savoir que notre URL d'image contient un segment /images/ pour séparer le nom de fichier ;
    nous utilisons ensuite la fonction unlink du package fs pour supprimer ce fichier, en lui passant le fichier à supprimer et le callback à exécuter une fois ce fichier supprimé ;
    dans le callback, nous implémentons la logique d'origine, en supprimant la sauce de la base de données. */
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        /* Nous passons un objet correspondant au document à supprimer à la méthode deleteOne(). 
        Nous envoyons ensuite une réponse de réussite ou d'échec au front-end. */
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

/* Utilisation méthode find() dans notre modèle Mongoose afin de renvoyer un tableau contenant toutes les sauces dans notre base de données */
exports.getAllsauce = (req, res, next) => {
  Sauce.find()
  .then((sauces) => {res.status(200).json(sauces)})
  .catch((error) => {res.status(400).json({error: error})}
  );
};

/* Vérification de la valeur de like de la requète.
on met à jour les champs correspondants de l'objet Sauce grâce à l'opérateur $inc et $push. */
exports.likeSauce = (req, res, next) => {    
  const like = req.body.like;
  if (like == 1) {
      Sauce.updateOne({_id: req.params.id}, { $inc: { likes: 1}, $push: { usersLiked: req.body.userId}, _id: req.params.id })
      .then( () => res.status(200).json({ message: 'Vous aimez cette sauce !' }))
      .catch( error => res.status(400).json({ error}))

  } else if (like == -1) {
      Sauce.updateOne({_id: req.params.id}, { $inc: { dislikes: 1}, $push: { usersDisliked: req.body.userId}, _id: req.params.id })
      .then( () => res.status(200).json({ message: 'Vous n\'aimez pas cette sauce !' }))
      .catch( error => res.status(400).json({ error}))

  /* Si like = 0, on recherche l'objet Sauce qui a pour id le même que celui du paramètre de la requète.
  On recherche si l'userId était enregistré dans le champ usersLiked ou userDisliked puis on met à jour les différents champs.
  (mise à zéro du champ likes ou dislikes et retrait de l'userId du tableau usersLiked ou usersDisliked) */
  } else { 
      Sauce.findOne( {_id: req.params.id})
      .then( sauce => {
          if( sauce.usersLiked.indexOf(req.body.userId)!== -1){
               Sauce.updateOne({_id: req.params.id}, { $inc: { likes: -1},$pull: { usersLiked: req.body.userId}, _id: req.params.id })
              .then( () => res.status(200).json({ message: 'Vous n\'aimez plus cette sauce !' }))
              .catch( error => res.status(400).json({ error}))
              }
          else if( sauce.usersDisliked.indexOf(req.body.userId)!== -1) {
              Sauce.updateOne( {_id: req.params.id}, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId}, _id: req.params.id})
              .then( () => res.status(200).json({ message: 'Vous aimez peut-être cette sauce !' }))
              .catch( error => res.status(400).json({ error}))
              }           
      })
      .catch( error => res.status(400).json({ error}))             
  }   
};