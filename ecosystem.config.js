module.exports = {
  apps: [
    {
      name: "sawastay-dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        PORT: 3001,
        NODE_ENV: "production"
      }
    }
  ]
};
