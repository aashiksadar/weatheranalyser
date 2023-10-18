const request = require('supertest');
const app = require('./weather_service.js');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { TemperatureLabel } = require('./models');
const { Sequelize } = require('sequelize');


const dotenv = require('dotenv');

dotenv.config();

const { DB_NAME, DB_USER, DB_PASSWORD, DB_PORT } = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}`, {
  dialect: 'postgres',
  logging: true, // Enable logging
});

const temperatureLabels = [
  { min_temperature: -20, max_temperature: 0, label: 'Very Cold' },
  { min_temperature: 0, max_temperature: 15, label: 'Cold' },
  { min_temperature: 15, max_temperature: 25, label: 'Moderate' },
  { min_temperature: 25, max_temperature: 40, label: 'Hot' },
  { min_temperature: 40, max_temperature: 100, label: 'Very Hot' },
];
  let authToken; // Store the retrieved authentication token
// Before running the tests, insert the test data into the database
beforeAll(async () => {
  await sequelize.sync({ force: true });
  await TemperatureLabel.bulkCreate(temperatureLabels);
    const authResponse = await axios.post('http://localhost:8000/authenticate', {
      username: 'james',
      password: 'bond',
    });

    // Ensure that the authentication was successful
    expect(authResponse.status).toBe(200);
    expect(authResponse.data).toHaveProperty('access_token');
    authToken = authResponse.data.access_token;
    console.log({authToken});
});

afterAll(async () => {
  await sequelize.close();
});


describe('Weather Service Tests', () => {


    it('should return the correct temperature label for Very Cold', async () => {

    const response = await axios.get('http://localhost:8001/api/weather?city=nuuk', {
      headers: {
        Authorization: `Bearer ${authToken}`, // Send the access token in the request header
      },
    });
    console.log({"RECEIVED": response.data});

    const dbLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: response.data.temperature },
        max_temperature: { [Sequelize.Op.gte]: response.data.temperature },
      },
    });

    expect(response.status).toBe(200);
    expect(dbLabel.label).toEqual('Very Cold');
  });
    it('should return the correct temperature label for Cold', async () => {

    const response = await axios.get('http://localhost:8001/api/weather?city=vancouver', {
      headers: {
        Authorization: `Bearer ${authToken}`, // Send the access token in the request header
      },
    });
    console.log({"RECEIVED": response.data});

    const dbLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: response.data.temperature },
        max_temperature: { [Sequelize.Op.gte]: response.data.temperature },
      },
    });

    expect(response.status).toBe(200);
    expect(dbLabel.label).toEqual('Cold');
  });
it('should return the correct temperature label for Moderate', async () => {

    const response = await axios.get('http://localhost:8001/api/weather?city=delhi', {
      headers: {
        Authorization: `Bearer ${authToken}`, // Send the access token in the request header
      },
    });
    console.log({"RECEIVED": response.data});

    const dbLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: response.data.temperature },
        max_temperature: { [Sequelize.Op.gte]: response.data.temperature },
      },
    });

    expect(response.status).toBe(200);
    expect(dbLabel.label).toEqual('Moderate');
  });
it('should return the correct temperature label for Hot', async () => {

    const response = await axios.get('http://localhost:8001/api/weather?city=jeddah', {
      headers: {
        Authorization: `Bearer ${authToken}`, // Send the access token in the request header
      },
    });
    console.log({"RECEIVED": response.data});

    const dbLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: response.data.temperature },
        max_temperature: { [Sequelize.Op.gte]: response.data.temperature },
      },
    });

    expect(response.status).toBe(200);
    expect(dbLabel.label).toEqual('Hot');
  });
it('should return the correct temperature label for Very Hot', async () => {

    const response = await axios.get('http://localhost:8001/api/weather?city=jeddah', {
      headers: {
        Authorization: `Bearer ${authToken}`, // Send the access token in the request header
      },
    });
    console.log({"RECEIVED": response.data});

    const dbLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: response.data.temperature },
        max_temperature: { [Sequelize.Op.gte]: response.data.temperature },
      },
    });

    expect(response.status).toBe(200);
    expect(dbLabel.label).toEqual('Very Hot');
  });

});

