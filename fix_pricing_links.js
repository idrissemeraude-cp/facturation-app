const fs = require('fs');
let index = fs.readFileSync('index.html', 'utf8');

index = index.replace(
  /<a\s+href="login\.html"([^>]+)>\s*Commencer gratuitement\s*<\/a>/i,
  '<a href="signup.html?plan=basic"$1>\n                Commencer gratuitement\n              </a>'
);

index = index.replace(
  /<a\s+href="login\.html"([^>]+)>\s*Passer en Pro\s*<\/a>/i,
  '<a href="signup.html?plan=pro"$1>\n                Passer en Pro\n              </a>'
);

index = index.replace(
  /<a\s+href="login\.html"([^>]+)>\s*Passer en Pro Max\s*<\/a>/i,
  '<a href="signup.html?plan=promax"$1>\n                Passer en Pro Max\n              </a>'
);

fs.writeFileSync('index.html', index);

let signup = fs.readFileSync('signup.html', 'utf8');
if (!signup.includes("new URLSearchParams")) {
  signup = signup.replace('</script>\n  </body>', `
      // Auto-select plan from URL
      window.addEventListener('DOMContentLoaded', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const plan = urlParams.get('plan');
        if (plan) {
          const radio = document.querySelector('input[name="plan"][value="' + plan + '"]');
          if (radio) {
            radio.checked = true;
          }
        }
      });
    </script>\n  </body>`);
  fs.writeFileSync('signup.html', signup);
}
