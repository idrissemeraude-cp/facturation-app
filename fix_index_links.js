const fs = require('fs');

let indexContent = fs.readFileSync('index.html', 'utf8');

// Replace S'inscrire link
indexContent = indexContent.replace(
  /<a\s+href="login\.html"\s+class="([^"]*?)">\s*S'inscrire\s*<\/a>/g,
  '<a href="signup.html" class="$1">\n              S\'inscrire\n            </a>'
);

// Replace Commencer gratuitement link
indexContent = indexContent.replace(
  /<a\s+href="login\.html"\s+class="([^"]*?)">\s*Commencer gratuitement\s*<i data-lucide="arrow-right" class="w-4 h-4"><\/i>\s*<\/a>/g,
  '<a href="signup.html" class="$1">\n                Commencer gratuitement\n                <i data-lucide="arrow-right" class="w-4 h-4"></i>\n              </a>'
);

// Ensure there are no other login.html that should be signup.html
// Actually, "S'inscrire" in the bottom CTA might also exist. Let's do a global replace just in case
indexContent = indexContent.replace(
  /<a href="login\.html"([^>]*>.*S'inscrire.*)<\/a>/gi,
  '<a href="signup.html"$1</a>'
);
indexContent = indexContent.replace(
  /<a href="login\.html"([^>]*>.*Commencer gratuitement.*)<\/a>/gi,
  '<a href="signup.html"$1</a>'
);

fs.writeFileSync('index.html', indexContent, 'utf8');
console.log('Fixed index.html links');
