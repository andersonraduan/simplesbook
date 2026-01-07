# 🔍 Buscar Erro por ID: 957f748a

## Comandos para Diagnosticar o Erro

---

## ✅ Passo 1: Buscar o Erro nos Logs

Execute no servidor:

```bash
# Buscar o Error ID nos logs
grep -i "957f748a" ~/logs/calendario.clinicalasante.pt.error.log

# Buscar com contexto (10 linhas antes e depois)
grep -i -A 10 -B 10 "957f748a" ~/logs/calendario.clinicalasante.pt.error.log

# Ver últimos erros relacionados
tail -n 200 ~/logs/calendario.clinicalasante.pt.error.log | grep -i "957f748a\|error\|timeout\|spawn"
```

---

## ✅ Passo 2: Ver Logs Completos Recentes

```bash
# Ver últimos 100 erros
tail -n 100 ~/logs/calendario.clinicalasante.pt.error.log

# Ver últimos 500 erros (mais contexto)
tail -n 500 ~/logs/calendario.clinicalasante.pt.error.log | less

# Salvar em arquivo para análise
tail -n 500 ~/logs/calendario.clinicalasante.pt.error.log > erro-completo.txt
cat erro-completo.txt
```

---

## ✅ Passo 3: Verificar Logs do Passenger

```bash
# Logs do Passenger (se existirem)
ls -la ~/logs/passenger* 2>/dev/null

# Buscar Error ID em todos os logs
grep -r "957f748a" ~/logs/ 2>/dev/null
```

---

## ✅ Passo 4: Diagnóstico Completo

Execute tudo de uma vez:

```bash
cd ~/calendario.clinicalasante.pt && \
echo "=== Buscando Error ID 957f748a ===" && \
grep -i -A 5 -B 5 "957f748a" ~/logs/calendario.clinicalasante.pt.error.log && \
echo "" && \
echo "=== Ultimos 50 erros ===" && \
tail -n 50 ~/logs/calendario.clinicalasante.pt.error.log && \
echo "" && \
echo "=== Verificando app.js ===" && \
node -e "const app = require('./app.js'); console.log('OK - Tipo:', typeof app);" && \
echo "" && \
echo "=== Verificando build ===" && \
ls -la .next/server/ 2>&1 | head -3
```

---

## 📋 Informações para Enviar ao Suporte

Se precisar de ajuda, colete estas informações:

```bash
# 1. Error ID
echo "Error ID: 957f748a"

# 2. Últimos erros
tail -n 100 ~/logs/calendario.clinicalasante.pt.error.log > erro-957f748a.txt

# 3. Versão do Node.js
node -v

# 4. Estrutura do projeto
ls -la ~/calendario.clinicalasante.pt/ | head -20

# 5. Espaço em disco
df -h ~

# 6. Memória
free -m
```

---

## 🔧 Soluções Baseadas no Tipo de Erro

### Se for "timeout":
- Build incompleto
- Dependências faltando
- Memória insuficiente

### Se for "spawn":
- app.js com erro
- Permissões incorretas
- Caminho do Node.js errado

### Se for "permission denied":
- Ajustar permissões: `chmod -R 755 .`

### Se for "module not found":
- Instalar dependências: `npm install --production`

---

**Execute os comandos acima e me envie o resultado!** 📋

