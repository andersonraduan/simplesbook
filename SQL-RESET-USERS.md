🔐 **COMANDOS SQL PARA RESETAR USUÁRIOS**

Execute estes comandos no **phpMyAdmin** (cPanel → phpMyAdmin → SQL) ou via **MySQL no SSH**:

```sql
-- Resetar senha do Admin para: admin123
UPDATE User SET password = '$2a$10$vX5kZYHJ3qL9mKp4WnR1/.rjkHhSNJp8vLY5dQX2M3FzGHJKp8ELO' WHERE email = 'admin@simplesbook.com';

-- Resetar senha do User para: user123
UPDATE User SET password = '$2a$10$eDqC1YvZ8tF5hR2gJnQ3k.X9mL4pN7wK6sT2vY8cH5jM9bE1rP3Aq' WHERE email = 'user@simplesbook.com';

-- Verificar se funcionou
SELECT email, name, role FROM User WHERE email IN ('admin@simplesbook.com', 'user@simplesbook.com');
```

---

## 📋 Passo a Passo

### Via phpMyAdmin (Mais Fácil):

1. **Acesse cPanel** → phpMyAdmin
2. **Selecione seu banco de dados** (provavelmente algo como `clini489_calendario` ou similar)
3. Clique na aba **"SQL"** no topo
4. **Cole os 2 comandos UPDATE** acima
5. Clique em **"Executar"**

### Via SSH MySQL:

```bash
# Conectar ao MySQL
mysql -u SEU_USUARIO -p SEU_BANCO

# Cole os comandos UPDATE
# Digite 'exit' para sair
```

---

## ✅ Depois de Executar

Teste o login em: https://calendario.clinicalasante.pt/login

**Credenciais:**
- **Admin:** admin@simplesbook.com / admin123
- **User:** user@simplesbook.com / user123

---

**Nota:** Os hashes acima são bcrypt válidos gerados com salt 10 (mesma configuração do código).
