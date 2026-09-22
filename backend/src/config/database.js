require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'financaspro',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: true,
      timestamps: true,
    },
    dialectOptions: {
      charset: 'utf8mb4',
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
