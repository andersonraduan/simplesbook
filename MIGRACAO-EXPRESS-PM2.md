# 🚀 Migração: Passenger → Express + PM2

## ✅ O que foi implementado

1. **`server.js`** - Servidor Express para Next.js
2. **`package.json`** - Atualizado com Express e novos scripts
3. **`.htaccess.proxy`** - Nova configuração com proxy reverso
4. **`ecosystem.config.js`** - Atualizado para usar `server.js`

---

## 📋 Passo a Passo da Migração

### 1. No Seu Computador (Windows)

```powershell
# Instalar Express
npm install

# Fazer build
npm run build

# Criar ZIP para deploy
.\zip-deploy.ps1
```

**Arquivos para enviar:**
- `server.js` (NOVO)
- `.htaccess.proxy` (renomear para `.htaccess` no servidor)
- `package.json` (atualizado)
- `ecosystem.config.js` (atualizado)
- `.next/` (build)
- `prisma/`, `src/`, `public/`, etc.

---

### 2. No Servidor (SSH)

```bash
cd ~/calendario.clinicalasante.pt

# 1. Fazer backup do .htaccess antigo
cp .htaccess .htaccess.passenger.backup

# 2. Substituir .htaccess
cp .htaccess.proxy .htaccess
# OU se não tiver o arquivo, copie o conteúdo manualmente

# 3. Instalar Express
npm install

# 4. Instalar PM2 globalmente
npm install -g pm2

# 5. Parar qualquer processo Node.js antigo
pkill -f node || true
pm2 delete simplesbook 2>/dev/null || true

# 6. Criar pasta de logs
mkdir -p logs

# 7. Iniciar com PM2
pm2 start ecosystem.config.js

# 8. Salvar configuração PM2
pm2 save

# 9. Configurar PM2 para iniciar no boot (OPCIONAL - pode falhar em hospedagem compartilhada)
# Se der erro "Init system not found", use a alternativa com CRON abaixo
pm2 startup 2>/dev/null || echo "PM2 startup não disponível (normal em hospedagem compartilhada)"

# 10. Verificar status
pm2 status
pm2 logs simplesbook --lines 50
```

---

### 3. Verificar se Funcionou

```bash
# Ver processos
pm2 status

# Ver logs
pm2 logs simplesbook

# Testar localmente
curl -I http://localhost:3000

# Testar via domínio
curl -I https://calendario.clinicalasante.pt
```

---

## 🔧 Comandos Úteis do PM2

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs simplesbook

# Reiniciar aplicação
pm2 restart simplesbook

# Parar aplicação
pm2 stop simplesbook

# Ver informações detalhadas
pm2 show simplesbook

# Monitorar recursos
pm2 monit
```

---

## ⚠️ Troubleshooting

### Erro: "mod_proxy not enabled"

Se o proxy não funcionar, o Apache pode não ter `mod_proxy` habilitado.

**Solução:** Contate o suporte da hospedagem para habilitar `mod_proxy` e `mod_proxy_http`.

### Erro: "Port 3000 already in use"

```bash
# Ver o que está usando a porta
lsof -i :3000

# Parar processo
kill -9 PID_DO_PROCESSO

# Ou usar outra porta
# Edite ecosystem.config.js e mude PORT: 3001
# E atualize .htaccess para usar porta 3001
```

### Erro: "PM2 command not found"

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
pm2 -v
```

### Erro: "Init system not found" no pm2 startup

**Causa:** Normal em hospedagem compartilhada. O PM2 não consegue detectar systemd/upstart.

**Solução:** Use CRON para manter o PM2 rodando:

```bash
# Criar script de verificação
cat > ~/calendario.clinicalasante.pt/keep-pm2-alive.sh << 'EOF'
#!/bin/bash
cd ~/calendario.clinicalasante.pt
pm2 ping > /dev/null 2>&1 || pm2 resurrect
EOF

chmod +x ~/calendario.clinicalasante.pt/keep-pm2-alive.sh

# Adicionar ao CRON (executa a cada 5 minutos)
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/calendario.clinicalasante.pt/keep-pm2-alive.sh >> ~/calendario.clinicalasante.pt/logs/pm2-keepalive.log 2>&1") | crontab -
```

### Aplicação não inicia

```bash
# Ver logs detalhados
pm2 logs simplesbook --err

# Testar server.js manualmente
node server.js

# Verificar se build existe
ls -la .next/server/
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Passenger | Express + PM2 |
|---------|-----------|---------------|
| **Complexidade** | Alta | Baixa |
| **Timeout** | Comum | Raro |
| **Debug** | Difícil | Fácil (pm2 logs) |
| **Reiniciar** | `touch tmp/restart.txt` | `pm2 restart` |
| **Status** | Não visível | `pm2 status` |
| **Logs** | Limitados | Completos |
| **Confiabilidade** | Baixa (hospedagem compartilhada) | Alta |

---

## ✅ Checklist de Migração

- [ ] `server.js` criado e enviado
- [ ] `package.json` atualizado (com express)
- [ ] `.htaccess.proxy` renomeado para `.htaccess`
- [ ] `ecosystem.config.js` atualizado
- [ ] Express instalado no servidor (`npm install`)
- [ ] PM2 instalado globalmente (`npm install -g pm2`)
- [ ] Processos antigos parados
- [ ] PM2 iniciado (`pm2 start ecosystem.config.js`)
- [ ] PM2 configurado para boot (`pm2 startup`)
- [ ] Aplicação testada e funcionando

---

## 🎯 Próximos Passos

1. **Enviar arquivos via FTP**
2. **Executar comandos no servidor**
3. **Testar aplicação**
4. **Remover `app.js` antigo** (opcional, pode manter como backup)

---

**Dica:** Mantenha o `.htaccess.passenger.backup` caso precise voltar atrás (não recomendado).

