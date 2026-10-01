// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const cookieParser = require('cookie-parser');
// const path = require('path');
// const swaggerUi = require('swagger-ui-express');
// const YAML = require('yamljs');

// const routes = require('./routes');
// const { notFound, errorHandler } = require('./middlewares/error.middleware');
// const { NODE_ENV } = require('./config/env');

// const app = express();

// // CORS configuration
// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     // Allow specific origins (add your frontend URLs here)
//     const allowedOrigins = [
//       'http://localhost:3000',
//       'http://localhost:5173',
//       'http://192.168.1.50:3000',
//       'http://192.168.1.50:5173',
//       // Add production domains here
//     ];
    
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200
// };

// // Security and middleware - APPLY CORS FIRST
// app.use(helmet());
// app.use(cors(corsOptions));
// app.use(express.json({ limit: '2mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Logging
// if (NODE_ENV !== 'test') {
//   app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
// }

// // Serve uploaded product images / profile photos - CORS now applies
// app.use('/uploads', (req, res, next) => {
//   // Additional CORS headers for static files
//   res.header('Cross-Origin-Resource-Policy', 'cross-origin');
//   next();
// }, express.static(path.join(__dirname, '..', 'uploads')));

// // Swagger docs at /api-docs
// try {
//   const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// } catch (err) {
//   console.warn('[app] Swagger docs not loaded:', err.message);
// }

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok', 
//     uptime: process.uptime() 
//   });
// });

// // API routes
// app.use('/api', routes);

// // Error handling - must be last
// app.use(notFound);
// app.use(errorHandler);

// module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const routes = require('./routes');
const webhookRoutes = require('./routes/webhook.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const NODE_ENV = process.env.NODE_ENV;

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow specific origins (add your frontend URLs here)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://192.168.1.50:3000',
      'http://192.168.1.50:5173',
      // Add production domains here
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Security and middleware - APPLY CORS FIRST
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Serve uploaded product images / profile photos - CORS now applies
app.use('/uploads', (req, res, next) => {
  // Additional CORS headers for static files
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// Swagger docs at /api-docs
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn('[app] Swagger docs not loaded:', err.message);
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime() 
  });
});

// Webhook routes (no authentication, public)
app.use('/webhook', webhookRoutes);

// API routes (with authentication)
app.use('/api', routes);


// Error handling - must be last
app.use(notFound);
app.use(errorHandler);

module.exports = app;