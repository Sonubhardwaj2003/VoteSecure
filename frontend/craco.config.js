// face-api.js has a Node.js-only code path (guarded, never actually runs in
// the browser) that references the "fs" core module. Webpack 5 (used by
// CRA 5 / react-scripts) no longer auto-polyfills Node core modules, which
// prints a harmless but noisy "Module not found: Can't resolve 'fs'"
// warning. We just tell webpack to treat it as unavailable in the browser
// bundle instead of trying to resolve it.
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
      };
      return webpackConfig;
    },
  },
};
