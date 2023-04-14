module.exports = function override(config, env) {
  if (env === "production") {
    config.devtool = false;
  }
  console.log(JSON.stringify(config, null, 2));
  return config;
};
