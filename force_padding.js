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
    
    // Replace the main tag completely to use inline style for padding-top to guarantee it works.
    content = content.replace(/<main class="[^"]*"/g, '<main class="lg:ml-64 min-h-screen px-4 sm:px-8 pb-8" style="padding-top: 110px;"');

    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log("Forced top padding with inline styles!");
