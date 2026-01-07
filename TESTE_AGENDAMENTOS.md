# Guia Rápido - Testando o Módulo de Agendamentos

## 🚀 Antes de Começar

### 1. Pare o Servidor Dev (se estiver rodando)

Pressione `Ctrl+C` no terminal onde o servidor está rodando.

### 2. Atualize o Banco de Dados

```bash
npm run db:push
```

Isso criará as tabelas `Agendamento` e `AgendamentoServico`.

### 3. Inicie o Servidor

```bash
npm run dev
```

## 📝 Pré-requisitos para Teste

Antes de criar agendamentos, certifique-se de ter:

1. **Pelo menos 1 cliente cadastrado**
   - Acesse: `/clientes`
   - Crie um cliente de teste

2. **Pelo menos 1 serviço cadastrado**
   - Acesse: `/servicos`
   - Crie um serviço de teste (ex: "Corte de Cabelo", €20, 30 minutos)

## 🧪 Casos de Teste

### Teste 1: Criar Agendamento Simples

1. Acesse `/agendamentos`
2. Clique em "Adicionar Novo Agendamento"
3. **Cliente**: Digite e selecione um cliente
4. **Serviços**: Digite e selecione 1 serviço
5. **Observe**: Valor e Duração são calculados automaticamente
6. **Horário Início**: Selecione data/hora (ex: amanhã às 14:00)
7. **Observe**: Horário Fim é calculado automaticamente
8. **Status**: Deixe como "Pendente"
9. Clique em "Criar Agendamento"
10. ✅ Deve aparecer na lista à direita

### Teste 2: Agendamento com Múltiplos Serviços

1. Clique em "Adicionar Novo Agendamento"
2. Selecione um cliente
3. **Serviços**: Selecione 2 ou 3 serviços
4. **Observe**: 
   - Valor total = soma dos valores
   - Duração = soma das durações
5. Defina horário de início
6. Crie o agendamento
7. ✅ Lista deve mostrar todos os serviços

### Teste 3: Validação de Conflito

1. **Crie um agendamento**: Ex: Amanhã às 14:00, duração 60min (até 15:00)
2. **Tente criar outro no mesmo horário**:
   - Cliente: qualquer
   - Horário: Amanhã às 14:30 (conflita com o anterior)
3. ✅ Deve exibir alerta amarelo com mensagem de conflito
4. ✅ Deve listar o agendamento conflitante
5. Marque o checkbox "Confirmar mesmo com conflito"
6. Clique em "Criar Agendamento"
7. ✅ Deve criar mesmo com conflito

### Teste 4: Editar Agendamento

1. Clique em "Editar" em qualquer agendamento
2. Modifique alguns campos (ex: adicione um serviço)
3. ✅ Valores devem recalcular
4. Clique em "Atualizar"
5. ✅ Card deve atualizar com novos dados

### Teste 5: Editar Valores Manualmente

1. Crie ou edite um agendamento
2. Após selecionar serviços (cálculo automático)
3. **Edite manualmente** o campo "Valor Total" (ex: adicione desconto)
4. **Edite manualmente** o campo "Duração" (ex: adicione tempo de preparo)
5. **Edite manualmente** o campo "Horário Fim"
6. ✅ Deve aceitar os valores editados

### Teste 6: Cancelar Agendamento

1. Em um agendamento, clique em "Cancelar"
2. Confirme
3. ✅ Badge deve mudar para vermelho "Cancelado"
4. ✅ Botão "Cancelar" deve sumir
5. Tente criar um agendamento no mesmo horário
6. ✅ **Não deve detectar conflito** (cancelados são ignorados)

### Teste 7: Remover Agendamento

1. Em um agendamento, clique em "Remover"
2. Confirme
3. ✅ Card deve desaparecer da lista

### Teste 8: Busca no Combobox

1. Abra o formulário de agendamento
2. **Campo Cliente**: Clique e digite parte do nome
3. ✅ Lista deve filtrar em tempo real
4. **Campo Serviços**: Digite parte do título do serviço
5. ✅ Lista deve filtrar
6. Selecione múltiplos serviços
7. ✅ Deve mostrar "tags" dos selecionados
8. Clique no "×" em uma tag
9. ✅ Deve remover o serviço

### Teste 9: Status do Agendamento

1. Crie um agendamento com status "Pendente" (amarelo)
2. Edite e mude para "Confirmado" (azul)
3. Edite e mude para "Concluído" (verde)
4. ✅ Badge deve mudar de cor conforme o status

### Teste 10: Observações

1. Crie um agendamento
2. Adicione observações: "Cliente pediu para chegar 10min antes"
3. Salve
4. ✅ Card deve mostrar as observações
5. Edite e remova as observações
6. ✅ Campo de observações deve sumir do card

## 🎯 Checklist de Validações

### Cálculos Automáticos
- [ ] Valor total = soma dos valores dos serviços
- [ ] Duração total = soma do time_execution dos serviços
- [ ] Horário fim = horário início + duração

### Validações
- [ ] Não permite criar sem cliente
- [ ] Não permite criar sem serviços
- [ ] Não permite criar com horário fim antes do início
- [ ] Detecta conflitos de horário
- [ ] Ignora agendamentos cancelados nos conflitos
- [ ] Permite confirmar mesmo com conflito

### Edição
- [ ] Valores podem ser editados manualmente
- [ ] Duração pode ser editada manualmente
- [ ] Horário fim pode ser editado manualmente
- [ ] Edição também valida conflitos

### UI/UX
- [ ] Busca filtra em tempo real
- [ ] Loading states aparecem
- [ ] Badges de status têm cores corretas
- [ ] Formatação de datas está em pt-BR
- [ ] Duração mostra formato legível (ex: 1h 30min)
- [ ] Valores monetários mostram 2 casas decimais

### Navegação
- [ ] Link "Agendamentos" aparece no menu
- [ ] Link fica destacado quando na página /agendamentos
- [ ] Botão "Cancelar" fecha o formulário
- [ ] Após criar/editar, formulário fecha e lista atualiza

## 🐛 O que Observar

### Comportamento Esperado
- Todos os campos calculados atualizam instantaneamente
- Alerta de conflito só aparece ao tentar salvar
- Mensagem de erro é clara e específica
- Confirmações aparecem antes de deletar

### Possíveis Problemas
- Se o Prisma Client não foi regenerado, verá erros de tipo
- Se o banco não foi atualizado, verá erros 500 nas APIs
- Se não houver clientes/serviços, combobox mostrará "Nenhuma opção encontrada"

## ✅ Teste Completo

Se todos os testes acima passaram, o módulo está **100% funcional**! 🎉

## 📞 Próximos Passos

Após testar, você pode:
1. Criar mais clientes e serviços para teste
2. Testar com dados reais
3. Explorar casos de uso específicos do seu negócio
4. Sugerir melhorias ou novas funcionalidades

---

**Dica**: Use o DevTools (F12) do navegador para ver requisições da API e possíveis erros.

