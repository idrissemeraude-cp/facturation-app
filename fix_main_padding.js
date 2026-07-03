const fs = require('fs');

const allFiles = [
  'dashboard.html',
  'clients.html',
  'nouvelle-facture.html',
  'statistiques.html',
  'parametres.html',
  'factures.html',
  'nouveau-client.html'
];

allFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix 1: pt-16 min-h-screen p-4 sm:p-8 -> pt-24 sm:pt-24 min-h-screen p-4 sm:p-8
    // Or better, just change it to px-4 sm:px-8 pb-4 sm:pb-8
    content = content.replace(/class="lg:ml-64 pt-16 min-h-screen p-4 sm:p-8"/g, 'class="lg:ml-64 pt-24 sm:pt-28 min-h-screen px-4 sm:px-8 pb-8"');
    
    // Also catch variations like pt-24 min-h-screen p-4 sm:p-8
    content = content.replace(/class="lg:ml-64 pt-24 min-h-screen p-4 sm:p-8"/g, 'class="lg:ml-64 pt-24 sm:pt-28 min-h-screen px-4 sm:px-8 pb-8"');

    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log("Fixed main tag padding globally!");
