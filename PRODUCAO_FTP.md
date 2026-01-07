# 🚀 SimplesBook - Deploy em Produção via FTP

## 📚 Documentação Criada

Toda a documentação necessária para colocar o SimplesBook em produção foi preparada:

### Documentos Principais

1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** 📖
   - Guia completo e detalhado de deployment
   - Passo a passo desde o build até a configuração final
   - Inclui troubleshooting e manutenção
   - **LEIA ESTE PRIMEIRO!**

2. **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** ⚡
   - Checklist rápido para deploy
   - Comandos essenciais
   - Solução de problemas comuns
   - Tempo estimado: 20-30 min

### Arquivos de Configuração Criados

3. **env.example** 🔐
   - Template de variáveis de ambiente
   - Copie para `.env` e preencha com seus dados
   - Inclui todas as variáveis necessárias

4. **ecosystem.config.js** 🔄
   - Configuração do PM2 (gerenciador de processos)
   - Mantém a aplicação rodando 24/7
   - Auto-restart em caso de crash

5. **backup.sh** 💾
   - Script de backup automático
   - Backup de banco de dados e arquivos
   - Limpeza automática de backups antigos

6. **prepare-deploy.js** 📦
   - Script para preparar arquivos para FTP
   - Cria pacote comprimido com tudo necessário
   - Execute: `npm run prepare-deploy`

7. **.htaccess.example** 🌐
   - Configuração para Apache
   - Proxy reverso para aplicação Node.js
   - Headers de segurança

8. **nginx.conf.example** 🔧
   - Configuração para Nginx
   - SSL/HTTPS configurado
   - Otimizações de cache

9. **next.config.ts** (atualizado) ⚙️
   - Configurações de produção
   - Headers de segurança
   - Otimizações de build e imagens

10. **.gitignore** (atualizado) 🚫
    - Ignora arquivos sensíveis
    - Previne commit de .env
    - Exclui logs e builds

---

## 🎯 Como Proceder

### Opção 1: Deploy Manual (Recomendado para primeira vez)

Siga o **[DEPLOYMENT.md](./DEPLOYMENT.md)** passo a passo.

### Opção 2: Deploy Rápido (Para quem tem experiência)

```bash
# 1. Preparar arquivos
npm run deploy:prod

# 2. Enviar via FTP
# Use seu cliente FTP e envie tudo para o servidor

# 3. No servidor (via SSH)
npm install --production
npx prisma migrate deploy
npm run db:seed
pm2 start ecosystem.config.js
pm2 save

# 4. Configurar CRON
crontab -e
# Adicionar: */10 * * * * cd ~/simplesbook && node cron-scheduler.js >> ~/simplesbook/logs/cron.log 2>&1
```

---

## 📋 Requisitos do Servidor

### Mínimos
- **Node.js**: 18.x ou superior
- **MySQL**: 5.7 ou superior
- **RAM**: 512 MB
- **Disco**: 2 GB
- **Acesso**: SSH + FTP

### Recomendados
- **Node.js**: 20.x LTS
- **MySQL**: 8.0
- **RAM**: 1 GB
- **Disco**: 5 GB
- **SSL**: Certificado válido (Let's Encrypt)

---

## 🔑 Variáveis de Ambiente Essenciais

Antes de fazer o deploy, você precisa configurar:

```env
# Banco de dados (solicite na sua hospedagem)
DATABASE_URL="mysql://usuario:senha@localhost:3306/banco"

# Secret de autenticação (gere um novo)
NEXTAUTH_SECRET="cole-aqui-o-resultado-de: openssl rand -base64 32"

# URL da sua aplicação
NEXTAUTH_URL="https://seudominio.com"

# Twilio (para notificações)
TWILIO_ACCOUNT_SID="obtenha-em: twilio.com"
TWILIO_AUTH_TOKEN="obtenha-em: twilio.com"
TWILIO_PHONE_NUMBER="+5511999999999"
```

---

## 📦 O que será enviado via FTP

```
simplesbook/
├── .next/                    # Build compilado
├── prisma/                   # Schema + Migrations
├── public/                   # Assets estáticos
├── src/                      # Código-fonte
├── node_modules/             # Dependências (ou instalar no servidor)
├── logs/                     # Pasta de logs (criar)
├── .env                      # Variáveis de ambiente
├── ecosystem.config.js       # Config PM2
├── cron-scheduler.js         # CRON de notificações
├── package.json
├── package-lock.json
├── next.config.ts
└── tsconfig.json
```

**Tamanho estimado**: 150-300 MB (dependendo de node_modules)

---

## ⚡ Comandos Rápidos

### Preparar Deploy
```bash
npm run deploy:prod
```

### No Servidor
```bash
# Status da aplicação
pm2 status

# Ver logs
pm2 logs simplesbook

# Reiniciar
pm2 restart simplesbook

# Parar
pm2 stop simplesbook

# Monitorar recursos
pm2 monit
```

### Banco de Dados
```bash
# Rodar migrations
npx prisma migrate deploy

# Seed (dados iniciais)
npm run db:seed

# Verificar conexão
npx prisma db pull
```

### Backup
```bash
# Fazer backup manual
bash backup.sh

# Agendar backup automático (diariamente às 3h)
crontab -e
# Adicionar: 0 3 * * * ~/simplesbook/backup.sh
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] `.env` com permissões restritas (chmod 600)
- [ ] NEXTAUTH_SECRET único e forte (32+ caracteres)
- [ ] SSL/HTTPS configurado
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] MySQL acessível apenas via localhost
- [ ] Backups automáticos configurados
- [ ] Logs sendo monitorados
- [ ] PM2 configurado para iniciar no boot

### Comandos de Segurança
```bash
# Proteger .env
chmod 600 .env

# Verificar portas abertas
netstat -tulpn

# Ver tentativas de acesso SSH
tail -f /var/log/auth.log
```

---

## 🐛 Problemas Comuns

### Aplicação não inicia
```bash
# Ver erro
pm2 logs simplesbook --lines 100

# Verificar porta
netstat -tulpn | grep 3000

# Matar processo
kill -9 $(lsof -t -i:3000)

# Reiniciar
pm2 restart simplesbook
```

### Erro no banco de dados
```bash
# Testar conexão
mysql -u usuario -p -h localhost nome_banco

# Ver tabelas
npx prisma studio
```

### Notificações não enviam
```bash
# Testar CRON manualmente
node cron-scheduler.js

# Ver logs do CRON
tail -f logs/cron.log

# Verificar agendamento
crontab -l
```

### Build muito grande
```bash
# Limpar node_modules
rm -rf node_modules
npm install --production

# Limpar cache do Next
rm -rf .next/cache
```

---

## 📊 Monitoramento

### Logs Importantes
```bash
# Logs da aplicação
pm2 logs simplesbook

# Logs do CRON
tail -f logs/cron.log

# Logs do PM2
tail -f logs/pm2-error.log
tail -f logs/pm2-out.log

# Logs do Nginx (se usar)
tail -f /var/log/nginx/simplesbook-error.log

# Logs do Apache (se usar)
tail -f /var/log/apache2/error.log
```

### Métricas
```bash
# Uso de recursos
pm2 monit

# Uso de disco
df -h

# Uso de memória
free -h

# Processos
top
htop
```

---

## 🔄 Atualizações Futuras

### Processo de Atualização
```bash
# 1. Fazer backup
bash backup.sh

# 2. Parar aplicação
pm2 stop simplesbook

# 3. Fazer upload dos novos arquivos via FTP

# 4. Instalar novas dependências
npm install --production

# 5. Rodar migrations
npx prisma migrate deploy

# 6. Reiniciar
pm2 restart simplesbook

# 7. Verificar
pm2 logs simplesbook
```

---

## 📞 Suporte

### Onde Buscar Ajuda

1. **Documentação Next.js**: https://nextjs.org/docs
2. **Documentação Prisma**: https://www.prisma.io/docs
3. **Documentação PM2**: https://pm2.keymetrics.io/docs
4. **Documentação Twilio**: https://www.twilio.com/docs

### Logs para Diagnosticar Problemas

Sempre verifique nesta ordem:
1. `pm2 logs simplesbook` - Logs da aplicação
2. `logs/cron.log` - Logs do CRON
3. Logs do servidor web (Apache/Nginx)
4. `mysql error log` - Logs do MySQL

---

## ✅ Checklist Final

Antes de considerar o deploy concluído:

- [ ] Build executado com sucesso (`npm run build`)
- [ ] Arquivos enviados via FTP
- [ ] `.env` configurado com todas as variáveis
- [ ] Banco de dados criado
- [ ] Migrations executadas (`prisma migrate deploy`)
- [ ] Seed executado (`npm run db:seed`)
- [ ] PM2 instalado e configurado
- [ ] Aplicação rodando (`pm2 status`)
- [ ] CRON configurado para notificações
- [ ] Proxy reverso configurado (Apache/Nginx)
- [ ] SSL/HTTPS ativado
- [ ] Acesso ao site funcionando
- [ ] Login testado
- [ ] Criação de agendamento testado
- [ ] Notificações testadas
- [ ] Backup automático configurado
- [ ] Monitoramento configurado

---

## 🎉 Pronto para Produção!

Após seguir todos os passos, sua aplicação estará:
- ✅ Rodando 24/7
- ✅ Com SSL/HTTPS
- ✅ Com backups automáticos
- ✅ Com monitoramento
- ✅ Com notificações funcionando
- ✅ Pronta para escalar

**Tempo estimado total**: 30-60 minutos (primeira vez)

---

**Data de criação**: Janeiro 2026  
**Versão**: 1.0.0  
**Status**: Pronto para produção ✅

