/** PM2: cd p3/backend && pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: 'p3-backend',
      cwd: __dirname,
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
