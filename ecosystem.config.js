module.exports = {
  apps: [{
    name: 'simplesbook',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_TURBOPACK_DISABLE: '1',
      NEXT_PRIVATE_DISABLE_TURBOPACK: '1',
      // NOTA: As outras variáveis (NEXTAUTH_SECRET, DATABASE_URL, etc)
      // devem estar no arquivo .env ou .env.local
      // Nunca colocar secrets diretamente aqui!
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_TURBOPACK_DISABLE: '1',
      NEXT_PRIVATE_DISABLE_TURBOPACK: '1'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
}

