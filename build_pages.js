const fs = require('fs');
const path = require('path');

const filesToUpdate = ['dashboard.html', 'clients.html', 'nouvelle-facture.html'];

// Utility to replace the sidebar links in a given HTML content
function updateSidebarLinks(content, activePage) {
  // Update Statistiques link
  content = content.replace(
    /href="#" onclick="alert\('Module Statistiques prochainement disponible !'\); return false;"/g,
    'href="statistiques.html"'
  );
  
  // Update Paramètres link
  content = content.replace(
    /href="#" onclick="alert\('Module Paramètres prochainement disponible !'\); return false;"/g,
    'href="parametres.html"'
  );

  // Simple highlight logic (remove active from others, add to activePage)
  // This is a bit complex with regex because of Tailwind classes, so we just do a basic string replacement if needed.
  // Actually, for Statistiques and Paramètres, we just give them the right classes when creating them.
  return content;
}

// 1. Update existing files
filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = updateSidebarLinks(content, file.replace('.html', ''));
  fs.writeFileSync(file, content, 'utf8');
});

// 2. Read base for new files (we use clients.html as a base)
const baseContent = fs.readFileSync('clients.html', 'utf8');

// --- Create statistiques.html ---
let statContent = baseContent.replace('<title>iziFacture - Clients</title>', '<title>iziFacture - Statistiques</title>');
// Fix active states in sidebar:
// Make Clients inactive:
statContent = statContent.replace(
  'href="clients.html"\n          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-500/10 text-primary-400 font-medium transition-colors group"',
  'href="clients.html"\n          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"'
);
// Make Statistiques active:
statContent = statContent.replace(
  'href="statistiques.html"\n          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"',
  'href="statistiques.html"\n          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-500/10 text-primary-400 font-medium transition-colors group"'
);

// Replace main content
const statMain = `
    <main class="lg:ml-64 pt-16 min-h-screen p-4 sm:p-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 reveal active">
          <div>
            <h1 class="text-2xl font-display font-bold text-slate-900">Statistiques</h1>
            <p class="text-sm text-slate-500">Analysez vos performances financières.</p>
          </div>
          <div class="flex gap-2">
            <select class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none">
              <option>Cette année</option>
              <option>Ce mois</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 reveal active">
          <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <i data-lucide="trending-up" class="w-6 h-6"></i>
              </div>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                +12.5%
              </span>
            </div>
            <p class="text-sm font-medium text-slate-500 mb-1">Chiffre d'Affaires</p>
            <h3 class="text-2xl font-display font-bold text-slate-900">12 450 000 FCFA</h3>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <i data-lucide="check-circle" class="w-6 h-6"></i>
              </div>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                45 factures
              </span>
            </div>
            <p class="text-sm font-medium text-slate-500 mb-1">Factures Payées</p>
            <h3 class="text-2xl font-display font-bold text-slate-900">8 200 000 FCFA</h3>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <i data-lucide="clock" class="w-6 h-6"></i>
              </div>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                12 factures
              </span>
            </div>
            <p class="text-sm font-medium text-slate-500 mb-1">En attente</p>
            <h3 class="text-2xl font-display font-bold text-slate-900">4 250 000 FCFA</h3>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-8 reveal active">
           <h2 class="font-bold text-slate-900 mb-6">Évolution des revenus</h2>
           <div class="h-64 w-full flex items-end gap-2 justify-between mt-4">
             <!-- Fake Chart Bars -->
             <div class="w-full bg-primary-100 rounded-t-lg relative group h-24 hover:bg-primary-200 transition-colors cursor-pointer"><div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Jan</div></div>
             <div class="w-full bg-primary-100 rounded-t-lg relative group h-32 hover:bg-primary-200 transition-colors cursor-pointer"><div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Fev</div></div>
             <div class="w-full bg-primary-500 rounded-t-lg relative group h-48 hover:bg-primary-600 transition-colors cursor-pointer shadow-glow"><div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Mar</div></div>
             <div class="w-full bg-primary-100 rounded-t-lg relative group h-20 hover:bg-primary-200 transition-colors cursor-pointer"><div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Avr</div></div>
             <div class="w-full bg-primary-100 rounded-t-lg relative group h-40 hover:bg-primary-200 transition-colors cursor-pointer"><div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Mai</div></div>
             <div class="w-full bg-primary-100 rounded-t-lg relative group h-56 hover:bg-primary-200 transition-colors cursor-pointer"><div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Juin</div></div>
           </div>
        </div>
      </div>
    </main>`;
statContent = statContent.replace(/<main.*<\/main>/s, statMain);
fs.writeFileSync('statistiques.html', statContent, 'utf8');

// --- Create parametres.html ---
let paramContent = baseContent.replace('<title>iziFacture - Clients</title>', '<title>iziFacture - Paramètres</title>');
// Fix active states in sidebar:
paramContent = paramContent.replace(
  'href="clients.html"\n          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-500/10 text-primary-400 font-medium transition-colors group"',
  'href="clients.html"\n          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"'
);
paramContent = paramContent.replace(
  'href="parametres.html"\n          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group"',
  'href="parametres.html"\n          class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-500/10 text-primary-400 font-medium transition-colors group"'
);

const paramMain = `
    <main class="lg:ml-64 pt-16 min-h-screen p-4 sm:p-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8 reveal active">
          <h1 class="text-2xl font-display font-bold text-slate-900">Paramètres</h1>
          <p class="text-sm text-slate-500">Configurez votre compte et vos préférences.</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden reveal active mb-8">
          <div class="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h2 class="font-bold text-slate-900">Profil de l'entreprise</h2>
          </div>
          <div class="p-6 sm:p-8">
            <div class="flex items-center gap-6 mb-8">
              <div class="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-display font-bold text-3xl shadow-lg">
                TA
              </div>
              <div>
                <button class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-sm mb-1">
                  Changer le logo
                </button>
                <p class="text-xs text-slate-500">JPG, PNG. Max 2MB.</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Nom de l'entreprise</label>
                <input type="text" value="TechAfrica Studio" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:bg-white transition-colors text-slate-900" />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Email de contact</label>
                <input type="email" value="contact@techafrica.studio" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:bg-white transition-colors text-slate-900" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-bold text-slate-700 mb-2">Adresse postale</label>
                <input type="text" value="Plateau, Abidjan, Côte d'Ivoire" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:bg-white transition-colors text-slate-900" />
              </div>
            </div>
            
            <div class="mt-8 flex justify-end">
              <button class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-glow" onclick="alert('Paramètres sauvegardés !')">
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>`;
paramContent = paramContent.replace(/<main.*<\/main>/s, paramMain);
fs.writeFileSync('parametres.html', paramContent, 'utf8');

console.log("Pages Statistiques et Paramètres créées avec succès !");
