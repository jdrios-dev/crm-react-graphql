const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
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
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      //revisar si producto existe
      const producto = await Producto.findById(id);

      if(!producto){
        throw new Error('Producto no encontrado');
      }
      return producto
    },
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, {}, ctx)=> {
      try {
        const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, {id}, ctx) => {
      const cliente = await Cliente.findById(id);

      if(!cliente){
        throw new Error('el cliente no existe');
      }

      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error ('no tienes credenciales')
      }
      return cliente;
    }
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
    //Productos
    nuevoProducto: async (_, { input }) => {
      try {
        const producto = new Producto(input);
        //almacenar
        const resultado = await producto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, { id, input })=> {
      let producto = await Producto.findById(id);

      if(!producto) {
        throw new Error ('Producto no encontrado');
      }

      //guardarlo en db
      producto = await Producto.findOneAndUpdate({ _id: id }, input, { new: true });

      return producto;
    },
    eliminarProducto: async(_, { id }) => {
      let producto = await Producto.findById(id);

      if(!producto) {
        throw new Error ('Producto no encontrado');
      }

      //eliminar
      await Producto.findByIdAndDelete({_id : id});
      return 'Producto eliminado'
    },
    //Clientes
    nuevoCliente: async  (_, { input }, ctx) => {
      const { email } = input;
      const cliente = await Cliente.findOne({email});
      if(cliente){
        throw new Error('Ese cliente ya esta registrado');
      }
      const nuevoCliente = new Cliente(input);
      nuevoCliente.vendedor = ctx.usuario.id;
      try {
        const resultado = await nuevoCliente.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }

    },
    actualizarCliente: async (_, { id, input},ctx)=> {
      let cliente = await Cliente.findById(id);
      if(!cliente) {
        throw new Error ('Cliente no encontrado');
      }
      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error ('no tienes credenciales')
      }
      //guardarlo en db
      cliente = await Cliente.findOneAndUpdate({ _id: id }, input, { new: true });
      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx)=>{
      let cliente = await Cliente.findById(id);
      if(!cliente) {
        throw new Error ('Cliente no encontrado');
      }
      if(cliente.vendedor.toString() !== ctx.usuario.id){
        throw new Error ('no tienes credenciales')
      }
      //guardarlo en db
      cliente = await Cliente.findOneAndDelete({ _id: id });
      return 'Cliente eliminado';
    }
  }
}

module.exports = resolvers;