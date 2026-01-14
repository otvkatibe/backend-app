import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Backend API Documentation',
            version: version,
            description: 'API documentation using OpenAPI 3.0',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local server',
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
            schemas: {
                // Auth & User Schemas
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateUserDTO: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                    },
                },
                LoginDTO: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                    },
                },

                // Wallet Schemas
                Wallet: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        currency: { type: 'string', example: 'BRL' },
                        balance: { type: 'number' },
                        userId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateWalletDTO: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string' },
                        currency: { type: 'string', default: 'BRL' },
                    },
                },
                UpdateWalletDTO: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        currency: { type: 'string' },
                    },
                },

                // Category Schemas
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        userId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateCategoryDTO: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string' },
                    },
                },

                // Transaction Schemas
                Transaction: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        amount: { type: 'number' },
                        type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                        description: { type: 'string' },
                        date: { type: 'string', format: 'date-time' },
                        walletId: { type: 'string', format: 'uuid' },
                        categoryId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                CreateTransactionDTO: {
                    type: 'object',
                    required: ['amount', 'type', 'walletId', 'categoryId', 'date'],
                    properties: {
                        amount: { type: 'number' },
                        type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                        description: { type: 'string' },
                        date: { type: 'string', format: 'date-time' },
                        walletId: { type: 'string', format: 'uuid' },
                        categoryId: { type: 'string', format: 'uuid' },
                    },
                },

                // Recurring Schemas
                RecurringTransaction: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        amount: { type: 'number' },
                        type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                        description: { type: 'string' },
                        frequency: { type: 'string' },
                        interval: { type: 'integer' },
                        startDate: { type: 'string', format: 'date-time' },
                        nextRun: { type: 'string', format: 'date-time' },
                    },
                },
                CreateRecurringTransactionDTO: {
                    type: 'object',
                    required: ['amount', 'type', 'frequency', 'interval', 'startDate'],
                    properties: {
                        amount: { type: 'number' },
                        type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                        description: { type: 'string' },
                        frequency: { type: 'string', enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] },
                        interval: { type: 'integer' },
                        startDate: { type: 'string', format: 'date-time' },
                    },
                },

                // Budget Schemas
                Budget: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        month: { type: 'integer' },
                        year: { type: 'integer' },
                        amount: { type: 'number' },
                        userId: { type: 'string', format: 'uuid' },
                        categoryId: { type: 'string', format: 'uuid' },
                    },
                },
                UpsertBudgetDTO: {
                    type: 'object',
                    required: ['month', 'year', 'amount', 'categoryId'],
                    properties: {
                        month: { type: 'integer' },
                        year: { type: 'integer' },
                        amount: { type: 'number' },
                        categoryId: { type: 'string', format: 'uuid' },
                    },
                },

                // Goal Schemas
                Goal: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        targetAmount: { type: 'number' },
                        currentAmount: { type: 'number' },
                        deadline: { type: 'string', format: 'date-time' },
                        userId: { type: 'string', format: 'uuid' },
                    },
                },
                CreateGoalDTO: {
                    type: 'object',
                    required: ['name', 'targetAmount', 'deadline'],
                    properties: {
                        name: { type: 'string' },
                        targetAmount: { type: 'number' },
                        deadline: { type: 'string', format: 'date-time' },
                    },
                },
                AddFundsDTO: {
                    type: 'object',
                    required: ['amount'],
                    properties: {
                        amount: { type: 'number' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
