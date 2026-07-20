const express = require('express');
const cors = require('cors');

const { pool, testDatabaseConnection } = require('./config/db');
const courseRoutes = require('./routes/courseRoutes');
const courseProjectRoutes = require('./routes/courseProjectRoutes');
const projectRoutes = require('./routes/projectRoutes');
const projectTaskRoutes = require('./routes/projectTaskRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
  }),
);
app.use(express.json());

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

app.use('/api/courses', courseRoutes);
app.use('/api/courses/:course_id/projects', courseProjectRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:project_id/tasks', projectTaskRoutes);
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

    app.listen(port, () => {
      console.log(`CampusFlow API is running at http://localhost:${port}`);
      console.log('MySQL database connected successfully.');
    });
  } catch (error) {
    console.error('Unable to connect to MySQL:', error.message);
    process.exit(1);
  }
}

startServer();
