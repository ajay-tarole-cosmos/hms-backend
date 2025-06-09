const { Sequelize } = require("sequelize");
const config = require("./config");

const sequelize = new Sequelize(
  config.pg.database,
  config.pg.user,
  config.pg.password,
  {
    host: config.pg.host,
    port: config.pg.port,
    dialect: 'postgres',
    logging: false,
    timezone: '+05:30',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, Sequelize };