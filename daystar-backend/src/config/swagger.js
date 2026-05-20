
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Daystar Daycare Center API',
      version: '1.0.0',
      description: `
        Backend System for Daystar Daycare Center Management System.
        
        Built by Tendo Calvin — Full Stack Engineer, Uganda.
        
        ## Authentication
        All endpoints except /api/auth/login require a Bearer token.
        Get your token from POST /api/auth/login then click Authorize above.
        
        ## Roles
        - **Manager** — full access to all endpoints
        - **Babysitter** — limited access (attendance, incidents, notifications)
        
        ## Test Accounts
        - manager@daystar.ug / password123
        - grace@daystar.ug / password123
      `,
      contact: {
        name: 'Tendo Calvin',
        url: 'https://github.com/tendocalvin1',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://daystar-api.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from POST /api/auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message here' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
          },
        },
        Child: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 1 },
            full_name:    { type: 'string', example: 'Aisha Kamara' },
            date_of_birth: { type: 'string', format: 'date', example: '2021-03-15' },
            parent_name:  { type: 'string', example: 'Fatima Kamara' },
            parent_phone: { type: 'string', example: '0701111111' },
            parent_email: { type: 'string', example: 'fatima@email.com' },
            session_type: { type: 'string', enum: ['half_day', 'full_day'] },
            special_needs: { type: 'string', nullable: true },
            is_active:    { type: 'boolean', example: true },
            age: {
              type: 'object',
              properties: {
                years:   { type: 'integer', example: 5 },
                months:  { type: 'integer', example: 2 },
                display: { type: 'string', example: '5y 2m' },
              },
            },
          },
        },
        Babysitter: {
          type: 'object',
          properties: {
            id:                { type: 'integer', example: 1 },
            first_name:        { type: 'string', example: 'Grace' },
            last_name:         { type: 'string', example: 'Nakato' },
            email:             { type: 'string', example: 'grace@email.com' },
            phone:             { type: 'string', example: '0772123456' },
            nin:               { type: 'string', example: 'CM97100200001' },
            date_of_birth:     { type: 'string', format: 'date', example: '1998-05-14' },
            next_of_kin_name:  { type: 'string', example: 'Sarah Nakato' },
            next_of_kin_phone: { type: 'string', example: '0701234567' },
            is_active:         { type: 'boolean', example: true },
            age:               { type: 'integer', example: 26 },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            id:            { type: 'integer', example: 1 },
            child_id:      { type: 'integer', example: 1 },
            babysitter_id: { type: 'integer', example: 1 },
            date:          { type: 'string', format: 'date', example: '2026-05-20' },
            session_type:  { type: 'string', enum: ['half_day', 'full_day'] },
            check_in_time: { type: 'string', example: '07:30:00' },
            check_out_time: { type: 'string', nullable: true },
            status:        { type: 'string', enum: ['present', 'absent', 'late'] },
            child_name:    { type: 'string', example: 'Aisha Kamara' },
          },
        },
        Income: {
          type: 'object',
          properties: {
            id:             { type: 'integer', example: 1 },
            child_id:       { type: 'integer', example: 1 },
            amount_ugx:     { type: 'integer', example: 25000 },
            session_type:   { type: 'string', enum: ['half_day', 'full_day'] },
            payment_date:   { type: 'string', format: 'date', example: '2026-05-20' },
            payment_method: { type: 'string', enum: ['cash', 'mobile_money'] },
            child_name:     { type: 'string', example: 'Aisha Kamara' },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 1 },
            category:     { type: 'string', enum: ['babysitter_salary', 'toys_materials', 'maintenance', 'utilities', 'other'] },
            description:  { type: 'string', example: 'UMEME electricity bill' },
            amount_ugx:   { type: 'integer', example: 85000 },
            expense_date: { type: 'string', format: 'date', example: '2026-05-20' },
          },
        },
        Incident: {
          type: 'object',
          properties: {
            id:           { type: 'integer', example: 1 },
            child_id:     { type: 'integer', example: 1 },
            babysitter_id: { type: 'integer', example: 1 },
            description:  { type: 'string', example: 'Child fell and scraped knee' },
            severity:     { type: 'string', enum: ['low', 'medium', 'high'] },
            is_resolved:  { type: 'boolean', example: false },
            child_name:   { type: 'string', example: 'Aisha Kamara' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);