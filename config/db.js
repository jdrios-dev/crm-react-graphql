const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
    console.log('==================');
    console.log('==================');
    console.log('DataBase Conected');
    console.log('==================');
    console.log('==================');
  } catch (error) {
    console.log('Se presento un error');
    console.log(error);
    process.exit(1);
  }
}

module.exports = conectarDB;