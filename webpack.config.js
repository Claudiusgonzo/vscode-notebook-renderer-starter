const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');
const crypto = require('crypto');

const devServerPort = 8111;

module.exports = (env, argv) => ({
  mode: argv.mode,
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  entry: './src/client/index.ts',
  output: {
    // Multiple renderers might exist on the same page, so provide a random
    // jsonpFunction name--otherwise the bundles could interfere with each other.
    jsonpFunction: crypto.randomBytes(8).toString('hex'),
    path: path.join(__dirname, 'out', 'client'),
    filename: 'index.js',
    publicPath: `http://localhost:${devServerPort}/`,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  module: {
    rules: [
      // Allow importing ts(x) files:
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'src/client/tsconfig.json',
          // transpileOnly enables hot-module-replacement
          transpileOnly: true,
          compilerOptions: {
            // Overwrite the noEmit from the client's tsconfig
            noEmit: false,
          },
        },
      },
      // Allow importing CSS modules:
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    port: devServerPort,
    hot: true,
    // Set host policies, otherwise the bundle running in VS Code won't be
    // able to connect to the dev server
    allowedHosts: ['null'],
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: 'src/client/tsconfig.json',
    }),
  ],
});
