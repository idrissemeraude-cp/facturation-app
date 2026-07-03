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

const cssToAdd = `
      /* Hide scrollbar for Chrome, Safari and Opera */
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      /* Hide scrollbar for IE, Edge and Firefox */
      .no-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
`;

const sidebarHTML = (activePage) => {
  const getCls = (page) => {
    return activePage === page 
      ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-500/10 text-primary-400 font-medium transition-colors group'
      : 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group';
  };

  const getIconCls = (page) => {
    return activePage === page ? 'w-5 h-5' : 'w-5 h-5 group-hover:text-white transition-colors';
  };

  return `<div class="flex-grow p-4 overflow-y-auto no-scrollbar space-y-1 mt-4">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Principal</p>
        <a href="dashboard.html" class="${getCls('dashboard.html')}">
          <i data-lucide="layout-dashboard" class="${getIconCls('dashboard.html')}"></i>
          Tableau de bord
        </a>
        <a href="factures.html" class="${getCls('factures.html')}">
          <i data-lucide="file-text" class="${getIconCls('factures.html')}"></i>
          Factures
        </a>
        <a href="clients.html" class="${getCls('clients.html')}">
          <i data-lucide="users" class="${getIconCls('clients.html')}"></i>
          Clients
        </a>

        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3 mt-6">Rapports & Plus</p>
        <a href="statistiques.html" class="${getCls('statistiques.html')}">
          <i data-lucide="bar-chart-2" class="${getIconCls('statistiques.html')}"></i>
          Statistiques
        </a>
        <a href="parametres.html" class="${getCls('parametres.html')}">
          <i data-lucide="settings" class="${getIconCls('parametres.html')}"></i>
          Paramètres
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
              <i data-lucide="mail" class="w-4 h-4 shrink-0"></i>
              gansoreemeraude@gmail.com
            </a>
            <a href="mailto:gicb7612@gmail.com" class="text-xs text-slate-400 hover:text-primary-400 flex items-center gap-2 mb-3 transition-colors break-all">
              <i data-lucide="mail" class="w-4 h-4 shrink-0"></i>
              gicb7612@gmail.com
            </a>
            <a href="tel:+22660557777" class="text-xs text-slate-400 hover:text-primary-400 flex items-center gap-2 transition-colors">
              <i data-lucide="phone" class="w-4 h-4 shrink-0"></i>
              +226 60 55 77 77
            </a>
          </div>
        </div>
      </div>`;
};

allFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Inject CSS
    if (!content.includes('.no-scrollbar')) {
      content = content.replace('</style>', cssToAdd + '\n    </style>');
    }

    // Replace the sidebar block
    const regex = /<div class="flex-grow p-4 overflow-y-auto.*? space-y-1 mt-4">[\s\S]*?(?=<div class="p-4 border-t border-slate-800">)/;
    content = content.replace(regex, sidebarHTML(file) + '\n\n      ');
    
    fs.writeFileSync(file, content, 'utf8');
  }
});

console.log("Ancien design restauré et barre de défilement supprimée !");
