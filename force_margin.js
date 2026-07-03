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
    
    // The previous fix added padding-top: 110px to main, but it seems to not be enough or not applying properly due to caching.
    // Let's add an explicit margin-top to the flex container itself just to be absolutely certain.
    
    // Find the div with "flex flex-col sm:flex-row justify-between items-start sm:items-center"
    content = content.replace(
      /<div\s+class="flex flex-col sm:flex-row justify-between items-start sm:items-center([^"]*)"/g, 
      '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center$1" style="margin-top: 60px;"'
    );

    // Also let's make sure the main tag has pt-32 to push things far down safely.
    content = content.replace(/style="padding-top: 110px;"/g, 'style="padding-top: 120px;"');

    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log("Added explicit margin-top to the header section container!");
