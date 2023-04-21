const TerserPlugin = require("terser-webpack-plugin");

module.exports = function override(config, env) {
  if (env === "production") {
    config.devtool = false;

    config.optimization.minimizer[0] = new TerserPlugin({
      terserOptions: {
        sourceMap: false,
        compress: {
          drop_console: true,
        },

        output: {
          comments: false,
        },
      },
    });
  }
  return config;
};
