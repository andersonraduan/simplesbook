# ✅ Checklist de Deploy - SimplesBook

Imprima ou mantenha aberto durante o deploy.

---

## 🖥️ No Seu Computador

### Preparação (10 min)

- [ ] **Instalar dependências**
  ```bash
  npm install
  ```

- [ ] **Gerar Prisma Client**
  ```bash
  npm run db:generate
  ```

- [ ] **Fazer build**
  ```bash
  npm run build
  ```

- [ ] **Preparar pacote de deploy**
  ```bash
  npm run deploy:prod
  ```
  OU
  ```powershell
  .\prepare-deploy.ps1
  ```

- [ ] **Configurar .env.production**
  - Copiar `env.example`
  - Preencher todas as variáveis
  - Gerar NEXTAUTH_SECRET: `openssl rand -base64 32`

---

## 🌐 Configurações da Hospedagem

### Banco de Dados (5 min)

- [ ] Criar banco MySQL no painel da hospedagem
- [ ] Anotar: nome do banco
- [ ] Anotar: usuário
- [ ] Anotar: senha
- [ ] Anotar: host (geralmente `localhost`)
- [ ] Anotar: porta (geralmente `3306`)
- [ ] Testar conexão (se possível)

### Credenciais Twilio (5 min)

- [ ] Acessar [console.twilio.com](https://console.twilio.com)
- [ ] Copiar Account SID
- [ ] Copiar Auth Token
- [ ] Copiar Phone Number
- [ ] Copiar WhatsApp Number

---

## 📤 Upload via FTP (15 min)

### Conectar FTP

- [ ] Abrir cliente FTP (FileZilla, WinSCP, etc)
- [ ] Host: ________________
- [ ] Usuário: ________________
- [ ] Senha: ________________
- [ ] Porta: 21 (FTP) ou 22 (SFTP)

### Enviar Arquivos

Enviar pasta `deploy-package/` ou arquivo `.zip` para: `/home/usuario/simplesbook/`

- [ ] `.next/` (pasta do build)
- [ ] `prisma/` (schema e migrations)
- [ ] `public/` (assets)
- [ ] `src/` (código-fonte)
- [ ] `package.json`
- [ ] `package-lock.json`
- [ ] `next.config.ts`
- [ ] `tsconfig.json`
- [ ] `ecosystem.config.js`
- [ ] `cron-scheduler.js`
- [ ] `.env` (renomear de .env.production)

**Tempo de upload estimado**: 10-15 min (dependendo da conexão)

---

## 🔧 No Servidor (via SSH)

### Acesso SSH (1 min)

- [ ] Conectar via SSH
  ```bash
  ssh usuario@seuservidor.com
  ```

### Configuração Inicial (15 min)

- [ ] **Ir para pasta da aplicação**
  ```bash
  cd ~/simplesbook
  ```

- [ ] **Listar arquivos (verificar upload)**
  ```bash
  ls -la
  ```

- [ ] **Instalar dependências**
  ```bash
  npm install --production
  ```

- [ ] **Configurar banco de dados**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Criar dados iniciais**
  ```bash
  npm run db:seed
  ```
  **⚠️ Anote a senha do admin que aparecer!**

### PM2 - Gerenciador de Processos (5 min)

- [ ] **Instalar PM2 globalmente**
  ```bash
  npm install -g pm2
  ```

- [ ] **Iniciar aplicação**
  ```bash
  pm2 start ecosystem.config.js
  ```

- [ ] **Verificar status**
  ```bash
  pm2 status
  ```
  ✅ Status deve estar "online"

- [ ] **Ver logs**
  ```bash
  pm2 logs simplesbook --lines 50
  ```

- [ ] **Configurar PM2 para iniciar no boot**
  ```bash
  pm2 startup
  pm2 save
  ```

### CRON - Notificações (5 min)

- [ ] **Criar pasta de logs**
  ```bash
  mkdir -p ~/simplesbook/logs
  ```

- [ ] **Editar crontab**
  ```bash
  crontab -e
  ```

- [ ] **Adicionar linha** (executar a cada 10 minutos):
  ```cron
  */10 * * * * cd ~/simplesbook && node cron-scheduler.js >> ~/simplesbook/logs/cron.log 2>&1
  ```

- [ ] **Salvar e sair** (CTRL+X, Y, Enter no nano)

- [ ] **Testar CRON manualmente**
  ```bash
  cd ~/simplesbook
  node cron-scheduler.js
  ```

- [ ] **Verificar log**
  ```bash
  cat logs/cron.log
  ```

---

## 🌍 Servidor Web (Apache/Nginx)

### Se usar Apache (10 min)

- [ ] **Copiar arquivo de exemplo**
  ```bash
  cp .htaccess.example /path/to/domain/.htaccess
  ```

- [ ] **Editar .htaccess**
  - Ajustar domínio
  - Verificar porta (3000)

- [ ] **Reiniciar Apache** (se necessário)
  ```bash
  sudo systemctl restart apache2
  ```

### Se usar Nginx (10 min)

- [ ] **Criar arquivo de configuração**
  ```bash
  sudo nano /etc/nginx/sites-available/simplesbook
  ```

- [ ] **Copiar conteúdo de** `nginx.conf.example`

- [ ] **Ajustar domínio e caminhos**

- [ ] **Criar link simbólico**
  ```bash
  sudo ln -s /etc/nginx/sites-available/simplesbook /etc/nginx/sites-enabled/
  ```

- [ ] **Testar configuração**
  ```bash
  sudo nginx -t
  ```

- [ ] **Reiniciar Nginx**
  ```bash
  sudo systemctl restart nginx
  ```

---

## 🔒 SSL/HTTPS (10 min)

### Via Let's Encrypt (Recomendado)

- [ ] **Instalar Certbot**
  ```bash
  sudo apt install certbot python3-certbot-nginx
  ```
  OU (para Apache)
  ```bash
  sudo apt install certbot python3-certbot-apache
  ```

- [ ] **Gerar certificado**
  ```bash
  sudo certbot --nginx -d seudominio.com
  ```
  OU
  ```bash
  sudo certbot --apache -d seudominio.com
  ```

- [ ] **Testar renovação automática**
  ```bash
  sudo certbot renew --dry-run
  ```

### Via cPanel

- [ ] Acessar cPanel
- [ ] Seção "SSL/TLS" ou "Let's Encrypt"
- [ ] Gerar certificado para domínio
- [ ] Ativar HTTPS

### Atualizar .env

- [ ] **Editar .env**
  ```bash
  nano ~/simplesbook/.env
  ```

- [ ] **Alterar NEXTAUTH_URL**
  ```env
  NEXTAUTH_URL="https://seudominio.com"
  ```

- [ ] **Reiniciar aplicação**
  ```bash
  pm2 restart simplesbook
  ```

---

## 🧪 Testes e Verificação (10 min)

### Verificações Técnicas

- [ ] **PM2 rodando**
  ```bash
  pm2 status
  # Status: online ✅
  ```

- [ ] **Aplicação respondendo localmente**
  ```bash
  curl http://localhost:3000
  # Deve retornar HTML ✅
  ```

- [ ] **Logs sem erros críticos**
  ```bash
  pm2 logs simplesbook --lines 100
  # Sem erros ✅
  ```

- [ ] **CRON agendado**
  ```bash
  crontab -l
  # Linha do CRON aparece ✅
  ```

- [ ] **Banco de dados conectado**
  ```bash
  npx prisma db pull
  # Sem erros ✅
  ```

### Testes no Navegador

- [ ] **Acessar site**
  ```
  https://seudominio.com
  ```

- [ ] **Página de login carrega** ✅

- [ ] **Fazer login com admin**
  - Email: (do seed)
  - Senha: (anotada anteriormente)

- [ ] **Dashboard carrega** ✅

- [ ] **Criar cliente de teste** ✅

- [ ] **Criar serviço de teste** ✅

- [ ] **Criar agendamento de teste** ✅

- [ ] **Verificar notificação agendada**
  - Aguardar próxima execução do CRON
  - Ou executar manualmente: `node cron-scheduler.js`

- [ ] **Verificar logs de notificação**
  ```bash
  tail -f ~/simplesbook/logs/cron.log
  ```

---

## 💾 Backup (5 min)

- [ ] **Editar script de backup**
  ```bash
  nano ~/simplesbook/backup.sh
  ```

- [ ] **Ajustar credenciais**
  - DB_USER
  - DB_PASS
  - DB_NAME

- [ ] **Tornar executável**
  ```bash
  chmod +x ~/simplesbook/backup.sh
  ```

- [ ] **Testar backup**
  ```bash
  bash ~/simplesbook/backup.sh
  ```

- [ ] **Agendar backup automático**
  ```bash
  crontab -e
  ```

- [ ] **Adicionar linha** (todo dia às 3h):
  ```cron
  0 3 * * * ~/simplesbook/backup.sh
  ```

---

## 📊 Monitoramento (Opcional)

### Configurar Alertas

- [ ] Instalar ferramenta de monitoramento (PM2 Plus, NewRelic, etc)
- [ ] Configurar alertas de erro
- [ ] Configurar alertas de uso de recursos
- [ ] Configurar alertas de downtime

### Configurar Logs Externos

- [ ] Integrar com serviço de logs (Papertrail, Loggly, etc)
- [ ] Configurar retenção de logs
- [ ] Configurar busca em logs

---

## ✅ Checklist Final

### Funcionalidades Core

- [ ] Login funcionando
- [ ] Criar/editar/excluir clientes
- [ ] Criar/editar/excluir serviços
- [ ] Criar/editar/excluir agendamentos
- [ ] Calendário exibindo agendamentos
- [ ] Notificações sendo enviadas
- [ ] Relatórios funcionando
- [ ] Perfil de usuário editável

### Infraestrutura

- [ ] SSL/HTTPS ativo
- [ ] PM2 rodando e configurado para auto-start
- [ ] CRON de notificações agendado
- [ ] Backup automático agendado
- [ ] Logs sendo gerados
- [ ] Banco de dados acessível apenas localmente
- [ ] Firewall configurado

### Segurança

- [ ] Arquivo .env com permissões restritas (chmod 600)
- [ ] NEXTAUTH_SECRET forte e único
- [ ] Senhas do banco fortes
- [ ] Acesso SSH via chave (recomendado)
- [ ] Fail2ban instalado (recomendado)
- [ ] Porta SSH não padrão (recomendado)

### Documentação

- [ ] Credenciais anotadas em local seguro
- [ ] Procedimentos de backup documentados
- [ ] Contatos de suporte anotados
- [ ] Diagrama de arquitetura atualizado

---

## 🎉 Deploy Concluído!

**Tempo total estimado**: 60-90 minutos

### Próximos Passos

1. **Monitorar primeiras 24h**
   - Verificar logs regularmente
   - Testar notificações
   - Verificar uso de recursos

2. **Documentar**
   - Anotar qualquer customização
   - Documentar problemas encontrados
   - Atualizar este checklist se necessário

3. **Treinar usuários**
   - Criar usuários
   - Demonstrar funcionalidades
   - Fornecer suporte inicial

4. **Otimizar**
   - Analisar performance
   - Ajustar configurações conforme necessário
   - Implementar melhorias

---

## 📞 Contatos de Emergência

**Hospedagem**: ___________________  
**Telefone**: ___________________  
**Email**: ___________________

**Desenvolvedor**: ___________________  
**Telefone**: ___________________  
**Email**: ___________________

**DBA**: ___________________  
**Telefone**: ___________________  
**Email**: ___________________

---

**Data do Deploy**: ___/___/______  
**Responsável**: ___________________  
**Versão**: 1.0.0  

**✅ Deploy verificado e aprovado por**: ___________________

