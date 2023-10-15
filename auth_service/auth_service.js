const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
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
const {CREATE_SAMPLE_USERS} = process.env;
if(CREATE_SAMPLE_USERS) {
    createSampleUsers();
}

const secretKey = SECRET_KEY;

app.post('/authenticate', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username, password } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Incorrect username or password' });
    }

    const accessToken = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ success: true, access_token: accessToken });
  } catch (error) {
    console.error(`Error during authentication: ${error.message}`);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
});

app.listen(8000, () => {
  console.log('Authentication service is running on port 8000');
});

