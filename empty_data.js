const fs = require('fs');
const files = ['dashboard.html', 'factures.html', 'clients.html', 'statistiques.html', 'index.html'];

for (let file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace mock money amounts
  content = content.replace(/2\.4M\s*FCFA/g, '0 FCFA');
  content = content.replace(/3\s?450\s?000\s*FCFA/g, '0 FCFA');
  content = content.replace(/850\s?000\s*FCFA/g, '0 FCFA');
  content = content.replace(/15M\+\s*FCFA/g, '0 FCFA');
  content = content.replace(/450\s?000\s*FCFA/g, '0 FCFA');
  content = content.replace(/381\s?355\s*FCFA/g, '0 FCFA');
  content = content.replace(/68\s?645\s*FCFA/g, '0 FCFA');
  content = content.replace(/125\s?000\s*FCFA/g, '0 FCFA');
  
  // Replace mock counts
  content = content.replace(/>12</g, '>0<'); // Clients count
  content = content.replace(/>45</g, '>0<'); // Factures count
  content = content.replace(/>\+12\.5%</g, '>0%<'); 
  content = content.replace(/>\+8\.2%</g, '>0%<'); 
  content = content.replace(/>1000\+</g, '>0<'); 
  
  // Clear table bodies in specific files
  if (file === 'dashboard.html' || file === 'factures.html') {
    content = content.replace(/(<tbody[^>]*>)([\s\S]*?)(<\/tbody>)/g, (match, p1, p2, p3) => {
      // If it's the invoice builder table in dashboard, keep it empty but not with the "No data" message
      // Wait, dashboard.html has invoice items table too? No, index.html does.
      // But just to be safe, I'll put a generic empty state for all tables in factures.html and dashboard.html
      // Wait, dashboard.html has "Factures récentes" table.
      return p1 + '\n                <tr><td colspan="6" class="text-center py-8 text-slate-500">Aucune donnée pour le moment.</td></tr>\n              ' + p3;
    });
  }

  if (file === 'clients.html') {
    content = content.replace(/(<tbody[^>]*>)([\s\S]*?)(<\/tbody>)/g, (match, p1, p2, p3) => {
      return p1 + '\n                <tr><td colspan="5" class="text-center py-8 text-slate-500">Aucun client pour le moment. Ajoutez votre premier client.</td></tr>\n              ' + p3;
    });
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed', file);
}
