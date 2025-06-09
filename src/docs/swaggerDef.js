const { version } = require("../../package.json");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Hotel Management",
    version,
  },
  servers: [
    {
      url: ' https://e546-116-75-242-7.ngrok-free.app/v1', 
      description: "3001 Local server",
    }, 
    {
      description: "3001 Local server",
      url: "http://localhost:3001/v1",
    },
 
    {
      description: "3000 Local server",
      url: "http://localhost:3000/v1",
    },
    {
      descrription: "Ngrok",
      url: "https://4e98-27-5-2-195.ngrok-free.app/v1"
    }
   
   
  ],
};

module.exports = swaggerDef;
