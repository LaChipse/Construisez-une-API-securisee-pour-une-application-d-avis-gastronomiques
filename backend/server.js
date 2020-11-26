/* Ce fichier correspond au serveur */

/* Importation package http de node qui permet le création d'un serveur*/
const http = require('http');

/* Importation de notre application */
const app = require('./app');

/* La fonction normalizePort renvoie un port valide, qu'il soit fourni sous la forme d'un numéro ou d'une chaîne */
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
/* Port 3000 ou une variable environnement si port 3000 pas valable */
const port = normalizePort(process.env.PORT || '3000');
/* Configuration pour dire sur quel port l'application va tourner */
app.set('port', port);

/* La fonction errorHandler  recherche les différentes erreurs et les gère de manière appropriée */
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/* Création d'un serveur en passant une fonction qui sera exécutée à chaque appel effectué vers ce serveur */
const server = http.createServer(app);

/* Un écouteur d'évènements est également enregistré, consignant le port ou le canal nommé sur lequel le serveur s'exécute dans la console */
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);
