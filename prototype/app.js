const trades = [
  ['Framing & rough carpentry', 'FR'], ['Electrical', 'EL'], ['HVAC & refrigeration', 'HV'],
  ['Concrete, formwork & rebar', 'CO'], ['Plumbing', 'PL'], ['Drywall & finishing', 'DR'],
  ['Painting & coatings', 'PA'], ['Masonry, brick & stone', 'MA'], ['Roofing', 'RO'],
  ['Excavation, grading & sitework', 'EX'], ['Demolition', 'DE'], ['Insulation', 'IN'],
  ['Flooring & tile', 'FL'], ['Finish carpentry & millwork', 'FC'], ['Siding, stucco & exteriors', 'SI'],
  ['Windows, doors & glazing', 'WD'], ['Landscaping & irrigation', 'LA'], ['Fencing & gates', 'FG'],
  ['Low-voltage & security', 'LV'], ['Welding & structural steel', 'WS'], ['Waterproofing & drainage', 'WA'],
  ['Cleaning, hauling & closeout', 'CL']
];

const markets = ['Dallas-Fort Worth', 'Houston', 'Austin', 'San Antonio', 'El Paso', 'Texas Panhandle'];
const projectTypes = ['Residential new construction', 'Remodel', 'Multifamily', 'Light commercial', 'Service / repair', 'Storm / restoration'];

let jobs = [
  { id: 1, trade: 'Framing & rough carpentry', market: 'Dallas-Fort Worth', type: 'Multifamily', title: 'Frame 18-unit townhome development', budget: '$180k - $240k', timing: 'Starts Jul 15', age: 'Posted 2h ago', company: 'Westline Builders', initials: 'WB', rating: '4.8 contractor rating', description: 'Labor and equipment for wood framing across six three-unit buildings. Plans are permit-ready.', bids: 4 },
  { id: 2, trade: 'Electrical', market: 'Austin', type: 'Light commercial', title: 'Electrical rough-in for restaurant finish-out', budget: '$45k - $65k', timing: 'Starts Jul 8', age: 'Posted 5h ago', company: 'Capstone Commercial', initials: 'CC', rating: 'Texas contractor profile', description: 'Full rough-in and trim-out for a 4,200 sq ft restaurant shell. TDLR license required.', bids: 7 },
  { id: 3, trade: 'Concrete, formwork & rebar', market: 'Houston', type: 'Residential new construction', title: 'Pour foundations for 12 single-family homes', budget: '$90k - $125k', timing: 'Starts Aug 1', age: 'Posted today', company: 'Bayou Residential', initials: 'BR', rating: '12 completed jobs', description: 'Turnkey form, rebar, and concrete placement. Homes are in one active development.', bids: 3 },
  { id: 4, trade: 'HVAC & refrigeration', market: 'San Antonio', type: 'Multifamily', title: 'HVAC install for 24-unit apartment renovation', budget: '$140k - $190k', timing: 'Starts Jul 22', age: 'Posted yesterday', company: 'Mission Property Group', initials: 'MP', rating: '4.9 contractor rating', description: 'Replace split systems, ductwork, and controls during occupied-unit renovation schedule.', bids: 5 },
  { id: 5, trade: 'Roofing', market: 'Dallas-Fort Worth', type: 'Storm / restoration', title: 'TPO roof replacement on 38,000 sq ft warehouse', budget: '$210k - $280k', timing: 'Starts Jul 1', age: 'Posted yesterday', company: 'Northstar Restoration', initials: 'NR', rating: 'Insurance current', description: 'Remove damaged roof system and install new 60 mil TPO. Detailed scope and photos attached.', bids: 8 },
  { id: 6, trade: 'Drywall & finishing', market: 'Austin', type: 'Residential new construction', title: 'Hang and finish custom home in Westlake', budget: '$28k - $38k', timing: 'Starts Jun 29', age: 'Posted 2d ago', company: 'Juniper Custom Homes', initials: 'JH', rating: '4.7 contractor rating', description: 'Approximately 19,000 board feet with level 5 finish in primary living areas.', bids: 6 },
  { id: 7, trade: 'Plumbing', market: 'Houston', type: 'Light commercial', title: 'Plumbing package for two medical suites', budget: '$65k - $85k', timing: 'Starts Aug 12', age: 'Posted 2d ago', company: 'Axis Build Partners', initials: 'AB', rating: '8 completed jobs', description: 'Underslab, rough, and trim for adjacent medical office build-outs. RMP affiliation required.', bids: 4 },
  { id: 8, trade: 'Masonry, brick & stone', market: 'San Antonio', type: 'Residential new construction', title: 'Stone and brick veneer for 8 homes', budget: '$72k - $96k', timing: 'Starts Jul 20', age: 'Posted 3d ago', company: 'Mesa Ridge Homes', initials: 'MR', rating: '4.9 contractor rating', description: 'Material staged onsite. Looking for an experienced crew to complete one elevation per week.', bids: 5 },
  { id: 9, trade: 'Excavation, grading & sitework', market: 'Texas Panhandle', type: 'Light commercial', title: 'Sitework and pad prep for retail building', budget: '$110k - $150k', timing: 'Starts Aug 5', age: 'Posted 3d ago', company: 'High Plains Construction', initials: 'HP', rating: 'Texas contractor profile', description: 'Clearing, grading, building pad, utilities trenching, and paving subgrade for 1.8-acre site.', bids: 2 }
];

const selects = {
  heroTrade: document.getElementById('heroTrade'), tradeFilter: document.getElementById('tradeFilter'), postTrade: document.getElementById('postTrade'),
  heroMarket: document.getElementById('heroMarket'), marketFilter: document.getElementById('marketFilter'), postMarket: document.getElementById('postMarket'),
  typeFilter: document.getElementById('typeFilter'), postType: document.getElementById('postType')
};

function fillSelect(select, values, includeAll = false) {
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

[selects.heroTrade, selects.tradeFilter, selects.postTrade].forEach(select => fillSelect(select, trades.map(([name]) => name)));
[selects.heroMarket, selects.marketFilter, selects.postMarket].forEach(select => fillSelect(select, markets));
[selects.typeFilter, selects.postType].forEach(select => fillSelect(select, projectTypes));

function renderJobs() {
  const trade = selects.tradeFilter.value;
  const market = selects.marketFilter.value;
  const type = selects.typeFilter.value;
  const filtered = jobs.filter(job => (trade === 'all' || job.trade === trade) && (market === 'all' || job.market === market) && (type === 'all' || job.type === type));
  const grid = document.getElementById('jobsGrid');
  grid.innerHTML = filtered.map(job => `
    <article class="job-card">
      <div class="job-topline"><span class="trade-pill">${job.trade}</span><span class="job-age">${job.age}</span></div>
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <div class="job-meta"><span><strong>${job.budget}</strong>Budget</span><span><strong>${job.timing}</strong>Target</span><span><strong>${job.bids}</strong>Bids</span></div>
      <div class="job-company"><span class="company-mark">${job.initials}</span><div><strong>${job.company}</strong><small>${job.market} &middot; ${job.rating}</small></div></div>
      <button class="text-link" type="button" data-job-id="${job.id}">View scope and bid <span aria-hidden="true">&rarr;</span></button>
    </article>`).join('');
  document.getElementById('resultCount').textContent = filtered.length;
  document.getElementById('emptyState').hidden = filtered.length > 0;
  document.querySelectorAll('[data-job-id]').forEach(button => button.addEventListener('click', () => openJob(Number(button.dataset.jobId))));
}

function resetFilters() {
  selects.tradeFilter.value = 'all';
  selects.marketFilter.value = 'all';
  selects.typeFilter.value = 'all';
  renderJobs();
}

[selects.tradeFilter, selects.marketFilter, selects.typeFilter].forEach(select => select.addEventListener('change', renderJobs));
document.getElementById('clearFilters').addEventListener('click', resetFilters);
document.getElementById('emptyReset').addEventListener('click', resetFilters);

document.getElementById('heroSearchButton').addEventListener('click', () => {
  selects.tradeFilter.value = selects.heroTrade.value;
  selects.marketFilter.value = selects.heroMarket.value;
  renderJobs();
  document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.role-option').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.role-option').forEach(option => option.classList.remove('active'));
  button.classList.add('active');
  const isSub = button.dataset.role === 'subcontractor';
  document.getElementById('heroSearchButton').innerHTML = isSub ? 'Find work to bid <span aria-hidden="true">&rarr;</span>' : 'Browse open jobs <span aria-hidden="true">&rarr;</span>';
}));

const tradeGrid = document.getElementById('tradeGrid');
let allTradesVisible = false;
function renderTrades() {
  const visibleTrades = allTradesVisible ? trades : trades.slice(0, 12);
  tradeGrid.innerHTML = visibleTrades.map(([name, icon], index) => `<button type="button" class="trade-card" data-trade-name="${name}"><span>${icon}</span><strong>${name}</strong><small>${index % 3 + 2} specialties &middot; Texas-wide</small></button>`).join('');
  document.querySelectorAll('[data-trade-name]').forEach(button => button.addEventListener('click', () => {
    selects.tradeFilter.value = button.dataset.tradeName;
    renderJobs();
    document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
  }));
}
renderTrades();
document.getElementById('showAllTrades').addEventListener('click', event => {
  allTradesVisible = !allTradesVisible;
  renderTrades();
  event.currentTarget.innerHTML = allTradesVisible ? 'Show fewer trades <span aria-hidden="true">&uarr;</span>' : 'Show all launch trades <span aria-hidden="true">&darr;</span>';
});

const backdrop = document.getElementById('modalBackdrop');
function openModal(name) {
  const modal = document.getElementById(`${name}-modal`);
  if (!modal) return;
  backdrop.hidden = false;
  modal.showModal();
}
function closeModal(modal) {
  modal.close();
  if (![...document.querySelectorAll('dialog')].some(dialog => dialog.open)) backdrop.hidden = true;
}
document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.openModal)));
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', () => closeModal(button.closest('dialog'))));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog) closeModal(dialog);
}));
backdrop.addEventListener('click', () => document.querySelectorAll('dialog[open]').forEach(closeModal));

function openJob(id) {
  const job = jobs.find(item => item.id === id);
  document.getElementById('jobDetailContent').innerHTML = `
    <div class="detail-header"><span class="trade-pill">${job.trade}</span><h2 id="jobDetailTitle">${job.title}</h2><p>${job.description}</p></div>
    <div class="detail-stats"><div><span>Budget</span><strong>${job.budget}</strong></div><div><span>Target</span><strong>${job.timing}</strong></div><div><span>Project</span><strong>${job.type}</strong></div></div>
    <div class="detail-scope"><h3>What the contractor is looking for</h3><p>A dependable ${job.trade.toLowerCase()} partner with relevant project experience, current company information, and availability for the target schedule. Full plans and private attachments become available after expressing interest.</p></div>
    <div class="job-company"><span class="company-mark">${job.initials}</span><div><strong>${job.company}</strong><small>${job.market} &middot; ${job.rating}</small></div></div>
    <button class="button button-orange button-full" type="button" id="sampleBidButton" style="margin-top:24px">Start a private bid</button>`;
  openModal('job-detail');
  document.getElementById('sampleBidButton').addEventListener('click', () => {
    closeModal(document.getElementById('job-detail-modal'));
    showToast('Bid workspace saved for the account build phase.');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('visible'), 3400);
}

document.getElementById('postJobForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const newJob = {
    id: Math.max(...jobs.map(job => job.id)) + 1,
    trade: data.get('trade'), market: data.get('market'), type: data.get('type'), title: data.get('title'), budget: data.get('budget'),
    timing: 'Timing to confirm', age: 'Posted just now', company: 'Your Company', initials: 'YC', rating: 'New contractor profile', description: data.get('description'), bids: 0
  };
  jobs.unshift(newJob);
  closeModal(document.getElementById('post-job-modal'));
  event.currentTarget.reset();
  resetFilters();
  document.getElementById('jobs').scrollIntoView({ behavior: 'smooth' });
  showToast('Your sample job is live in the prototype.');
});

document.getElementById('signInForm').addEventListener('submit', event => {
  event.preventDefault(); closeModal(document.getElementById('signin-modal')); showToast('Account sign-in will connect in the next build phase.');
});
document.getElementById('joinForm').addEventListener('submit', event => {
  event.preventDefault(); closeModal(document.getElementById('join-modal')); showToast('You are on the founding Texas network list.'); event.currentTarget.reset();
});

const menuButton = document.getElementById('menuButton');
const mobileNav = document.getElementById('mobileNav');
menuButton.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
mobileNav.querySelectorAll('a,button').forEach(item => item.addEventListener('click', () => {
  mobileNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
}));

renderJobs();
