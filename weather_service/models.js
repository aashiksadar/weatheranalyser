const { Sequelize, DataTypes } = require('sequelize');

const dotenv = require('dotenv');

dotenv.config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_PORT } = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}`, {
  dialect: 'postgres',
  logging: true, // Enable logging
});

const TemperatureLabel = sequelize.define('temperature_label', {
  min_temperature: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  max_temperature: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

TemperatureLabel.sync();

module.exports = {
  TemperatureLabel,
};

