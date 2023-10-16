const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { TemperatureLabel } = require('./models');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

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
const {CREATE_SAMPLE_DATA } = process.env;

if(CREATE_SAMPLE_DATA && !!CREATE_SAMPLE_DATA) {
    insertSampleTemperatureLabels();
}


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
    const {OPEN_WEATHER_API_KEY} = process.env;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_API_KEY}&units=metric`;
      console.log(url);
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

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Weather Data Service is running on port ${PORT}`);
});

