const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@data": path.resolve(__dirname, "src/data"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@containers": path.resolve(__dirname, "src/containers"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
    },
  },
};
