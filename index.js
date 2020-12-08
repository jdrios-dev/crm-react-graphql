const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

const conectarDB = require('./config/db');

//Conectar Base de Datos
conectarDB();


//server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

//Init server
server.listen().then(({url}) => {
  console.log(`Servidor listo en la URL ${url}`);
})