const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY, DB_PORT } = process.env;

const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}`, {
  dialect: 'postgres',
  logging: true, // Enable logging
});

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

async function createSampleUsers() {
  try {
    await sequelize.sync();

    await User.bulkCreate([
      { username: 'james', password: 'bond' },
      { username: 'donald', password: 'trump' },
    ]);

    console.log('Added sample users');
  } catch (error) {
    console.error(`Error in creatingSampleUsers: ${error.message}`);
  }
}

const { CREATE_SAMPLE_USERS } = process.env;
if (CREATE_SAMPLE_USERS && !!CREATE_SAMPLE_USERS) {
  createSampleUsers();
}

app.post('/authenticate', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username, password } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Incorrect username or password' });
    }

    const accessToken = generateAccessToken(username);

    res.status(200).json({ success: true, access_token: accessToken });
  } catch (error) {
    console.error(`Error during authentication: ${error.message}`);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

// gRPC Service Implementation
const packageDefinition = protoLoader.loadSync('auth.proto');
const authServiceProto = grpc.loadPackageDefinition(packageDefinition).auth;

const server = new grpc.Server();

server.addService(authServiceProto.AuthService.service, {
  isAccessTokenValid,
});

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error('Server binding failed:', error);
  } else {
    console.log(`gRPC Server is listening on port ${port}`);
    server.start();
  }
});

function isAccessTokenValid(call, callback) {
  const { accessToken } = call.request;
  const isValid = validateAccessToken(accessToken);
  callback(null, { isValid });
}

function validateAccessToken(accessToken) {
  try {
    const decoded = jwt.verify(accessToken, SECRET_KEY);
    if (decoded.exp) {
      const currentTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      if (decoded.exp >= currentTimestamp) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function isValidUser(username, password) {
  try {
    const user = await User.findOne({ where: { username, password } });

    return !!user;
  } catch (error) {
    console.error('Error while checking user:', error);
    return false;
  }
}

function generateAccessToken(username) {
  const accessToken = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

  return accessToken;
}

app.listen(8000, () => {
  console.log('Authentication service is running on port 8000');
});

