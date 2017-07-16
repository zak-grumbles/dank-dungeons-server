# Dank Dungeons Server
Server backend for the game *Dank Dungeons* created for the Baylor University Gaming Capstone project in 2017. 

### Capstone Team
  - Juan Carlos Ramirez
  - Zachary Grumbles
  - Austin Mack
  - Dean He
  
### Requirements
* [Node.js](https://nodejs.org/en/)
* A machine running [MongoDB](https://www.mongodb.com/)
  
# Setup
There are two ways of running the server. You can either run it inside of a docker container or manually.

## Docker Container
You will need [Docker Compose](https://docs.docker.com/compose/install/) on your machine for this method to work.

#### 1. Edit the config file
1. Change the config file name from `config.json.example` to `config.json`
2. Edit the contents of the file. Assuming you didn't change anything in the docker-compose.yml file, the "host" field should be set to "mongo". You will still need to select a db name and a secret key for token verification. 
  
#### 2. Build the container
1. Simply open a terminal in the root directory and run `docker-compose build`
  
#### 3. Run the container
1. Run `docker-compose up`
  
## Manual

#### 1. Edit the config file
1. Change the config file name from `config.json.example` to `config.json`
2. Edit the contents of the file to match your setup. The fields are pretty self-explanatory.
  * db
    * host - hostname of the machine running the MongoDB instance
    * database - name of the database where game data will be stored
  * tokens
    * secret - secret key used for token verification
      
#### 2. Install packages
1. Open a terminal in the root directory and run `npm install`. This installs all of the required Node packages.

#### 3. Run the server
1. Run `node index.js`. This is assuming that your mongo instance is already up and running.
