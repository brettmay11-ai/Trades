document.querySelectorAll('[data-open-modal="signin"]').forEach(button => button.addEventListener('click', event => { event.stopImmediatePropagation(); location.href = '/login'; }, true));
document.querySelectorAll('[data-open-modal="join"]').forEach(button => button.addEventListener('click', event => { event.stopImmediatePropagation(); location.href = '/signup'; }, true));
document.querySelectorAll('[data-open-modal="post-job"]').forEach(button => button.addEventListener('click', async event => { const response = await fetch('/api/me'); if (!response.ok) { event.stopImmediatePropagation(); location.href = '/signup'; } }, true));
const nationalReplacements = new Map([
  ['The Texas construction network', 'The construction trade network'],
  ['Right here in Texas.', 'Ready for every market.'],
  ['Built with Texas contractors', 'Built with working contractors'],
  ['Texas', 'Nationwide'],
  ['focused from day one', 'built to scale'],
  ['Open jobs across Texas', 'Open jobs across the network'],
  ['Try another trade or Texas market.', 'Try another trade or market.'],
  ['Search specialized Texas crews by experience, service area, credentials, and track record.', 'Search specialized crews by experience, service area, credentials, and track record.'],
  ['Founding Texas network', 'Founding trade network'],
  ['Built for the people who build Texas.', 'Built for the people who build.'],
  ['Tell us where you fit in the Texas construction community.', 'Tell us where you fit in the construction community.']
]);
function nationalizeText(root = document.body) { const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode); nodes.forEach(node => { nationalReplacements.forEach((replacement, source) => { if (node.nodeValue.includes(source)) node.nodeValue = node.nodeValue.replaceAll(source, replacement); }); }); document.querySelectorAll('option').forEach(option => { option.textContent = option.textContent.replace('Texas market', 'market').replace('All Texas markets', 'All markets'); }); }
nationalizeText();
