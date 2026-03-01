module.exports = {
  apps: [
    {
      name: 'warroom-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: { PORT: 3000, NODE_ENV: 'production' },
    },
    {
      name: 'warroom-backend',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: { PORT: 3001, NODE_ENV: 'production' },
    },
  ],
};
