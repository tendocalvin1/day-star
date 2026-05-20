

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Daystar Daycare API',
      version: '1.0.0',
      description: 'REST API for Daystar Daycare Center Management System',
      contact: {
        name: 'Tendo Calvin',
        url: 'https://github.com/tendocalvin1',
      },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development' },
      { url: 'https://daystar-api.onrender.com', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);