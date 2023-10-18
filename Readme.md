Forgive me for using PostgreSQL. I had PGSQL in my system and did not have the time to install and configure MySQL, as I am travelling.

This is a monorepo with 3 microservices.
1. auth_service for authentication => token generation and validation.
    to run => execute the following commands from /auth_service folder
    npm install
    node auth_service.js

    to run => execute npm test /auth_service folder

3. weather_service for integration with Open Weather.
    to run execute the following commands from /weather_service folder
    npm install
    node weather_service.js

   to run => execute npm test /weather_service folder

5. frontend is the Angular app
    angular cli is required to run
    to run execute the following commands from /frontend/weather-app
    ng serve

Use the .env file to update DB credentials
// I generally do not commit the .env files but for the purpose of this test it is fine i believe

if CREATE_SAMPLE_USERS is set to true, it will create two sample users in the DB

