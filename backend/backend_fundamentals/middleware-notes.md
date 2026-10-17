# Express Middleware — Interview Notes

## 1. What is middleware?

Middleware is a function that runs during an Express request-response cycle. It can:

1. Run logic (logging, authentication, validation, etc.).
2. Read or modify the request (`req`) and response (`res`).
3. End the cycle by sending a response.
4. Pass control to the next middleware with `next()`.
5. Pass an error to error-handling middleware with `next(error)`.

The usual middleware signature is:

```js
function middleware(req, res, next) {
  // Do work, respond, or call next().
}
```

Middleware runs in the order in which it is registered. For each request, Express moves through matching middleware and routes until something sends a response or an error is passed to an error handler.

## 2. The three important outcomes

### Continue normally

```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
```

`next()` tells Express to continue to the next matching middleware or route. If it is omitted and no response is sent, the request hangs.

### End the response

```js
app.use((req, res) => {
  res.status(200).send('Request handled');
});
```

Once a response has been sent, do not call `next()` as if the response were still open. Sending a response does not automatically call the next middleware.

### Pass an error

```js
app.use((req, res, next) => {
  const error = new Error('Something went wrong');
  next(error);
});
```

`next(error)` skips regular middleware and routes and looks for error-handling middleware.

## 3. Middleware types

### Application-level middleware

Registered on the Express `app` with `app.use()` or an HTTP method such as `app.get()`.

```js
app.use((req, res, next) => {
  next();
});

app.use('/admin', (req, res, next) => {
  next();
});
```

`app.use('/admin', ...)` applies to matching paths beginning with `/admin`, such as `/admin` and `/admin/users`.

### Router-level middleware

Registered on an `express.Router()`. Routers let an application group related routes and middleware.

```js
const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  console.log('Products router');
  next();
});

router.get('/', (req, res) => {
  res.send('Products');
});

app.use('/products', router);
```

The router's `/` route is reached at `/products`.

### Built-in middleware

Express includes common middleware:

```js
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form URL-encoded bodies
app.use(express.static('public')); // Serve static files
```

Body parsers only parse matching content types. For example, `express.json()` populates `req.body` for JSON requests. Register parsers before the routes that use the parsed body. Treat all client-provided values, including `req.body`, as untrusted and validate them.

### Third-party middleware

Packages can provide middleware, for example request logging, cookie parsing, security headers, or CORS handling. Install and configure only what the application needs.

```js
const helmet = require('helmet');
app.use(helmet());
```

Middleware order matters: for example, CORS middleware must run before routes whose responses need CORS headers.

### Error-handling middleware

Error middleware has **four** parameters, in this order:

```js
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Request failed' });
});
```

Register it after the routes and regular middleware so it can handle errors passed from them. If headers have already been sent, a handler should delegate with `next(err)` rather than try to send a second response.

## 4. Route-specific and conditional middleware

Middleware can be applied to one route or a sequence of routes:

```js
function requireLogin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

app.get('/profile', requireLogin, (req, res) => {
  res.json({ user: req.user });
});
```

Use `return` when responding inside a conditional branch to make it clear that the handler stops there and does not continue accidentally.

`next('route')` is a special case for route callbacks: it skips the remaining callbacks for the current route and tries the next matching route. It is not the normal way to continue middleware.

## 5. Async middleware and errors

An `async` function returns a Promise. In Express 5, a rejected Promise from a route handler or middleware is forwarded to error-handling middleware. In Express 4, rejected Promises need to be caught and passed to `next(err)` (or handled by a suitable wrapper).

Express 5:

```js
app.get('/data', async (req, res) => {
  const data = await loadData();
  res.json(data);
});
```

Express 4-compatible pattern:

```js
app.get('/data', async (req, res, next) => {
  try {
    const data = await loadData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});
```

Do not both send a response and pass the same error onward. Do not call `next()` more than once for the same request path.

## 6. Registration order and practical setup

Middleware registration order is significant. A common setup is:

```js
app.use(requestLogger);
app.use(express.json());
app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
```

- Put request-wide logging and parsing before routes that need them.
- Put route-specific middleware in the route's callback list.
- A not-found handler is regular middleware at the end of the routes; it can create a 404 error or send a 404 response.
- Put error-handling middleware after routes and the not-found handler.

## 7. A simple not-found and error setup

```js
app.use((req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message
  });
});
```

In production, avoid exposing stack traces or sensitive internal error details to clients; log useful diagnostics on the server.

## 8. Applying the concepts to `05-midddleware.js`

The current application-level middleware is:

```js
app.use((req, res, next) => {
  console.log('In the middleware!');
  next();
});
```

For a `GET /` request:

1. `app.use()` matches the request.
2. The middleware logs a message.
3. `next()` passes control onward.
4. The `app.get('/', ...)` route sends `Hello from express`.
5. The response ends; no further middleware runs for that request.

If the middleware omitted `next()` and did not send a response, step 3 would never happen and the browser/client would keep waiting.

## 9. Common interview questions

### What is middleware in Express?

A function in the request-response pipeline that can run logic, access or modify `req`/`res`, end the response, continue with `next()`, or forward an error with `next(error)`.

### What happens if middleware neither responds nor calls `next()`?

The request remains pending and usually appears to hang.

### Why does middleware order matter?

Express executes matching middleware in registration order. A route cannot use parsed request data if its body parser is registered after the route. An error handler registered before a route generally cannot handle errors from that later route.

### How is error middleware different?

It has four parameters: `(err, req, res, next)`. Express routes errors to it when code calls `next(err)` or, in Express 5, when a returned Promise rejects.

### What is the difference between `app.use()` and `app.get()`?

`app.use()` mounts middleware for all HTTP methods by default and can use a path prefix. `app.get()` registers a handler for matching GET requests.

### Does `next()` send a response?

No. It only hands control to the next matching middleware or route. A later handler must send the response or continue the chain.

### Can middleware modify `req`?

Yes. For example, authentication middleware may attach a verified user to `req.user`. Downstream handlers can then use it. Only attach values derived through appropriate validation or verification.

## 10. Fast interview checklist

- Middleware signature: `(req, res, next)`.
- Error-handler signature: `(err, req, res, next)`.
- Registration order controls execution order.
- Call `next()` to continue; send a response to finish.
- If neither happens, the request hangs.
- Call `next(err)` to enter the error-handling path.
- Register body parsers before routes that read `req.body`.
- Validate and treat client input as untrusted.
- In Express 5, rejected async middleware Promises reach error handlers; Express 4 needs explicit forwarding.
- Avoid responding twice or calling `next()` twice.
