const fs = require('fs');

let html = fs.readFileSync('nouvelle-facture.html', 'utf8');

// Update containers
html = html.replace('<div class="max-w-6xl mx-auto">', '<div class="max-w-4xl mx-auto">');
html = html.replace('<div class="grid lg:grid-cols-12 gap-8 items-start reveal active">', '<div class="reveal active">');
html = html.replace('<div class="lg:col-span-8 flex flex-col gap-6">', '<div class="flex flex-col gap-6">');

// Extract everything from <!-- Notes --> to </main>
const notesRegex = /<!-- Notes -->[\s\S]*?(?=<script>)/;

const newFooter = `<!-- Footer: Notes & Summary side by side on desktop -->
              <div class="flex flex-col md:flex-row justify-between gap-8 mt-12 pt-8 border-t border-slate-100">
                <!-- Notes -->
                <div class="w-full md:w-1/2">
                  <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes & Conditions</h3>
                  <textarea rows="4" class="w-full text-sm text-slate-600 outline-none border border-slate-200 rounded-xl p-3 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none" placeholder="Merci pour votre confiance."></textarea>
                </div>
                
                <!-- Summary -->
                <div class="w-full md:w-1/2 md:max-w-sm">
                  <div class="space-y-4 mb-8">
                    <div class="flex justify-between text-slate-500 text-sm">
                      <span>Sous-total HT</span>
                      <span class="font-mono" id="summary-subtotal">0</span>
                    </div>
                    <div class="flex justify-between text-slate-500 text-sm items-center">
                      <span>TVA (18%)</span>
                      <span class="font-mono" id="summary-tax">0</span>
                    </div>
                    <div class="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <span class="font-bold text-slate-900 text-lg">Total TTC</span>
                      <span class="font-display font-bold text-2xl text-primary-500"><span id="summary-total">0</span> <span class="text-sm font-normal text-slate-500">FCFA</span></span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="space-y-3">
                    <button onclick="window.location.href = 'dashboard.html'" id="send-invoice-btn" class="w-full flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-glow transition-all">
                      <i data-lucide="send" class="w-4 h-4 mr-2"></i> Créer & Envoyer
                    </button>
                    <button onclick="alert('Brouillon enregistré avec succès (démo) !')" class="w-full flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all">
                      <i data-lucide="save" class="w-4 h-4 mr-2"></i> Enregistrer
                    </button>
                    <button onclick="alert('Lien de partage copié dans le presse-papiers (démo) !')" class="w-full flex items-center justify-center py-3.5 px-6 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                      <i data-lucide="share-2" class="w-4 h-4 mr-2"></i> Partager
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    `;

html = html.replace(notesRegex, newFooter);

fs.writeFileSync('nouvelle-facture.html', html, 'utf8');
console.log('Restructured nouvelle-facture.html');
