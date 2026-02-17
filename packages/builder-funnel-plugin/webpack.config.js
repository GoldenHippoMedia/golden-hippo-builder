const path = require('path');

module.exports = {
  entry: `./src/plugin.ts`,
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    '@emotion/core': '@emotion/core',
    '@emotion/styled': '@emotion/styled',
    '@builder.io/react': '@builder.io/react',
    '@builder.io/sdk': '@builder.io/sdk',
    '@builder.io/app-context': '@builder.io/app-context',
    '@material-ui/core': '@material-ui/core',
    '@material-ui/icons': '@material-ui/icons',
    mobx: 'mobx',
    'mobx-state-tree': 'mobx-state-tree',
    'mobx-react': 'mobx-react',
  },
  output: {
    filename: 'plugin.system.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'system',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@goldenhippo/builder-funnel-schemas': path.resolve(__dirname, '../builder-funnel-schemas/src/index.ts'),
      '@goldenhippo/builder-ui': path.resolve(__dirname, '../builder-ui/src/index.ts'),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  devServer: {
    compress: true,
    port: 1269,
    static: {
      directory: path.join(__dirname, './dist'),
    },
    headers: {
      'Access-Control-Allow-Private-Network': 'true',
      'Access-Control-Allow-Origin': '*',
    },
  },
  performance: {
    maxAssetSize: 1000000,
    maxEntrypointSize: 1000000,
    hints: 'warning',
  },
};
