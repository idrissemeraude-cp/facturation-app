const fs = require('fs');
const files = ['dashboard.html', 'clients.html', 'nouvelle-facture.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Fix Aide & Support emails
  if (!content.includes('gicb7612@gmail.com')) {
    content = content.replace(
      /<a href="mailto:gansoreemeraude@gmail\.com".*?<\/a>/s,
      match => match + '\n            <a href="mailto:gicb7612@gmail.com" class="text-xs text-slate-400 hover:text-primary-400 flex items-center gap-2 mb-3 transition-colors break-all">\n              <i data-lucide="mail" class="w-4 h-4 shrink-0"></i>\n              gicb7612@gmail.com\n            </a>'
    );
  }

  // 2. Fix Aside
  if (content.includes('class="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 hidden lg:flex flex-col"')) {
    content = content.replace(
      '<aside\n      class="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 hidden lg:flex flex-col"\n    >',
      '<div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden opacity-0 pointer-events-none transition-opacity duration-300" onclick="toggleSidebar()"></div>\n    <aside id="sidebar" class="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 flex flex-col">'
    );
  } else if (content.includes('class="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 hidden lg:flex flex-col">')) {
    content = content.replace(
      '<aside class="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 hidden lg:flex flex-col">',
      '<div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden opacity-0 pointer-events-none transition-opacity duration-300" onclick="toggleSidebar()"></div>\n    <aside id="sidebar" class="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 transform -translate-x-full lg:translate-x-0 transition-transform duration-300 flex flex-col">'
    );
  }

  // 3. Fix hamburger menu button
  if (content.includes('<button class="text-slate-500 hover:text-slate-900">\n          <i data-lucide="menu"')) {
    content = content.replace(
      '<button class="text-slate-500 hover:text-slate-900">\n          <i data-lucide="menu"',
      '<button onclick="toggleSidebar()" class="text-slate-500 hover:text-slate-900">\n          <i data-lucide="menu"'
    );
  }

  // 4. Add JS function
  if (!content.includes('function toggleSidebar() {')) {
    const jsFunc = `
      function toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("sidebar-overlay");
        const isClosed = sidebar.classList.contains("-translate-x-full");

        if (isClosed) {
          sidebar.classList.remove("-translate-x-full");
          overlay.classList.remove("opacity-0", "pointer-events-none");
          overlay.classList.add("opacity-100");
        } else {
          sidebar.classList.add("-translate-x-full");
          overlay.classList.remove("opacity-100");
          overlay.classList.add("opacity-0", "pointer-events-none");
        }
      }
    </script>
  </body>`;
    content = content.replace('</script>\n  </body>', jsFunc);
  }

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Done!');
