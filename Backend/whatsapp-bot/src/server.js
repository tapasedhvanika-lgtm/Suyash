const app = require('./app');
const connectDB = require('./config/db');
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Running in ${NODE_ENV} mode on port ${PORT}`);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('[Server] Unhandled Rejection:', err);
  process.exit(1);
});

start();
