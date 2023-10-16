const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { TemperatureLabel } = require('./models');
const dotenv = require('dotenv');
const request = require('supertest');
const MockAdapter = require('axios-mock-adapter'); // Added mock adapter

dotenv.config();

const app = express();
app.use(express.json());

const {OPEN_WEATHER_API_KEY} = process.env;
//Insert sample temperature labels into the database (only once)
async function insertSampleTemperatureLabels() {
  try {
    await TemperatureLabel.bulkCreate([
      { min_temperature: -20, max_temperature: 0, label: 'Very Cold' },
      { min_temperature: 0, max_temperature: 15, label: 'Cold' },
      { min_temperature: 15, max_temperature: 25, label: 'Moderate' },
      { min_temperature: 25, max_temperature: 40, label: 'Hot' },
      { min_temperature: 40, max_temperature: 100, label: 'Very Hot' },
    ]);

    console.log('Sample temperature labels inserted successfully.');
  } catch (error) {
    console.error('Error inserting sample temperature labels:', error);
  }
}
jest.mock('axios');

// gRPC Service Implementation
const packageDefinition = protoLoader.loadSync('../auth_service/auth.proto');
const authServiceProto = grpc.loadPackageDefinition(packageDefinition).auth;
const authServiceClient = new authServiceProto.AuthService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Middleware for token validation
const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is missing' });
  }

  authServiceClient.isAccessTokenValid({ accessToken: token }, (error, response) => {
    if (error || !response.isValid) {
      return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }
    next();
  });
};

// Define the API route for weather data
app.get('/api/weather', validateToken, async (req, res) => {
  try {
    const { city } = req.query;
    const { OPEN_WEATHER_API_KEY } = process.env;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);

    const temperature = response.data.main.temp;

    const label = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: temperature },
        max_temperature: { [Sequelize.Op.gte]: temperature },
      },
    });

    res.status(200).json({ success: true, temperature, label: label.label });
  } catch (error) {
    console.error(`Error fetching weather data: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch weather data' });
  }
});

// Initialize the server
const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Weather Data Service is running on port ${PORT}`);
});

// Set up the mock adapter for Axios
const mock = new MockAdapter(axios);

jest.spyOn(authServiceClient, 'isAccessTokenValid').mockImplementation((_, callback) => {
  // Mock the authentication response
  callback(null, { isValid: true });
});

// Tests for each temperature label
describe('WeatherAnalyzer API Tests', () => {
    let token; // To store the authentication token

  beforeAll(async () => {
    // Insert sample temperature labels into the database (only once)
    await insertSampleTemperatureLabels();

    // Mock the authentication response
    jest.spyOn(authServiceClient, 'isAccessTokenValid').mockImplementation((_, callback) => {
      // Mock the authentication response
      callback(null, { isValid: true });
    });

    // Obtain a valid token for testing
    const response = await request(app)
      .post('/authenticate')
      .send({ username: 'james', password: 'bond' }); // Replace with your actual username and password
    token = response.body.token;
  });

  afterAll(async () => {
    // Clean up the database after all tests
    await TemperatureLabel.destroy({ where: {} });
  });

  it('should return the correct temperature label for Very Cold', async () => {
          const url = `https://api.openweathermap.org/data/2.5/weather?q=cairo&appid=${OPEN_WEATHER_API_KEY}&units=metric`;

    // Mock the OpenWeatherMap API response with a temperature range corresponding to Very Cold
    mock.onGet(url).reply(200, {
      main: { temp: -15 },
    });

    // Perform the API request to /api/weather with the mocked temperature
    const response = await request(app).get('/api/weather?city=london').set('Authorization', `Bearer ${token}`);

    // Query the database to get the actual label
    const actualLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: -15 },
        max_temperature: { [Sequelize.Op.gte]: -15 },
      },
    });

    // Expect the response to contain the correct label
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      temperature: -15,
      label: actualLabel.label, // Compare with the actual label from the database
    });
  });

  // Similar tests for Cold, Moderate, Hot, and Very Hot labels
  it('should return the correct temperature label for Cold', async () => {
    // Mock the OpenWeatherMap API response with a temperature range corresponding to Cold
    mock.onGet('https://api.openweathermap.org/data/2.5/weather?q=london&appid=YOUR_API_KEY&units=metric').reply(200, {
      main: { temp: 10 },
    });

    // Perform the API request to /api/weather with the mocked temperature
    const response = await request(app).get('/api/weather?city=london').set('Authorization', `Bearer ${token}`);
    // Query the database to get the actual label
    const actualLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: 10 },
        max_temperature: { [Sequelize.Op.gte]: 10 },
      },
    });

    // Expect the response to contain the correct label
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      temperature: 10,
      label: actualLabel.label, // Compare with the actual label from the database
    });
  });

  it('should return the correct temperature label for Moderate', async () => {
    // Mock the OpenWeatherMap API response with a temperature range corresponding to Moderate
    mock.onGet('https://api.openweathermap.org/data/2.5/weather?q=london&appid=YOUR_API_KEY&units=metric').reply(200, {
      main: { temp: 18 },
    });

    // Perform the API request to /api/weather with the mocked temperature
    const response = await request(app).get('/api/weather?city=london').set('Authorization', `Bearer ${token}`);
    // Query the database to get the actual label
    const actualLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: 18 },
        max_temperature: { [Sequelize.Op.gte]: 18 },
      },
    });

    // Expect the response to contain the correct label
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      temperature: 18,
      label: actualLabel.label, // Compare with the actual label from the database
    });
  });

  it('should return the correct temperature label for Hot', async () => {
    // Mock the OpenWeatherMap API response with a temperature range corresponding to Hot
    mock.onGet('https://api.openweathermap.org/data/2.5/weather?q=london&appid=YOUR_API_KEY&units=metric').reply(200, {
      main: { temp: 30 },
    });

    // Perform the API request to /api/weather with the mocked temperature
    const response = await request(app).get('/api/weather?city=london').set('Authorization', `Bearer ${token}`);
    // Query the database to get the actual label
    const actualLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: 30 },
        max_temperature: { [Sequelize.Op.gte]: 30 },
      },
    });

    // Expect the response to contain the correct label
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      temperature: 30,
      label: actualLabel.label, // Compare with the actual label from the database
    });
  });

  it('should return the correct temperature label for Very Hot', async () => {
    // Mock the OpenWeatherMap API response with a temperature range corresponding to Very Hot
    mock.onGet('https://api.openweathermap.org/data/2.5/weather?q=london&appid=YOUR_API_KEY&units=metric').reply(200, {
      main: { temp: 50 },
    });

    // Perform the API request to /api/weather with the mocked temperature
    const response = await request(app).get('/api/weather?city=london').set('Authorization', `Bearer ${token}`);
    // Query the database to get the actual label
    const actualLabel = await TemperatureLabel.findOne({
      where: {
        min_temperature: { [Sequelize.Op.lte]: 50 },
        max_temperature: { [Sequelize.Op.gte]: 50 },
      },
    });

    // Expect the response to contain the correct label
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      temperature: 50,
      label: actualLabel.label, // Compare with the actual label from the database
    });
  });
});

module.exports = app;

