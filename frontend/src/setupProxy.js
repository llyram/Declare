const createProxyMiddleware = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    createProxyMiddleware('/socket.io', {
      target: 'ws://localhost:4000',
      changeOrigin: true,
      ws: true, // enable websocket proxy
      logLevel: 'debug',
    })
  );
};