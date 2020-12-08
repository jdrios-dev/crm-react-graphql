const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email, nombre, apelido } = usuario;

  return jwt.sign({ id, email, nombre, apelido  }, secreta, { expiresIn })
}

//Resolvers
const resolvers = {
  Query: {
    obtenerUsuario: async (_, { token }) => {
      const usuarioId = await jwt.verify(token, process.env.SECRETA)

      return usuarioId;
    },
  },

  Mutation: {
    nuevoUsuario: async (_, { input }) => {

      const { email, password } = input;
      //Revisar si user esta registrado
      const existeUsuario = await Usuario.findOne({email});
      if (existeUsuario) {
        throw new Error('El usuario ya esta registrado');
      }
      //hash password
      const salt = await bcryptjs.genSalt(10);
      input.password = await bcryptjs.hash(password, salt);

      //guardar en la database
      try {
        const usuario = new Usuario(input);
        usuario.save();
        return  usuario;
      } catch (error) {
        console.log(error);
      }
    },

    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;
      //Revisar si existe
      const existeUsuario = await Usuario.findOne({ email });
      if (!existeUsuario) {
        throw new Error('El usuario no esta registrado');
      }

      //Revisa password
      const passwordCorrecto = await bcryptjs.compare( password, existeUsuario.password );
      if( !passwordCorrecto ) {
        throw new Error('El password es incorrecto');
      }

      //Crear Token

      return {
        token: crearToken(existeUsuario, process.env.SECRETA, '24h')
      }

    },
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);

        //almacenar
        const resultado = await producto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    }
  }
}

module.exports = resolvers;