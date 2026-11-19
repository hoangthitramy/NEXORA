import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EXITCONTROL API Documentation',
      version: '1.0.0',
      description: 'REST API documentation for EXITCONTROL - Hệ thống kiểm soát bàn giao khi nghỉ việc',
      contact: {
        name: 'Nexora Engineering Team',
        email: 'admin@exitcontrol.vn',
      },
    },
    servers: [
      {
        url: 'http://localhost:5050/api/v1',
        description: 'Local Development Server',
      },
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
