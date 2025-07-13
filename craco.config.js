const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Enable bundle analyzer in development
      if (env === 'development') {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html'
          })
        );
      }

      // Production optimizations
      if (env === 'production') {
        // Optimize Terser for better minification
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
              },
              mangle: true,
              output: {
                comments: false
              }
            },
            extractComments: false
          })
        ];

        // Add compression plugin for gzip
        webpackConfig.plugins.push(
          new CompressionPlugin({
            filename: '[path][base].gz',
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8
          })
        );

        // Split chunks for better caching
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true
            }
          }
        };
      }

      return webpackConfig;
    }
  },
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['> 1%', 'last 2 versions', 'not ie <= 11']
          },
          useBuiltIns: 'entry',
          corejs: { version: 3, proposals: true }
        }
      ]
    ],
    plugins: [
      // Remove unused imports
      ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
    ]
  }
}; 