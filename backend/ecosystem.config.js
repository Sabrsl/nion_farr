module.exports = {
  apps: [
    {
      name: 'nionfar-api',
      script: 'dist/main.js',
      instances: 'max', // Utilise le nombre de CPU disponibles
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // Configuration des logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      // Configuration du monitoring
      monitor: {
        http: true,
        http_path: '/health',
        http_port: 3001,
      },
    },
  ],
}; 