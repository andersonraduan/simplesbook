# ✅ Verificar se Aplicação Está Funcionando

## Diagnóstico Atual:
- ✅ app.js funciona (retorna function)
- ✅ Build existe (.next/server/)
- ✅ Dependências instaladas (node_modules/next/)

---

## 🔍 Passo 1: Encontrar Logs Corretos

```bash
# Procurar logs em vários locais
find ~ -name "*error.log" -type f 2>/dev/null | head -10
find ~ -name "*passenger*" -type f 2>/dev/null | head -10

# Ver logs do Apache (se existirem)
ls -la /usr/local/apache/logs/error_log 2>/dev/null
ls -la /var/log/apache2/error.log 2>/dev/null

# Ver logs do cPanel
ls -la ~/logs/ 2>/dev/null
```

---

## 🔍 Passo 2: Verificar se Aplicação Está Rodando

```bash
cd ~/calendario.clinicalasante.pt

# Ver processos Node.js
ps aux | grep node

# Ver processos Passenger
ps aux | grep passenger

# Testar se app.js responde
timeout 5 node -e "const app = require('./app.js'); console.log('OK');" || echo "Timeout ou erro"
```

---

## 🔍 Passo 3: Verificar Configuração

```bash
cd ~/calendario.clinicalasante.pt

# Verificar .htaccess
cat .htaccess | grep -i passenger

# Verificar se app.js está correto
head -20 app.js

# Verificar .env existe
ls -la .env
```

---

## 🔍 Passo 4: Testar Acesso

```bash
# Testar localmente (se possível)
curl -I http://localhost:3000 2>&1 | head -5

# Testar via domínio
curl -I https://calendario.clinicalasante.pt 2>&1 | head -10
```

---

## 🔍 Passo 5: Reiniciar e Verificar

```bash
cd ~/calendario.clinicalasante.pt

# Limpar processos travados
pkill -f node 2>/dev/null || true

# Limpar cache Passenger
rm -rf tmp/passenger.* 2>/dev/null

# Reiniciar
touch tmp/restart.txt
sleep 20

# Verificar processos novamente
ps aux | grep node | grep -v grep
```

---

## 🎯 Comando Completo de Verificação

Execute tudo de uma vez:

```bash
cd ~/calendario.clinicalasante.pt && \
echo "=== 1. Processos Node.js ===" && \
ps aux | grep node | grep -v grep && \
echo "" && \
echo "=== 2. Configuração .htaccess ===" && \
cat .htaccess | grep -i passenger && \
echo "" && \
echo "=== 3. Testando app.js ===" && \
timeout 3 node -e "const app = require('./app.js'); console.log('OK - Tipo:', typeof app);" && \
echo "" && \
echo "=== 4. Verificando build ===" && \
ls -la .next/server/app 2>&1 | head -1 && \
echo "" && \
echo "=== 5. Testando acesso ===" && \
curl -I https://calendario.clinicalasante.pt 2>&1 | head -5
```

---

## 🔧 Se Ainda Não Funcionar

1. **Verificar no painel do cPanel:**
   - Acesse o painel do cPanel
   - Vá em "Node.js" ou "Aplicações"
   - Veja se há erros visíveis
   - Verifique os logs no painel

2. **Verificar Error ID no navegador:**
   - O Error ID 957f748a pode aparecer na página de erro
   - Copie a mensagem completa de erro

3. **Contatar suporte da hospedagem:**
   - Informe o Error ID: 957f748a
   - Informe que app.js funciona localmente
   - Peça para verificar logs do Passenger

---

**Execute os comandos acima e me envie o resultado!** 📋

