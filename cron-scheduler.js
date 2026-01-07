// Cron Scheduler - Executa job de notificações a cada 5 minutos
// Para usar: node cron-scheduler.js

const interval = 5 * 60 * 1000; // 5 minutos em milissegundos

async function executeCron() {
  const now = new Date().toLocaleString('pt-BR');
  console.log(`\n[${now}] 🔄 Executando job de notificações...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/notifications/cron');
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Sucesso!`);
      console.log(`   📊 Processadas: ${data.results.processed}`);
      console.log(`   ✉️  Enviadas: ${data.results.sent}`);
      console.log(`   ❌ Falhas: ${data.results.failed}`);
      console.log(`   🗑️  Logs deletados: ${data.results.logsDeleted}`);
      
      if (data.results.errors.length > 0) {
        console.log(`\n   ⚠️  Erros detectados:`);
        data.results.errors.forEach((error, index) => {
          console.log(`      ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log(`❌ Erro:`, data.error);
    }
  } catch (error) {
    console.error(`❌ Erro ao executar cron:`, error.message);
    console.error(`   Certifique-se de que o servidor Next.js está rodando em http://localhost:3000`);
  }
  
  console.log(`⏰ Próxima execução em 5 minutos...`);
}

// Banner inicial
console.log('\n=================================================');
console.log('🚀 Cron Scheduler - Sistema de Notificações');
console.log('=================================================');
console.log('📅 Intervalo: 5 minutos');
console.log('🌐 Endpoint: http://localhost:3000/api/notifications/cron');
console.log('⏹️  Para parar: Ctrl+C');
console.log('=================================================\n');

// Executar imediatamente
executeCron();

// Executar a cada 5 minutos
setInterval(executeCron, interval);

