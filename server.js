const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Custom middleware to dynamically inject GEMINI_API_KEY into users responses
server.use((req, res, next) => {
  if (req.method === 'GET' && req.url.startsWith('/users')) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      const originalSend = res.send;
      res.send = function (string) {
        try {
          const body = JSON.parse(string);
          if (Array.isArray(body)) {
            body.forEach(u => {
              if (!u.geminiApiKey) u.geminiApiKey = apiKey;
            });
          } else if (body && typeof body === 'object') {
            if (!body.geminiApiKey) body.geminiApiKey = apiKey;
          }
          return originalSend.call(this, JSON.stringify(body));
        } catch (e) {
          return originalSend.call(this, string);
        }
      };
    }
  }
  next();
});

server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
