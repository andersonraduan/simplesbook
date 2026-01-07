# 🔧 Corrigir Erro 503 (Service Unavailable)

## Problema: Aplicação não está respondendo

O erro 503 indica que o servidor não consegue se conectar à aplicação Node.js na porta 3000.

---

## ✅ Diagnóstico Completo (Execute no Servidor)

**Copie e cole TODOS os comandos de uma vez:**

```bash
cd ~/calendario.clinicalasante.pt && \
echo "=== 1. Verificando status do PM2 ===" && \
pm2 status && \
echo "" && \
echo "=== 2. Verificando se aplicação está rodando ===" && \
pm2 list | grep simplesbook || echo "⚠️ Aplicação não encontrada no PM2" && \
echo "" && \
echo "=== 3. Verificando logs de erro (últimas 20 linhas) ===" && \
pm2 logs simplesbook --err --lines 20 --nostream 2>&1 || echo "⚠️ Não foi possível ler logs" && \
echo "" && \
echo "=== 4. Verificando se porta 3000 está escutando ===" && \
ss -tuln | grep 3000 || netstat -tuln | grep 3000 || echo "⚠️ Porta 3000 não está escutando" && \
echo "" && \
echo "=== 5. Verificando processos Node.js ===" && \
ps aux | grep node | grep -v grep || echo "⚠️ Nenhum processo Node.js encontrado" && \
echo "" && \
echo "=== 6. Verificando se .env existe e tem NEXTAUTH_SECRET ===" && \
if [ -f .env ]; then
    if grep -q "NEXTAUTH_SECRET" .env; then
        echo "✅ NEXTAUTH_SECRET encontrado no .env"
    else
        echo "⚠️ NEXTAUTH_SECRET NÃO encontrado no .env"
    fi
else
    echo "⚠️ Arquivo .env não existe"
fi && \
echo "" && \
echo "=== 7. Verificando se build existe ===" && \
if [ -d ".next/server" ]; then
    echo "✅ Build existe"
    ls -la .next/server/ | head -5
else
    echo "⚠️ Build não existe (.next/server não encontrado)"
fi
```

---

## 🔧 Solução: Reiniciar Aplicação Corretamente

**Se a aplicação não estiver rodando, execute:**

```bash
cd ~/calendario.clinicalasante.pt && \
echo "=== 1. Parando PM2 (se estiver rodando) ===" && \
pm2 stop simplesbook 2>/dev/null || true && \
pm2 delete simplesbook 2>/dev/null || true && \
echo "✅ PM2 limpo" && \
echo "" && \
echo "=== 2. Verificando se .env tem NEXTAUTH_SECRET ===" && \
if [ ! -f .env ]; then
    echo "⚠️ Criando .env básico..."
    cat > .env << 'EOFENV'
DATABASE_URL="mysql://usuario:senha@localhost:3306/banco"
NEXTAUTH_SECRET="MKYrat/hNpEN1yuG0jbkCRpchqQnUsHN+TcIj5olYMc="
NEXTAUTH_URL="https://calendario.clinicalasante.pt"
NODE_ENV="production"
EOFENV
    echo "✅ .env criado"
else
    if ! grep -q "NEXTAUTH_SECRET" .env; then
        echo "⚠️ Adicionando NEXTAUTH_SECRET ao .env..."
        echo "" >> .env
        echo "NEXTAUTH_SECRET=\"MKYrat/hNpEN1yuG0jbkCRpchqQnUsHN+TcIj5olYMc=\"" >> .env
        echo "NEXTAUTH_URL=\"https://calendario.clinicalasante.pt\"" >> .env
        echo "✅ NEXTAUTH_SECRET adicionado"
    else
        echo "✅ NEXTAUTH_SECRET já existe"
    fi
fi && \
echo "" && \
echo "=== 3. Verificando se build existe ===" && \
if [ ! -d ".next/server" ]; then
    echo "⚠️ Build não existe! Você precisa fazer build primeiro."
    echo "Execute: npm run build"
    exit 1
fi && \
echo "✅ Build existe" && \
echo "" && \
echo "=== 4. Corrigindo permissões ===" && \
chmod -R 755 . && \
chown -R clini489:clini489 . 2>/dev/null || true && \
echo "✅ Permissões corrigidas" && \
echo "" && \
echo "=== 5. Criando diretório de logs ===" && \
mkdir -p logs && \
chmod 755 logs && \
echo "✅ Diretório de logs criado" && \
echo "" && \
echo "=== 6. Iniciando PM2 ===" && \
NODE_ENV=production pm2 start ecosystem.config.js --update-env && \
pm2 save && \
echo "✅ PM2 iniciado" && \
echo "" && \
echo "=== 7. Aguardando inicialização (15 segundos) ===" && \
sleep 15 && \
echo "" && \
echo "=== 8. Verificando status ===" && \
pm2 status && \
echo "" && \
echo "=== 9. Verificando logs (últimas 10 linhas) ===" && \
pm2 logs simplesbook --lines 10 --nostream && \
echo "" && \
echo "=== 10. Testando porta 3000 ===" && \
curl -I http://localhost:3000 2>&1 | head -5 && \
echo "" && \
echo "✅ Diagnóstico completo!"
```

---

## 🔍 Verificações Adicionais

### Verificar se Apache tem mod_proxy habilitado:

```bash
# Testar se proxy funciona
curl -I http://localhost:3000
# Se retornar HTTP/1.1 200 OK, a aplicação está rodando

# Testar via domínio
curl -I https://calendario.clinicalasante.pt
# Se retornar 503, o problema é no proxy do Apache
```

### Ver logs do Apache (se disponível):

```bash
tail -n 50 ~/logs/calendario.clinicalasante.pt.error.log
```

### Testar server.js manualmente:

```bash
cd ~/calendario.clinicalasante.pt
NODE_ENV=production node server.js
# Deve mostrar: "> Servidor pronto em http://localhost:3000"
# Se der erro, copie a mensagem completa
# Pressione Ctrl+C para parar
```

---

## 🆘 Problemas Comuns

### 1. PM2 não está instalado ou não está no PATH

```bash
# Verificar se PM2 está instalado
which pm2 || echo "PM2 não encontrado"

# Instalar PM2 globalmente
npm install -g pm2

# Ou usar PM2 do nodevenv
export PATH="$HOME/nodevenv/calendario.clinicalasante.pt/24/bin:$PATH"
pm2 -v
```

### 2. Porta 3000 já está em uso

```bash
# Ver o que está usando a porta
lsof -i :3000 || ss -tuln | grep 3000

# Parar processo (substitua PID pelo número do processo)
kill -9 PID_DO_PROCESSO

# Ou usar outra porta (edite ecosystem.config.js e .htaccess)
```

### 3. Build não existe

```bash
# Fazer build (pode demorar e consumir memória)
npm run build

# Ou fazer build localmente e enviar via FTP
```

### 4. NEXTAUTH_SECRET não configurado

```bash
# Adicionar ao .env
echo 'NEXTAUTH_SECRET="MKYrat/hNpEN1yuG0jbkCRpchqQnUsHN+TcIj5olYMc="' >> .env
echo 'NEXTAUTH_URL="https://calendario.clinicalasante.pt"' >> .env
```

### 5. mod_proxy não habilitado no Apache

Se o Apache não tiver `mod_proxy` habilitado, o proxy reverso não funcionará.

**Solução:** Contate o suporte da hospedagem para habilitar `mod_proxy` e `mod_proxy_http`.

---

## 📝 Checklist de Verificação

Execute este checklist para identificar o problema:

- [ ] PM2 está instalado e no PATH
- [ ] Aplicação está rodando no PM2 (`pm2 status`)
- [ ] Porta 3000 está escutando (`ss -tuln | grep 3000`)
- [ ] Build existe (`.next/server/` existe)
- [ ] `.env` existe e tem `NEXTAUTH_SECRET`
- [ ] Logs não mostram erros críticos (`pm2 logs simplesbook`)
- [ ] `server.js` funciona manualmente (`node server.js`)
- [ ] Apache tem `mod_proxy` habilitado (contatar suporte)

---

**Execute o diagnóstico completo acima e me envie o resultado!** 🚀

