module.exports = {
  apps: [
    {
      name: "sawastay-dashboard",
      script: "npm",
      args: "start",
      env: {
        PORT: 3001,
        NODE_ENV: "production"
      }
    }
  ]
};
