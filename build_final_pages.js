const fs = require('fs');
const path = require('path');

const allFiles = [
  'dashboard.html',
  'clients.html',
  'nouvelle-facture.html',
  'statistiques.html',
  'parametres.html',
  'factures.html',
  'nouveau-client.html'
];

// Generate factures.html
let baseContent = fs.readFileSync('clients.html', 'utf8');
let facturesContent = baseContent.replace('<title>iziFacture - Clients</title>', '<title>iziFacture - Factures</title>');
const facturesMain = `
    <main class="lg:ml-64 pt-16 min-h-screen p-4 sm:p-8">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 reveal active">
          <div>
            <h1 class="text-2xl font-display font-bold text-slate-900">Factures</h1>
            <p class="text-sm text-slate-500">Gérez l'ensemble de vos factures.</p>
          </div>
          <button onclick="window.location.href = 'nouvelle-facture.html'" class="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-glow">
            <i data-lucide="plus" class="w-4 h-4"></i>
            Nouvelle Facture
          </button>
        </div>

        <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden reveal active">
          <div class="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex items-center bg-slate-50 rounded-lg px-3 py-2 w-full sm:w-64 border border-slate-200">
              <i data-lucide="search" class="w-4 h-4 text-slate-400"></i>
              <input type="text" placeholder="Rechercher..." class="bg-transparent border-none outline-none ml-2 text-sm w-full text-slate-900" />
            </div>
            <div class="flex gap-2 w-full sm:w-auto">
              <button class="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-200">
                <i data-lucide="filter" class="w-4 h-4"></i> Filtres
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                  <th class="p-4 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">N° Facture</th>
                  <th class="p-4 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th class="p-4 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th class="p-4 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                  <th class="p-4 sm:p-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr class="hover:bg-slate-50/50 transition-colors group cursor-pointer" onclick="window.location.href='nouvelle-facture.html'">
                  <td class="p-4 sm:p-6 font-mono font-medium text-slate-900">INV-2024-043</td>
                  <td class="p-4 sm:p-6 text-sm font-medium text-slate-700">Acme Corp</td>
                  <td class="p-4 sm:p-6 text-sm text-slate-500">12 Avr 2024</td>
                  <td class="p-4 sm:p-6 text-sm font-bold text-slate-900">1 250 000 FCFA</td>
                  <td class="p-4 sm:p-6"><span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Payée</span></td>
                </tr>
                <tr class="hover:bg-slate-50/50 transition-colors group cursor-pointer" onclick="window.location.href='nouvelle-facture.html'">
                  <td class="p-4 sm:p-6 font-mono font-medium text-slate-900">INV-2024-044</td>
                  <td class="p-4 sm:p-6 text-sm font-medium text-slate-700">Design Studio LLC</td>
                  <td class="p-4 sm:p-6 text-sm text-slate-500">15 Avr 2024</td>
                  <td class="p-4 sm:p-6 text-sm font-bold text-slate-900">850 000 FCFA</td>
                  <td class="p-4 sm:p-6"><span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">En attente</span></td>
                </tr>
                <tr class="hover:bg-slate-50/50 transition-colors group cursor-pointer" onclick="window.location.href='nouvelle-facture.html'">
                  <td class="p-4 sm:p-6 font-mono font-medium text-slate-900">INV-2024-045</td>
                  <td class="p-4 sm:p-6 text-sm font-medium text-slate-700">Global Services</td>
                  <td class="p-4 sm:p-6 text-sm text-slate-500">20 Avr 2024</td>
                  <td class="p-4 sm:p-6 text-sm font-bold text-slate-900">3 400 000 FCFA</td>
                  <td class="p-4 sm:p-6"><span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Brouillon</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>`;
facturesContent = facturesContent.replace(/<main.*<\/main>/s, facturesMain);
fs.writeFileSync('factures.html', facturesContent, 'utf8');


// Generate nouveau-client.html
let newClientContent = baseContent.replace('<title>iziFacture - Clients</title>', '<title>iziFacture - Nouveau Client</title>');
const newClientMain = `
    <main class="lg:ml-64 pt-16 min-h-screen p-4 sm:p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 reveal active">
          <div>
            <h1 class="text-2xl font-display font-bold text-slate-900">Nouveau Client</h1>
            <p class="text-sm text-slate-500">Ajoutez un client à votre répertoire.</p>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden reveal active mb-8">
          <div class="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h2 class="font-bold text-slate-900">Informations du client</h2>
          </div>
          <div class="p-6 sm:p-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="sm:col-span-2">
                <label class="block text-sm font-bold text-slate-700 mb-2">Nom de l'entreprise ou du contact *</label>
                <input type="text" placeholder="Ex: Acme Corp" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:bg-white transition-colors text-slate-900" />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input type="email" placeholder="contact@entreprise.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:bg-white transition-colors text-slate-900" />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Téléphone</label>
                <input type="tel" placeholder="+225 00 00 00 00" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:bg-white transition-colors text-slate-900" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-bold text-slate-700 mb-2">Adresse postale</label>
                <input type="text" placeholder="Abidjan, Côte d'Ivoire" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:bg-white transition-colors text-slate-900" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-bold text-slate-700 mb-2">Notes supplémentaires</label>
                <textarea rows="3" placeholder="Informations utiles..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:bg-white transition-colors text-slate-900"></textarea>
              </div>
            </div>
            
            <div class="mt-8 flex justify-end gap-3">
              <button onclick="window.location.href='clients.html'" class="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors">
                Annuler
              </button>
              <button onclick="window.location.href='clients.html'" class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-glow">
                Enregistrer le client
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>`;
newClientContent = newClientContent.replace(/<main.*<\/main>/s, newClientMain);
fs.writeFileSync('nouveau-client.html', newClientContent, 'utf8');

// Replace sidebar links across all files
const sidebarHTML = (activePage) => {
  const getCls = (page) => {
    return activePage === page 
      ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-500/10 text-primary-400 font-medium transition-colors group'
      : 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group';
  };

  const getIconCls = (page) => {
    return activePage === page ? 'w-5 h-5' : 'w-5 h-5 group-hover:text-white transition-colors';
  };

  return `<div class="flex-grow p-4 overflow-y-auto space-y-1 mt-4">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Principal</p>
        <a href="dashboard.html" class="${getCls('dashboard.html')}">
          <i data-lucide="layout-dashboard" class="${getIconCls('dashboard.html')}"></i> Tableau de bord
        </a>
        <a href="factures.html" class="${getCls('factures.html')}">
          <i data-lucide="file-text" class="${getIconCls('factures.html')}"></i> Factures
        </a>
        <a href="nouvelle-facture.html" class="${getCls('nouvelle-facture.html')}">
          <i data-lucide="plus-circle" class="${getIconCls('nouvelle-facture.html')}"></i> Nouvelle Facture
        </a>
        <a href="clients.html" class="${getCls('clients.html')}">
          <i data-lucide="users" class="${getIconCls('clients.html')}"></i> Clients
        </a>
        <a href="nouveau-client.html" class="${getCls('nouveau-client.html')}">
          <i data-lucide="user-plus" class="${getIconCls('nouveau-client.html')}"></i> Nouveau Client
        </a>

        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3 mt-6">Rapports & Plus</p>
        <a href="statistiques.html" class="${getCls('statistiques.html')}">
          <i data-lucide="bar-chart-2" class="${getIconCls('statistiques.html')}"></i> Statistiques
        </a>
        <a href="parametres.html" class="${getCls('parametres.html')}">
          <i data-lucide="settings" class="${getIconCls('parametres.html')}"></i> Paramètres
        </a>

        <div class="mt-8 px-3">
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center">
                <i data-lucide="help-circle" class="w-4 h-4"></i>
              </div>
              <p class="font-bold text-sm text-white">Aide & Support</p>
            </div>
            <a href="mailto:gansoreemeraude@gmail.com" class="text-xs text-slate-400 hover:text-primary-400 flex items-center gap-2 mb-3 transition-colors break-all">
              <i data-lucide="mail" class="w-4 h-4 shrink-0"></i> gansoreemeraude@gmail.com
            </a>
            <a href="mailto:gicb7612@gmail.com" class="text-xs text-slate-400 hover:text-primary-400 flex items-center gap-2 mb-3 transition-colors break-all">
              <i data-lucide="mail" class="w-4 h-4 shrink-0"></i> gicb7612@gmail.com
            </a>
            <a href="tel:+22660557777" class="text-xs text-slate-400 hover:text-primary-400 flex items-center gap-2 transition-colors">
              <i data-lucide="phone" class="w-4 h-4 shrink-0"></i> +226 60 55 77 77
            </a>
          </div>
        </div>
      </div>`;
};

allFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Regular expression to replace the entire <div class="flex-grow ..."> ... </div> block
    // We will match from <div class="flex-grow p-4 overflow-y-auto space-y-1 mt-4"> up to <div class="p-4 border-t border-slate-800">
    const regex = /<div class="flex-grow p-4 overflow-y-auto space-y-1 mt-4">[\s\S]*?(?=<div class="p-4 border-t border-slate-800">)/;
    
    content = content.replace(regex, sidebarHTML(file) + '\n\n      ');
    fs.writeFileSync(file, content, 'utf8');
  }
});

// Update the Nouveau Client button in clients.html to not trigger alert
let clientsFile = fs.readFileSync('clients.html', 'utf8');
clientsFile = clientsFile.replace(
  /onclick="alert\('Création de client prochainement disponible !'\)"/g,
  'onclick="window.location.href=\'nouveau-client.html\'"'
);
fs.writeFileSync('clients.html', clientsFile, 'utf8');

console.log("Pages Factures et Nouveau Client créées, et tous les menus mis à jour !");
