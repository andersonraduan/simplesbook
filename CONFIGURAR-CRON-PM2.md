# ⚙️ Configurar CRON para Manter PM2 Rodando

## ✅ Solução para "Init system not found"

O erro é **normal em hospedagem compartilhada**. Use CRON para manter o PM2 rodando automaticamente.

---

## 🚀 Comandos para Executar no Servidor

**Copie e cole tudo de uma vez:**

```bash
cd ~/calendario.clinicalasante.pt && \
chmod +x keep-pm2-alive.sh && \
mkdir -p logs && \
(crontab -l 2>/dev/null | grep -v "keep-pm2-alive.sh"; echo "*/5 * * * * cd ~/calendario.clinicalasante.pt && bash keep-pm2-alive.sh >> logs/pm2-keepalive.log 2>&1") | crontab - && \
echo "✅ CRON configurado com sucesso!" && \
echo "" && \
echo "CRON configurado:" && \
crontab -l | grep keep-pm2-alive && \
echo "" && \
echo "Testando script manualmente:" && \
bash keep-pm2-alive.sh && \
echo "✅ Script funcionando!"
```

---

## 📋 O que o comando faz:

1. **Torna o script executável** (`chmod +x`)
2. **Adiciona ao CRON** (executa a cada 5 minutos)
3. **Remove entradas duplicadas** (se já existir)
4. **Mostra confirmação**

---

## 🔍 Verificar se Funcionou

```bash
# Ver CRON configurado
crontab -l

# Ver logs do script
tail -f ~/calendario.clinicalasante.pt/logs/pm2-keepalive.log

# Ver status do PM2
pm2 status
```

---

## ⚠️ Importante

- O CRON executa **a cada 5 minutos**
- Se o PM2 parar, será reiniciado automaticamente
- Os logs ficam em `logs/pm2-keepalive.log`

---

## 🛠️ Comandos Úteis

```bash
# Ver CRON atual
crontab -l

# Editar CRON manualmente
crontab -e

# Remover CRON do PM2 (se necessário)
crontab -l | grep -v "keep-pm2-alive.sh" | crontab -

# Testar script manualmente
cd ~/calendario.clinicalasante.pt
bash keep-pm2-alive.sh
```

---

**Execute o comando acima e o PM2 será mantido rodando automaticamente!** ✅

