const express = require('express');

const app = express();
const productsRouter = express.Router();

// Application-level middleware: runs for every request and then continues.
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Built-in middleware: parses JSON bodies and makes them available as req.body.
app.use(express.json());

// Middleware can add values to req for later middleware and route handlers.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res.send('Hello from Express');
});

// Route-specific middleware: validate input, respond early, or continue.
function requireName(req, res, next) {
  const name = req.query.name;

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Provide a name query parameter.' });
  }

  req.name = name.trim();
  next();
}

app.get('/greet', requireName, (req, res) => {
  res.json({
    message: `Hello, ${req.name}!`,
    requestTime: req.requestTime
  });
});

app.post('/echo', (req, res) => {
  res.json({ received: req.body });
});

// Router-level middleware: runs for requests handled by this router.
productsRouter.use((req, res, next) => {
  console.log('Products router middleware');
  next();
});

productsRouter.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Example product' }]);
});

app.use('/api/products', productsRouter);

app.get('/demo-error', (req, res, next) => {
  next(new Error('This is a demonstration error.'));
});

// Not-found middleware: reached only if no earlier route handled the request.
app.use((req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Error-handling middleware must have all four parameters and come last.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
