const bcrypt = require('bcryptjs');

async function gerarHashes() {
    console.log('🔐 Gerando hashes bcrypt...\n');

    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);

    console.log('=== HASHES GERADOS ===\n');
    console.log('Admin (admin123):');
    console.log(adminHash);
    console.log('\nUser (user123):');
    console.log(userHash);

    console.log('\n=== COMANDOS SQL PRONTOS ===\n');
    console.log('-- Copie e cole no phpMyAdmin ou no SSH MySQL:\n');
    console.log(`UPDATE User SET password = '${adminHash}' WHERE email = 'admin@simplesbook.com';`);
    console.log(`UPDATE User SET password = '${userHash}' WHERE email = 'user@simplesbook.com';`);
    console.log('\n✅ Comandos gerados com sucesso!');
}

gerarHashes();
