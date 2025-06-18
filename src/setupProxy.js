// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/water',
    createProxyMiddleware({
      target: 'https://apis.data.go.kr',
      changeOrigin: true,
      pathRewrite: {
        '^/api/water': '/1480523/LvlhPpnWatUsageService/getLvlhPpnWatUsageList'
      },
      logLevel: 'debug',
    })
  );
};
