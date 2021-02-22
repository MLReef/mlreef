// Explore bundle size for SEO purposes
// usage: node bin/analize-bundle.js or npm run analize-bundle (then wait about 5 minutes)
// Browser will open if not open http://127.0.0.1:8888

process.env.NODE_ENV = 'production';
// eslint-disable-next-line
const webpack = require('webpack');
// eslint-disable-next-line
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpackConfigProd = require('react-scripts/config/webpack.config')('production');

webpackConfigProd.plugins.push(new BundleAnalyzerPlugin());

// actually running compilation and waiting for plugin to start explorer
webpack(webpackConfigProd, (err, stats) => {
  if (err || stats.hasErrors()) {
    // eslint-disable-next-line
    console.error(err);
  }
});
