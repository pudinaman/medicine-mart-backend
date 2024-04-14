require('dotenv').config();

module.exports = {
    HOST: process.env.MONGODB_HOST,
    PORT: process.env.MONGODB_PORT,
    DB: process.env.MONGODB_DB,
  };