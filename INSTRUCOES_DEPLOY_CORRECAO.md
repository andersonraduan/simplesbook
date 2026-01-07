# Instruções de Deploy - Correção 404 Static Files

## Problema Resolvido

Os arquivos `_next/static/*` estavam retornando 404 porque o `.htaccess` estava configurado para **proxy reverso** (Express/PM2) em vez de **Passenger nativo**.

## O que foi Corrigido

✅ Removido proxy reverso para `localhost:3000`  
✅ Configurado Passenger nativo com `app.js`  
✅ Adicionados tipos MIME explícitos para CSS/JS  
✅ Configuradas regras para servir arquivos estáticos do Next.js  

---

## Passos para Deploy no Servidor

### 1️⃣ Descobrir Paths do Servidor

Conecte via SSH ao servidor e execute os seguintes comandos:

```bash
# Descobrir path da aplicação
cd calendario.clinicalasante.pt
pwd

# Descobrir path do Node.js
which node
```

**Anote os resultados!** Exemplo:
- Path app: `/home/clini489/calendario.clinicalasante.pt`
- Path node: `/home/clini489/nodevenv/calendario.clinicalasante.pt/20/bin/node`

---

### 2️⃣ Atualizar .htaccess Localmente

Abra o arquivo `.htaccess` no projeto local e encontre estas linhas:

```apache
PassengerAppRoot /home/SEU_USUARIO/calendario.clinicalasante.pt
PassengerNodejs /home/SEU_USUARIO/nodevenv/calendario.clinicalasante.pt/20/bin/node
```

Substitua `SEU_USUARIO` pelos valores reais obtidos no passo 1.

**Exemplo:**
```apache
PassengerAppRoot /home/clini489/calendario.clinicalasante.pt
PassengerNodejs /home/clini489/nodevenv/calendario.clinicalasante.pt/20/bin/node
```

---

### 3️⃣ Fazer Upload do .htaccess

**Opção A: Via FTP/FileZilla**
1. Conecte ao servidor via FTP
2. Navegue até o diretório `calendario.clinicalasante.pt`
3. Faça upload do arquivo `.htaccess` (SUBSTITUINDO o existente)

**Opção B: Via SSH**
```bash
# No seu computador local, enviar via SCP
scp .htaccess usuario@servidor:/home/clini489/calendario.clinicalasante.pt/.htaccess
```

---

### 4️⃣ Reiniciar Passenger

Conecte via SSH e execute:

```bash
cd ~/calendario.clinicalasante.pt
touch tmp/restart.txt
```

💡 **Nota:** Se a pasta `tmp` não existir, crie-a primeiro:
```bash
mkdir -p tmp
touch tmp/restart.txt
```

---

### 5️⃣ Verificar que Funcionou

1. Abra o navegador em: https://calendario.clinicalasante.pt/login
2. Pressione **F12** para abrir DevTools → Console
3. **Recarregue a página** (Ctrl+F5 / Cmd+Shift+R)

✅ **Sucesso se:**
- Não há erros 404 para `_next/static/*`
- Não há erros de MIME type
- A página carrega CSS corretamente (estilizada)
- JavaScript funciona (interatividade)

❌ **Se ainda houver erros:**
- Verifique se os paths do Passenger estão corretos no `.htaccess`
- Verifique se o arquivo `app.js` existe no servidor
- Verifique se a pasta `.next` foi enviada completamente

---

## Comandos Úteis para Diagnóstico

### Verificar se Passenger está ativo:
```bash
cat .htaccess | grep PassengerEnabled
```

### Verificar logs de erro do Passenger:
```bash
tail -f ~/logs/calendario.clinicalasante.pt/error_log
```

### Verificar se arquivos estáticos existem:
```bash
ls -la .next/static/css/
ls -la .next/static/chunks/
```

### Verificar permissões:
```bash
chmod -R 755 .next
chmod -R 644 .next/static/**/*
```

---

## Troubleshooting

### Erro: "503 Service Unavailable"
- Passenger não conseguiu iniciar a aplicação
- Verifique se o path do Node.js está correto
- Verifique os logs: `tail -f ~/logs/*/error_log`

### Erro: Ainda 404 nos arquivos estáticos
- Verifique se `.next` foi completamente enviada para o servidor
- Execute: `ls -la .next/static/`

### Erro: "PassengerAppRoot not found"
- O path está incorreto
- Execute `pwd` no diretório da aplicação e atualize o `.htaccess`

---

## Arquivos Importantes

- **`.htaccess`** - Configuração corrigida (Passenger nativo)
- **`app.js`** - Entry point do Passenger
- **`.next/`** - Build do Next.js (DEVE estar no servidor!)
- **`node_modules/`** - Dependências (deve existir no servidor)

---

## Próximos Passos Após Correção

Após confirmar que os arquivos estáticos carregam corretamente:

1. Testar login e navegação
2. Verificar se as APIs funcionam
3. Testar em diferentes navegadores
4. Monitorar logs por algumas horas

---

**Criado em:** 2026-01-07  
**Problema:** 404 em `_next/static/*` + MIME type errors  
**Solução:** Substituir proxy reverso por Passenger nativo
