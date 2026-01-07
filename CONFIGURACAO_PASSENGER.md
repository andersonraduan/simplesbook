# 🚀 Configuração Rápida para cPanel com Passenger

## 📦 Arquivos Preparados

✅ **app.js** - Entry point para Passenger  
✅ **.htaccess.passenger** - Configuração do Apache com Passenger  
✅ **.htaccess.example** - Configuração alternativa (proxy)

---

## 🎯 Passos no Servidor (Via SSH)

### 1. Fazer Upload dos Arquivos

Envie via FTP ou copie via SSH:
- `app.js`
- `.htaccess.passenger`
- Todos os outros arquivos do deploy

### 2. Configurar no Servidor

```bash
cd ~/calendario.clinicalasante.pt

# Tornar app.js executável
chmod +x app.js

# Descobrir caminho do Node.js
which node
# Anote o resultado, exemplo: /home/clini489/nodevenv/calendario.clinicalasante.pt/20/bin/node

# Copiar e ajustar .htaccess
cp .htaccess.passenger .htaccess

# Editar .htaccess com seus caminhos
nano .htaccess
```

### 3. Ajustar .htaccess

No arquivo `.htaccess`, substitua:

```apache
# ANTES:
PassengerAppRoot /home/SEU_USUARIO/SEU_DOMINIO
PassengerNodejs /home/SEU_USUARIO/nodevenv/SEU_DOMINIO/20/bin/node

# DEPOIS (exemplo):
PassengerAppRoot /home/clini489/calendario.clinicalasante.pt
PassengerNodejs /home/clini489/nodevenv/calendario.clinicalasante.pt/20/bin/node
```

**Como descobrir os caminhos:**

```bash
# Caminho completo da aplicação:
pwd

# Caminho do Node.js:
which node
```

### 4. Fazer Build

```bash
cd ~/calendario.clinicalasante.pt

# Build do Next.js
npm run build

# Verificar se .next foi criado
ls -la .next/
```

### 5. Reiniciar Aplicação

```bash
cd ~/calendario.clinicalasante.pt

# Criar/atualizar arquivo de restart
mkdir -p tmp
touch tmp/restart.txt

# Aguardar 10 segundos
sleep 10
```

### 6. Testar

```bash
# Testar localmente
curl -I http://localhost:3000

# Ver logs
tail -f ~/logs/calendario.clinicalasante.pt.error.log
```

### 7. Acessar no Navegador

```
https://calendario.clinicalasante.pt
```

---

## 🔍 Verificação

Execute para verificar se está tudo correto:

```bash
cd ~/calendario.clinicalasante.pt

# 1. app.js existe e é executável
ls -la app.js

# 2. .htaccess existe
ls -la .htaccess

# 3. Build existe
ls -la .next/

# 4. node_modules existe
ls -la node_modules/ | head

# 5. .env existe e está configurado
cat .env | head

# 6. Testar Node.js
node -v
```

---

## ⚠️ Problemas Comuns

### Erro: "Internal Server Error"

```bash
# Ver logs
tail -n 100 ~/logs/calendario.clinicalasante.pt.error.log

# Verificar se caminhos no .htaccess estão corretos
cat .htaccess | grep Passenger
```

### Erro: "No matching DirectoryIndex"

Passenger não está ativo. Verifique:
1. `.htaccess` está na raiz do domínio
2. `PassengerEnabled On` está descomentado
3. Caminhos estão corretos

### Aplicação não inicia

```bash
# Testar app.js manualmente
cd ~/calendario.clinicalasante.pt
node app.js

# Deve mostrar:
# ✅ Aplicação Next.js pronta!
```

### Erro: "PassengerStartTimeout not allowed here"

**Causa:** Embora a [documentação oficial do Passenger](https://www.phusionpassenger.com/library/config/apache/reference/#passengerstarttimeout) indique que `PassengerStartTimeout` é permitido em `.htaccess`, algumas hospedagens compartilhadas têm restrições adicionais no Apache (AllowOverride limitado).

**Solução:** 
1. **Remover a diretiva** se a hospedagem não permitir:
```apache
# Comentar ou remover esta linha:
# PassengerStartTimeout 120
```

2. **Alternativa:** Otimizar o `app.js` para ser mais rápido (já implementado - exporta função instantaneamente)

**Diretivas geralmente permitidas em `.htaccess` (cPanel/hospedagem compartilhada):**
- ✅ `PassengerEnabled`
- ✅ `PassengerAppType`
- ✅ `PassengerStartupFile`
- ✅ `PassengerAppRoot`
- ✅ `PassengerNodejs`
- ✅ `SetEnv`
- ⚠️ `PassengerStartTimeout` (pode não funcionar em hospedagem compartilhada)
- ❌ `PassengerSpawnMethod` (geralmente não permitido)
- ❌ `PassengerMaxPoolSize` (geralmente não permitido)

**Referência oficial:** [Passenger Apache Configuration Reference](https://www.phusionpassenger.com/library/config/apache/reference/)

**Como verificar:**
```bash
# Verificar se há diretivas problemáticas
grep -E "PassengerStartTimeout|PassengerSpawnMethod|PassengerMaxPoolSize" .htaccess
```

### Erro: "A timeout occurred while spawning an application process"

**Solução aplicada:**
1. ✅ `app.js` exporta handler IMEDIATAMENTE (antes de carregar Next.js)
2. ✅ Next.js só é carregado quando a primeira requisição chega (lazy loading)
3. ✅ Nenhuma operação pesada no momento do spawn

**Diagnóstico avançado:**
```bash
# 1. Verificar se app.js é executável
chmod +x app.js
ls -la app.js

# 2. Testar app.js manualmente (deve exportar função sem erro)
node -e "const app = require('./app.js'); console.log(typeof app);"
# Deve mostrar: function

# 3. Verificar se build existe e está completo
ls -la .next/
ls -la .next/standalone/ 2>/dev/null || echo "Standalone não encontrado (normal se não usar)"

# 4. Verificar se node_modules está completo
ls -la node_modules/next/ 2>/dev/null || echo "Next.js não encontrado em node_modules"

# 5. Verificar logs detalhados do Passenger
tail -n 200 ~/logs/calendario.clinicalasante.pt.error.log | grep -i "timeout\|spawn\|error"

# 6. Verificar permissões
ls -la ~/calendario.clinicalasante.pt/ | head -20

# 7. Verificar se há espaço em disco
df -h ~

# 8. Verificar memória disponível
free -m
```

**Se o problema persistir:**
1. Verifique se o build foi feito corretamente: `npm run build`
2. Verifique se todas as dependências estão instaladas: `npm install`
3. Tente reiniciar o Passenger: `touch tmp/restart.txt && sleep 15`
4. Verifique se há processos Node.js travados: `ps aux | grep node`
5. Entre em contato com o suporte da hospedagem para verificar limites de recursos

---

## 🎯 Comandos Resumidos

```bash
# 1. Ir para pasta
cd ~/calendario.clinicalasante.pt

# 2. Tornar executável
chmod +x app.js

# 3. Configurar .htaccess
cp .htaccess.passenger .htaccess
nano .htaccess  # Ajustar caminhos

# 4. Build
npm run build

# 5. Reiniciar
touch tmp/restart.txt

# 6. Testar
curl -I https://calendario.clinicalasante.pt
```

---

## 📞 Descobrir Informações do Servidor

```bash
# Usuário
whoami

# Caminho atual
pwd

# Node.js
which node
node -v

# Estrutura de pastas
ls -la ~/
```

---

**Após configurar, a aplicação deve iniciar automaticamente via Passenger!** 🚀

