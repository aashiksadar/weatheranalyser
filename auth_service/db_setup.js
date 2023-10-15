const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const { DB_NAME, DB_USER, DB_PASSWORD } = process.env;

// Database connection configuration
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: 'localhost', // Change this to your PostgreSQL host
  port: 5434, // Change this to your PostgreSQL port
  dialect: 'postgres',
});

// Function to create the database and user if they don't exist
async function createDatabaseAndUser() {
  try {
    // Check if the database already exists
    const dbExists = await sequelize.query(`SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`);
      console.log({dbExists})

    if (!dbExists[0].length) {
      // Create the database if it doesn't exist
      await sequelize.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`Database '${DB_NAME}' created.`);
    } else {
      console.log(`Database '${DB_NAME}' already exists.`);
    }

    // Check if the user already exists
    const userExists = await sequelize.query(`SELECT 1 FROM pg_user WHERE usename = '${DB_USER}'`);

    if (!userExists[0].length) {
      // Create the user if it doesn't exist
      await sequelize.query(`CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}'`);
      console.log(`User '${DB_USER}' created.`);
    } else {
      console.log(`User '${DB_USER}' already exists.`);
    }

    // Grant privileges to the user
    await sequelize.query(`GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER}`);
    console.log(`Privileges granted to '${DB_USER}' on database '${DB_NAME}'.`);
  } catch (error) {
    console.error(`Error creating database and user: ${error.message}`);
  } finally {
    sequelize.close(); // Close the database connection
  }
}

// Call the function to create the database and user
createDatabaseAndUser();

