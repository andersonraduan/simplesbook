# 🚀 Deploy Rápido - SimplesBook

Resumo executivo para deploy via FTP. **Leia o DEPLOYMENT.md completo para detalhes**.

## ✅ Checklist Rápido

### 1. Build Local (5 min)
```bash
npm install
npm run db:generate
npm run build
```

### 2. Arquivos para Enviar via FTP
```
✓ .next/                 # Build completo
✓ prisma/                # Schema e migrations
✓ public/                # Assets
✓ src/                   # Código-fonte
✓ node_modules/          # Ou instalar no servidor
✓ package.json
✓ package-lock.json
✓ next.config.ts
✓ tsconfig.json
✓ ecosystem.config.js
✓ cron-scheduler.js
✓ .env.production        # Renomear para .env
```

### 3. No Servidor (10 min)
```bash
# Conectar via SSH
ssh usuario@seuservidor.com

# Ir para pasta da app
cd ~/simplesbook

# Instalar dependências
npm install --production

# Configurar banco
npx prisma migrate deploy
npm run db:seed

# Instalar PM2
npm install -g pm2

# Iniciar app
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. Configurar CRON (2 min)
```bash
crontab -e
```
Adicionar:
```
*/10 * * * * cd ~/simplesbook && node cron-scheduler.js >> ~/simplesbook/logs/cron.log 2>&1
```

### 5. Variáveis de Ambiente Essenciais
Arquivo `.env` no servidor:
```env
DATABASE_URL="mysql://user:pass@localhost:3306/db"
NEXTAUTH_SECRET="gere-com: openssl rand -base64 32"
NEXTAUTH_URL="https://seudominio.com"
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+5511999999999"
NODE_ENV="production"
```

### 6. Configurar Proxy (Apache/Nginx)

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

**Nginx:**
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
}
```

### 7. Verificar
```bash
pm2 status
pm2 logs simplesbook
curl http://localhost:3000
```

Acesse: `https://seudominio.com`

## 🔧 Comandos Úteis

```bash
# Ver logs
pm2 logs simplesbook

# Reiniciar
pm2 restart simplesbook

# Parar
pm2 stop simplesbook

# Status
pm2 status

# Monitorar recursos
pm2 monit
```

## ⚠️ Problemas Comuns

**App não inicia:**
```bash
pm2 logs simplesbook  # Ver erro
pm2 restart simplesbook
```

**Erro no banco:**
```bash
# Testar conexão
mysql -u usuario -p -h localhost nome_banco
```

**Porta 3000 ocupada:**
```bash
netstat -tulpn | grep 3000
kill -9 $(lsof -t -i:3000)
```

---

**Tempo total estimado:** 20-30 minutos

Para instruções detalhadas, veja: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

