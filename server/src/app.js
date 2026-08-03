const express = require('express');
const cors = require('cors');

const { pool, testDatabaseConnection } = require('./config/db');
const { getEnvironment } = require('./config/environment');
const { createSessionMiddleware } = require('./config/session');
const authRoutes = require('./routes/authRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const exportRoutes = require('./routes/exportRoutes');
const courseRoutes = require('./routes/courseRoutes');
const courseProjectRoutes = require('./routes/courseProjectRoutes');
const projectRoutes = require('./routes/projectRoutes');
const projectTaskRoutes = require('./routes/projectTaskRoutes');
const searchRoutes = require('./routes/searchRoutes');
const taskRoutes = require('./routes/taskRoutes');
const requireAuth = require('./middleware/requireAuth');

const app = express();
const environment = getEnvironment();
const port = environment.port;
let server;

if (environment.isProduction) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

app.use((request, response, next) => {
  response.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  next();
});

app.use(
  cors({
    origin: environment.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '32kb' }));
app.use(createSessionMiddleware());

app.get('/api/health', async (request, response) => {
  try {
    await pool.query('SELECT 1');

    return response.status(200).json({
      data: {
        status: 'ok',
        database: 'connected',
      },
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);

    return response.status(500).json({
      message: 'Database connection failed.',
    });
  }
});

app.use('/api/auth', authRoutes);

app.use(requireAuth);
app.use('/api/calendar', calendarRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:course_id/projects', courseProjectRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:project_id/tasks', projectTaskRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/tasks', taskRoutes);

app.use((request, response) => {
  return response.status(404).json({
    message: 'Endpoint not found.',
  });
});

app.use((error, request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({
      message: 'Invalid JSON body.',
    });
  }

  console.error('Unexpected server error:', error);

  return response.status(500).json({
    message: 'Internal server error.',
  });
});

async function startServer() {
  try {
    await testDatabaseConnection();

    server = app.listen(port, () => {
      console.log(`CampusFlow API is running at http://localhost:${port}`);
      console.log('MySQL database connected successfully.');
    });
  } catch (error) {
    console.error('Unable to connect to MySQL:', error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Closing CampusFlow API...`);

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await pool.end();
}

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => {
    shutdown(signal)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Graceful shutdown failed:', error.message);
        process.exit(1);
      });
  });
}

startServer();
