# 🚫 Desabilitar Passenger Completamente

## ⚠️ IMPORTANTE: Passenger pode ser injetado automaticamente pelo CloudLinux

Mesmo removendo do `.htaccess`, o CloudLinux pode adicionar configurações do Passenger automaticamente.

---

## ✅ Passo 1: No Painel do cPanel

1. Acesse o painel do cPanel
2. Vá em **"Node.js"** ou **"Aplicações"**
3. Encontre a aplicação `calendario.clinicalasante.pt`
4. **PARE** ou **DESABILITE** a aplicação
5. Ou **DELETE** a configuração do Node.js no painel

---

## ✅ Passo 2: No Servidor (SSH)

Execute para garantir que o `.htaccess` está limpo:

```bash
cd ~/calendario.clinicalasante.pt

# Fazer backup
cp .htaccess .htaccess.backup-$(date +%Y%m%d)

# Verificar se há configurações do Passenger
grep -i "passenger\|cloudlinux" .htaccess

# Se encontrar, remover manualmente ou recriar
# O arquivo .htaccess já foi recriado sem Passenger
```

---

## ✅ Passo 3: Verificar se Passenger está Desabilitado

```bash
# Verificar se há processos Passenger
ps aux | grep passenger | grep -v grep

# Verificar se há configurações no .htaccess
cat .htaccess | grep -i passenger

# Se encontrar algo, o CloudLinux está injetando
```

---

## 🔧 Se CloudLinux Continuar Injetando Passenger

Se o CloudLinux continuar adicionando configurações do Passenger automaticamente:

### Opção 1: Contatar Suporte

Peça para desabilitar Passenger para este domínio.

### Opção 2: Usar Arquivo .htaccess Alternativo

Crie um `.htaccess` que sobrescreva as configurações do Passenger:

```apache
# Desabilitar Passenger explicitamente
PassengerEnabled Off

# Proxy reverso
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

---

## ✅ Passo 4: Verificar se Proxy Está Funcionando

```bash
# Testar se porta 3000 está escutando
curl -I http://localhost:3000

# Testar via domínio
curl -I https://calendario.clinicalasante.pt
```

---

**O arquivo `.htaccess` foi recriado limpo. Envie para o servidor e verifique se o Passenger está desabilitado no painel do cPanel!** 🚀

