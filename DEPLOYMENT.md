# Guia de Deploy - SimplesBook em Produção via FTP

Este guia explica como fazer o deploy da aplicação SimplesBook em um servidor de hospedagem compartilhada ou VPS via FTP.

## 📋 Pré-requisitos

### No Servidor (Hospedagem)
- **Node.js**: versão 18.x ou superior
- **MySQL**: versão 5.7 ou superior
- **Acesso SSH** (recomendado) ou **Terminal/Console da hospedagem**
- **FTP/SFTP**: acesso para upload de arquivos
- **PM2 ou gerenciador de processos** (para manter a app rodando)

### No Seu Computador
- Node.js instalado
- Cliente FTP (FileZilla, WinSCP, ou similar)
- Git (opcional, para controle de versão)

---

## 🚀 Passo 1: Preparar o Build Local

### 1.1. Instalar Dependências
```bash
npm install
```

### 1.2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.production` na raiz do projeto:

```env
# Database
DATABASE_URL="mysql://seu_usuario:sua_senha@localhost:3306/seu_banco"

# NextAuth
NEXTAUTH_SECRET="cole-aqui-o-secret-gerado"
NEXTAUTH_URL="https://seudominio.com"

# Twilio
TWILIO_ACCOUNT_SID="seu_account_sid"
TWILIO_AUTH_TOKEN="seu_auth_token"
TWILIO_PHONE_NUMBER="+5511999999999"
TWILIO_WHATSAPP_NUMBER="whatsapp:+5511999999999"

# App Config
NEXT_PUBLIC_APP_NAME="SimplesBook"
NEXT_PUBLIC_APP_URL="https://seudominio.com"

# Node Environment
NODE_ENV="production"
```

**IMPORTANTE**: Gere um secret seguro para NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 1.3. Gerar Cliente Prisma
```bash
npm run db:generate
```

### 1.4. Build da Aplicação
```bash
npm run build
```

Isso vai gerar a pasta `.next` com a aplicação compilada.

---

## 📦 Passo 2: Preparar Arquivos para Upload

### 2.1. Arquivos/Pastas Necessários
Você precisa enviar via FTP:

```
simplesbook/
├── .next/                    # Build gerado
├── node_modules/             # Dependências (ou instalar no servidor)
├── prisma/                   # Schema e migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                   # Arquivos estáticos
├── src/                      # Código-fonte (opcional, mas recomendado)
├── .env.production           # Renomear para .env no servidor
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── cron-scheduler.js         # Script CRON
└── ecosystem.config.js       # Novo arquivo (criar abaixo)
```

### 2.2. Criar arquivo de configuração PM2
Crie o arquivo `ecosystem.config.js` na raiz:

```javascript
module.exports = {
  apps: [{
    name: 'simplesbook',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 2.3. O que NÃO enviar
Não envie essas pastas/arquivos:
- `node_modules/` (instale direto no servidor se possível)
- `.git/`
- `.next/cache/` (limpa antes do upload)
- Arquivos `.env.local` ou similares de dev

---

## 🌐 Passo 3: Configurar o Servidor

### 3.1. Conectar via SSH
```bash
ssh usuario@seudominio.com
```

### 3.2. Criar Diretório da Aplicação
```bash
mkdir -p ~/simplesbook
cd ~/simplesbook
```

### 3.3. Upload via FTP
Use seu cliente FTP preferido:
- **Host**: ftp.seudominio.com (ou IP do servidor)
- **Usuário**: seu_usuario_ftp
- **Senha**: sua_senha_ftp
- **Porta**: 21 (FTP) ou 22 (SFTP)

Envie todos os arquivos listados no item 2.1 para a pasta `~/simplesbook`.

**DICA**: Comprima os arquivos antes de enviar:
```bash
# No seu computador
tar -czf simplesbook.tar.gz .next prisma public src package.json package-lock.json next.config.ts tsconfig.json cron-scheduler.js ecosystem.config.js .env.production
```

Depois, no servidor:
```bash
# No servidor
tar -xzf simplesbook.tar.gz
mv .env.production .env
```

---

## 🔧 Passo 4: Configurar Banco de Dados

### 4.1. Criar Banco MySQL
Acesse o painel da sua hospedagem (cPanel, Plesk, etc) e:
1. Crie um banco de dados MySQL
2. Crie um usuário e vincule ao banco
3. Anote: nome do banco, usuário, senha e host

### 4.2. Atualizar DATABASE_URL
Edite o arquivo `.env` no servidor:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_banco"
```

### 4.3. Rodar Migrations
```bash
cd ~/simplesbook
npx prisma migrate deploy
```

### 4.4. Seed (Dados Iniciais)
```bash
npm run db:seed
```

---

## 🚀 Passo 5: Instalar e Iniciar a Aplicação

### 5.1. Instalar Dependências no Servidor
```bash
cd ~/simplesbook
npm install --production
```

### 5.2. Instalar PM2 (Process Manager)
```bash
npm install -g pm2
```

### 5.3. Iniciar Aplicação
```bash
pm2 start ecosystem.config.js
```

### 5.4. Configurar PM2 para Iniciar no Boot
```bash
pm2 startup
pm2 save
```

### 5.5. Verificar Status
```bash
pm2 status
pm2 logs simplesbook
```

---

## ⏰ Passo 6: Configurar CRON para Notificações

### 6.1. Método 1: CRON do Sistema (Recomendado)

Edite o crontab:
```bash
crontab -e
```

Adicione a linha (executa a cada 10 minutos):
```cron
*/10 * * * * cd ~/simplesbook && node cron-scheduler.js >> ~/simplesbook/logs/cron.log 2>&1
```

### 6.2. Método 2: CRON via cPanel/Hospedagem

Se sua hospedagem tem painel de CRON:
1. Acesse a seção "Tarefas Cron" ou "CRON Jobs"
2. Adicione novo CRON:
   - **Intervalo**: A cada 10 minutos (`*/10 * * * *`)
   - **Comando**: `/usr/bin/node ~/simplesbook/cron-scheduler.js`

### 6.3. Criar Pasta de Logs
```bash
mkdir -p ~/simplesbook/logs
```

### 6.4. Testar CRON Manualmente
```bash
cd ~/simplesbook
node cron-scheduler.js
```

---

## 🌍 Passo 7: Configurar Proxy Reverso (Apache/Nginx)

### 7.1. Se usar Apache (cPanel geralmente usa)

Crie/edite o arquivo `.htaccess` na raiz do domínio:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

Ou configure um Virtual Host:
```apache
<VirtualHost *:80>
    ServerName seudominio.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

### 7.2. Se usar Nginx

```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Reinicie o servidor:
```bash
sudo systemctl restart nginx
```

---

## 🔒 Passo 8: Configurar SSL (HTTPS)

### 8.1. Via cPanel/Let's Encrypt
Muitas hospedagens oferecem SSL gratuito via Let's Encrypt no painel de controle.

### 8.2. Via Certbot (Manual)
```bash
sudo apt install certbot
sudo certbot --nginx -d seudominio.com
```

### 8.3. Atualizar NEXTAUTH_URL
Após ativar SSL, edite `.env`:
```env
NEXTAUTH_URL="https://seudominio.com"
```

Reinicie a aplicação:
```bash
pm2 restart simplesbook
```

---

## 🔍 Passo 9: Verificação e Testes

### 9.1. Testar Acesso
Acesse: `https://seudominio.com`

### 9.2. Testar Login
Use as credenciais criadas no seed ou crie um usuário admin.

### 9.3. Verificar Logs
```bash
pm2 logs simplesbook
tail -f ~/simplesbook/logs/cron.log
```

### 9.4. Verificar Processos
```bash
pm2 status
pm2 monit
```

### 9.5. Testar Notificações
Crie um agendamento e verifique se as notificações estão sendo processadas.

---

## 🛠️ Manutenção e Atualizações

### Atualizar Aplicação
```bash
# No servidor
cd ~/simplesbook
pm2 stop simplesbook

# Fazer backup do banco
mysqldump -u usuario -p nome_banco > backup_$(date +%Y%m%d).sql

# Upload dos novos arquivos via FTP
# Ou pull do Git se usar

npm install --production
npx prisma migrate deploy
pm2 restart simplesbook
```

### Monitoramento
```bash
# Ver logs em tempo real
pm2 logs simplesbook --lines 200

# Ver uso de recursos
pm2 monit

# Reiniciar se necessário
pm2 restart simplesbook

# Recarregar após mudanças de código
pm2 reload simplesbook
```

### Backup Automático (Recomendado)
Crie um script `backup.sh`:
```bash
#!/bin/bash
DATA=$(date +%Y%m%d_%H%M%S)
mysqldump -u usuario -p'senha' nome_banco > ~/backups/db_$DATA.sql
tar -czf ~/backups/files_$DATA.tar.gz ~/simplesbook/.next ~/simplesbook/prisma
find ~/backups -mtime +7 -delete  # Remove backups com mais de 7 dias
```

Adicione ao crontab (executa diariamente às 3h):
```cron
0 3 * * * ~/backup.sh
```

---

## ⚠️ Problemas Comuns

### App não inicia
```bash
# Verificar porta em uso
netstat -tulpn | grep 3000

# Matar processo na porta
kill -9 $(lsof -t -i:3000)

# Reiniciar
pm2 restart simplesbook
```

### Erro de conexão com banco
- Verifique `DATABASE_URL` no `.env`
- Teste conexão: `mysql -u usuario -p -h localhost nome_banco`
- Verifique se o usuário tem permissões

### Notificações não enviam
- Verifique credenciais Twilio no `.env`
- Teste o CRON manualmente: `node cron-scheduler.js`
- Verifique logs: `tail -f ~/simplesbook/logs/cron.log`

### Build muito grande
- Remova devDependencies: `npm prune --production`
- Limpe cache: `rm -rf .next/cache`

---

## 📊 Checklist Final

- [ ] Build local concluído com sucesso
- [ ] Arquivos enviados via FTP
- [ ] `.env` configurado no servidor
- [ ] Banco de dados criado e configurado
- [ ] Migrations executadas (`prisma migrate deploy`)
- [ ] Seed executado (dados iniciais)
- [ ] Dependências instaladas no servidor
- [ ] PM2 instalado e configurado
- [ ] Aplicação iniciada e rodando
- [ ] CRON configurado para notificações
- [ ] Proxy reverso configurado (Apache/Nginx)
- [ ] SSL configurado (HTTPS)
- [ ] Testes de acesso e login realizados
- [ ] Logs sendo gerados corretamente
- [ ] Backup configurado

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `pm2 logs simplesbook`
2. Verifique status: `pm2 status`
3. Teste conexão banco: `npx prisma db pull`
4. Reinicie: `pm2 restart simplesbook`

---

**Última atualização**: Janeiro 2026

