module.exports = {
  webpackDevMiddleware: config => {
    config.watchOptions.poll = 300;
    return config;
  },
  publicRuntimeConfig: {
    processEnv: process.env,
  },
};
