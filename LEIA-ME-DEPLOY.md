# 🚀 SimplesBook - Guia Completo de Deploy em Produção

## 📚 Documentação Preparada

Todo o sistema está pronto para ser colocado em produção via FTP. Toda a documentação necessária foi criada.

---

## 🎯 Por Onde Começar?

### 1️⃣ INICIANTE? Leia Nesta Ordem:

1. **[PRODUCAO_FTP.md](./PRODUCAO_FTP.md)** ⭐ **COMECE AQUI**
   - Visão geral completa
   - Resumo de tudo que foi preparado
   - Comandos essenciais

2. **[DEPLOYMENT.md](./DEPLOYMENT.md)** 📖
   - Guia detalhado passo a passo
   - 9 seções completas
   - Troubleshooting incluído

3. **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)** ✅
   - Checklist completo
   - Imprima e marque cada item
   - Não pule nenhuma etapa

### 2️⃣ EXPERIENTE? Vá Direto Para:

1. **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** ⚡
   - Resumo executivo
   - Comandos rápidos
   - 20-30 minutos

---

## 📦 Arquivos Criados

### Documentação

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `PRODUCAO_FTP.md` | Resumo executivo | Primeira leitura |
| `DEPLOYMENT.md` | Guia completo | Deploy detalhado |
| `QUICK_DEPLOY.md` | Checklist rápido | Deploy express |
| `CHECKLIST_DEPLOY.md` | Checklist imprimível | Durante o deploy |
| `LEIA-ME-DEPLOY.md` | Este arquivo | Orientação geral |

### Configuração

| Arquivo | Descrição | Como Usar |
|---------|-----------|-----------|
| `env.example` | Template de variáveis | Copie para `.env` |
| `ecosystem.config.js` | Config PM2 | Upload para servidor |
| `next.config.ts` | Config produção | Já atualizado ✅ |
| `package.json` | Com scripts deploy | Já atualizado ✅ |

### Scripts

| Arquivo | Descrição | Como Executar |
|---------|-----------|---------------|
| `prepare-deploy.js` | Prepara deploy (Node) | `npm run prepare-deploy` |
| `prepare-deploy.ps1` | Prepara deploy (Windows) | `.\prepare-deploy.ps1` |
| `backup.sh` | Backup automático | `bash backup.sh` |

### Servidor Web

| Arquivo | Descrição | Para Quem |
|---------|-----------|-----------|
| `.htaccess.example` | Config Apache | Hospedagem com Apache |
| `nginx.conf.example` | Config Nginx | VPS/servidor com Nginx |

---

## ⚡ Deploy Rápido - 3 Comandos

### No Seu Computador:
```bash
npm run deploy:prod
```

### No Servidor (via SSH):
```bash
npm install --production && \
npx prisma migrate deploy && \
npm run db:seed && \
pm2 start ecosystem.config.js && \
pm2 save
```

### Configurar CRON:
```bash
crontab -e
# Adicionar: */10 * * * * cd ~/simplesbook && node cron-scheduler.js >> ~/simplesbook/logs/cron.log 2>&1
```

**Pronto!** Acesse seu domínio.

---

## 🎬 Fluxo Completo de Deploy

```mermaid
graph TD
    A[Preparar Build Local] --> B[Configurar .env]
    B --> C[Criar Pacote Deploy]
    C --> D[Upload via FTP]
    D --> E[Configurar Banco de Dados]
    E --> F[Instalar Dependências]
    F --> G[Rodar Migrations]
    G --> H[Executar Seed]
    H --> I[Instalar PM2]
    I --> J[Iniciar Aplicação]
    J --> K[Configurar CRON]
    K --> L[Configurar Proxy]
    L --> M[Ativar SSL]
    M --> N[Testar]
    N --> O[Deploy Concluído! 🎉]
```

---

## 📋 Requisitos Mínimos do Servidor

### Hardware
- **CPU**: 1 core
- **RAM**: 512 MB (1 GB recomendado)
- **Disco**: 2 GB (5 GB recomendado)
- **Banda**: Ilimitada

### Software
- **Node.js**: 18.x ou superior (20.x LTS recomendado)
- **MySQL**: 5.7 ou superior (8.0 recomendado)
- **Apache** ou **Nginx**: Qualquer versão recente
- **PM2**: Será instalado durante o deploy
- **Acesso**: SSH + FTP/SFTP

---

## 🔑 Variáveis de Ambiente Necessárias

Antes de começar, você precisa ter em mãos:

### 1. Banco de Dados (da sua hospedagem)
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/banco"
```

### 2. Secret de Autenticação (gerar novo)
```bash
openssl rand -base64 32
```
```env
NEXTAUTH_SECRET="resultado-do-comando-acima"
```

### 3. URL do Site
```env
NEXTAUTH_URL="https://seudominio.com"
```

### 4. Twilio (criar conta em twilio.com)
```env
TWILIO_ACCOUNT_SID="seu_sid"
TWILIO_AUTH_TOKEN="seu_token"
TWILIO_PHONE_NUMBER="+5511999999999"
TWILIO_WHATSAPP_NUMBER="whatsapp:+5511999999999"
```

### 5. Configurações da Aplicação
```env
NEXT_PUBLIC_APP_NAME="SimplesBook"
NEXT_PUBLIC_APP_URL="https://seudominio.com"
NODE_ENV="production"
```

**📄 Veja o arquivo completo em**: `env.example`

---

## 🚀 Passo a Passo Simplificado

### Fase 1: Preparação Local (10 min)

1. Abrir terminal no projeto
2. Executar:
   ```bash
   npm install
   npm run build
   npm run db:generate
   npm run prepare-deploy
   ```
3. Configurar arquivo `.env` (copiar de `env.example`)

### Fase 2: Upload FTP (15 min)

1. Abrir cliente FTP (FileZilla, WinSCP, etc)
2. Conectar ao servidor
3. Enviar pasta `deploy-package/` ou arquivo `.zip` gerado
4. Aguardar upload completo

### Fase 3: Configuração Servidor (20 min)

1. Conectar via SSH
2. Criar/configurar banco de dados MySQL
3. Instalar dependências: `npm install --production`
4. Rodar migrations: `npx prisma migrate deploy`
5. Criar dados iniciais: `npm run db:seed`
6. Instalar PM2: `npm install -g pm2`
7. Iniciar app: `pm2 start ecosystem.config.js`

### Fase 4: CRON e Proxy (10 min)

1. Configurar CRON para notificações
2. Configurar Apache ou Nginx
3. Ativar SSL/HTTPS

### Fase 5: Testes (10 min)

1. Acessar site no navegador
2. Fazer login
3. Criar agendamento de teste
4. Verificar notificações

**⏱️ Tempo Total: 60-90 minutos**

---

## 🆘 Problemas Comuns

### ❌ Aplicação não inicia

```bash
# Ver erro
pm2 logs simplesbook

# Reiniciar
pm2 restart simplesbook
```

### ❌ Erro de conexão com banco

```bash
# Testar conexão
mysql -u usuario -p -h localhost nome_banco

# Verificar .env
cat .env | grep DATABASE_URL
```

### ❌ Notificações não enviam

```bash
# Testar manualmente
node cron-scheduler.js

# Ver logs
tail -f logs/cron.log

# Verificar CRON
crontab -l
```

### ❌ Site não abre (502/504)

```bash
# Verificar PM2
pm2 status

# Verificar logs
pm2 logs simplesbook
```

**📖 Mais soluções em**: `DEPLOYMENT.md` (seção "Problemas Comuns")

---

## 📊 Comandos Úteis

### Gerenciar Aplicação
```bash
pm2 status              # Ver status
pm2 logs simplesbook    # Ver logs
pm2 restart simplesbook # Reiniciar
pm2 stop simplesbook    # Parar
pm2 monit               # Monitorar recursos
```

### Banco de Dados
```bash
npx prisma migrate deploy  # Rodar migrations
npx prisma db pull         # Testar conexão
npx prisma studio          # Abrir interface visual
npm run db:seed            # Recriar dados iniciais
```

### Backup
```bash
bash backup.sh           # Fazer backup manual
mysqldump -u user -p db  # Backup apenas do banco
```

### Logs
```bash
pm2 logs simplesbook --lines 100  # Últimas 100 linhas
tail -f logs/cron.log             # CRON em tempo real
pm2 flush simplesbook             # Limpar logs
```

---

## 🔒 Segurança - Checklist

- [ ] SSL/HTTPS ativado
- [ ] `.env` com permissões 600 (`chmod 600 .env`)
- [ ] `NEXTAUTH_SECRET` forte (32+ caracteres)
- [ ] Senhas do banco fortes
- [ ] Firewall configurado (apenas portas 80, 443, 22)
- [ ] MySQL acessível apenas via localhost
- [ ] SSH via chave pública (recomendado)
- [ ] Fail2ban instalado (recomendado)
- [ ] Backups automáticos configurados
- [ ] Logs sendo monitorados

---

## 📞 Suporte e Ajuda

### Documentação Oficial

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **PM2**: https://pm2.keymetrics.io/docs
- **Twilio**: https://www.twilio.com/docs

### Logs para Diagnosticar

Sempre verifique nesta ordem:

1. `pm2 logs simplesbook` - Logs da aplicação
2. `logs/cron.log` - Logs do CRON de notificações
3. `/var/log/nginx/error.log` - Logs do Nginx
4. `/var/log/apache2/error.log` - Logs do Apache
5. `/var/log/mysql/error.log` - Logs do MySQL

---

## 🎓 Dicas e Boas Práticas

### Durante o Deploy

1. ✅ Sempre faça backup antes de qualquer mudança
2. ✅ Teste em ambiente local antes
3. ✅ Use `.env` diferente para cada ambiente
4. ✅ Documente qualquer customização
5. ✅ Mantenha logs dos problemas encontrados

### Pós-Deploy

1. ✅ Monitore por 24-48h após deploy
2. ✅ Configure alertas de erro
3. ✅ Teste todas as funcionalidades core
4. ✅ Treine usuários finais
5. ✅ Mantenha documentação atualizada

### Manutenção

1. ✅ Backups diários automáticos
2. ✅ Atualizações de segurança mensais
3. ✅ Limpeza de logs semanalmente
4. ✅ Monitoramento de recursos
5. ✅ Teste de restore de backup mensalmente

---

## 📈 Próximos Passos Após Deploy

### Imediato (primeiras 24h)

- [ ] Monitorar logs constantemente
- [ ] Testar todas as funcionalidades
- [ ] Criar usuários de teste
- [ ] Testar notificações reais
- [ ] Verificar uso de recursos (CPU, RAM, disco)

### Curto Prazo (primeira semana)

- [ ] Treinar usuários finais
- [ ] Coletar feedback
- [ ] Ajustar configurações conforme necessário
- [ ] Documentar problemas encontrados
- [ ] Implementar melhorias de UX

### Médio Prazo (primeiro mês)

- [ ] Analisar métricas de uso
- [ ] Otimizar performance
- [ ] Implementar melhorias sugeridas
- [ ] Revisar segurança
- [ ] Planejar próximas features

---

## 🎉 Está Pronto!

Você tem em mãos **TUDO** que precisa para colocar o SimplesBook em produção:

✅ Documentação completa  
✅ Scripts automatizados  
✅ Configurações de servidor  
✅ Checklists detalhados  
✅ Suporte e troubleshooting  
✅ Backups e segurança  

**Escolha seu caminho:**

- 🚀 **Deploy rápido**: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- 📖 **Deploy detalhado**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- ✅ **Checklist**: [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)
- 📋 **Resumo**: [PRODUCAO_FTP.md](./PRODUCAO_FTP.md)

---

## 💪 Você Consegue!

O deploy pode parecer intimidador, mas com esta documentação você tem tudo que precisa. 

**Tempo estimado**: 60-90 minutos  
**Dificuldade**: Média  
**Suporte**: Documentação completa incluída

**Boa sorte! 🚀**

---

**Última atualização**: Janeiro 2026  
**Versão**: 1.0.0  
**Status**: ✅ Pronto para produção

