/* Subcontractor jobs page tabs: Find work | My bids | Work won.
   Additive module. Runs after jobs.js and awarded-work.js have defined and wrapped
   renderJobMarketplace, so the awarded "Work won" section already exists when we apply. */
(() => {
  let active = 'find';

  function findSection() {
    const grid = document.getElementById('availableJobGrid');
    return grid ? grid.closest('.job-section') : null;
  }

  function ensureBidsSection() {
    let section = document.getElementById('outstandingBidsSection');
    if (section) return section;
    const available = findSection();
    if (!available) return null;
    section = document.createElement('section');
    section.className = 'job-section outstanding-bids-section';
    section.id = 'outstandingBidsSection';
    section.hidden = true;
    section.style.display = 'none';
    section.innerHTML = '<div class="card-heading"><div><span class="kicker">Outstanding bids</span><h2>Bids awaiting a decision</h2><p>Jobs you have bid on. Update your bid or message the contractor while you wait for their decision.</p></div></div><div class="market-job-grid" id="outstandingBidsGrid"></div>';
    available.after(section);
    return section;
  }

  function ensureTabs() {
    let tabs = document.getElementById('jobTabs');
    if (tabs) return tabs;
    const heading = document.querySelector('#jobsView .page-heading');
    if (!heading) return null;
    tabs = document.createElement('div');
    tabs.className = 'job-tabs';
    tabs.id = 'jobTabs';
    tabs.innerHTML = '<button class="job-tab active" type="button" data-job-tab="find">Find work</button><button class="job-tab" type="button" data-job-tab="bids">My bids<span class="job-tab-count" id="jobTabBidsCount"></span></button><button class="job-tab" type="button" data-job-tab="won">Work won<span class="job-tab-count" id="jobTabWonCount"></span></button>';
    heading.after(tabs);
    tabs.querySelectorAll('[data-job-tab]').forEach(button => button.addEventListener('click', () => { active = button.dataset.jobTab; applyTabs(); }));
    return tabs;
  }

  function setVisible(element, on) {
    if (!element) return;
    element.hidden = !on;
    element.style.display = on ? '' : 'none';
  }

  function applyTabs() {
    const tabs = ensureTabs();
    const bids = ensureBidsSection();
    if (typeof dashboard === 'undefined' || !dashboard || !dashboard.company) return;
    const isSub = dashboard.company.capabilities.includes('subcontractor');
    if (tabs) tabs.classList.toggle('show', isSub);
    if (!isSub) { setVisible(bids, false); return; }
    const pending = dashboard.availableJobs.filter(job => job.myBid).length;
    const won = (dashboard.submittedBids || []).filter(bid => bid.status === 'accepted').length;
    const bidsCount = document.getElementById('jobTabBidsCount');
    if (bidsCount) bidsCount.textContent = pending || '';
    const wonCount = document.getElementById('jobTabWonCount');
    if (wonCount) wonCount.textContent = won || '';
    if (tabs) tabs.querySelectorAll('[data-job-tab]').forEach(button => button.classList.toggle('active', button.dataset.jobTab === active));
    setVisible(findSection(), active === 'find');
    setVisible(bids, active === 'bids');
    setVisible(document.getElementById('awardedWorkSection'), active === 'won');
  }

  ensureTabs();
  ensureBidsSection();
  if (typeof renderJobMarketplace !== 'undefined') {
    const base = renderJobMarketplace;
    renderJobMarketplace = function () { base(); applyTabs(); };
  }
  const timer = setInterval(() => { if (typeof dashboard !== 'undefined' && dashboard) { clearInterval(timer); applyTabs(); } }, 100);
  setTimeout(() => clearInterval(timer), 10000);
})();
