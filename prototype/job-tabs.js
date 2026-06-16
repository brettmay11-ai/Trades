/* Role-aware tabs on the jobs page.
   Subcontractor: Find work | My bids | Work won.
   Contractor:    Posted jobs | Awarded jobs.
   A dual-capability company sees all five. Additive module: runs after jobs.js
   and awarded-work.js have defined and wrapped renderJobMarketplace, so the
   awarded "Work won" section already exists when we apply. */
(() => {
  let active = null;

  function findSection() {
    const grid = document.getElementById('availableJobGrid');
    return grid ? grid.closest('.job-section') : null;
  }
  function setVisible(element, on) {
    if (!element) return;
    element.hidden = !on;
    element.style.display = on ? '' : 'none';
  }
  function makeSection(id, cls, anchor, html) {
    if (!anchor || document.getElementById(id)) return;
    const section = document.createElement('section');
    section.className = 'job-section ' + cls;
    section.id = id;
    section.hidden = true;
    section.style.display = 'none';
    section.innerHTML = html;
    anchor.after(section);
  }
  function ensureSections() {
    makeSection('outstandingBidsSection', 'outstanding-bids-section', findSection(),
      '<div class="card-heading"><div><span class="kicker">Outstanding bids</span><h2>Bids awaiting a decision</h2><p>Jobs you have bid on. Update your bid or message the contractor while you wait for their decision.</p></div></div><div class="market-job-grid" id="outstandingBidsGrid"></div>');
    makeSection('contractorAwardedSection', 'contractor-awarded-section', document.getElementById('postedJobsSection'),
      '<div class="card-heading"><div><span class="kicker">Awarded jobs</span><h2>Jobs you have awarded</h2><p>Jobs you posted that have been awarded to a subcontractor.</p></div></div><div class="market-job-grid" id="contractorAwardedGrid"></div>');
  }

  const DEFS = {
    find: { label: 'Find work', sections: () => [findSection()] },
    bids: { label: 'My bids', sections: () => [document.getElementById('outstandingBidsSection')], count: () => dashboard.availableJobs.filter(job => job.myBid).length },
    won: { label: 'Work won', sections: () => [document.getElementById('awardedWorkSection')], count: () => (dashboard.submittedBids || []).filter(bid => bid.status === 'accepted').length },
    posted: { label: 'Posted jobs', sections: () => [document.getElementById('postedJobsSection')], count: () => dashboard.postedJobs.filter(job => job.status === 'published').length },
    awarded: { label: 'Awarded jobs', sections: () => [document.getElementById('contractorAwardedSection')], count: () => dashboard.postedJobs.filter(job => job.status !== 'published').length }
  };

  function tabKeys() {
    const caps = dashboard.company.capabilities || [];
    const keys = [];
    if (caps.includes('subcontractor')) keys.push('find', 'bids', 'won');
    if (caps.includes('contractor')) keys.push('posted', 'awarded');
    return keys;
  }

  function ensureTabs(keys) {
    const heading = document.querySelector('#jobsView .page-heading');
    if (!heading) return null;
    let tabs = document.getElementById('jobTabs');
    if (!tabs) {
      tabs = document.createElement('div');
      tabs.className = 'job-tabs';
      tabs.id = 'jobTabs';
      heading.after(tabs);
    }
    if (tabs.dataset.keys !== keys.join(',')) {
      tabs.dataset.keys = keys.join(',');
      tabs.style.gridTemplateColumns = 'repeat(' + keys.length + ',1fr)';
      tabs.innerHTML = keys.map((key, index) => '<button class="job-tab' + (index === 0 ? ' active' : '') + '" type="button" data-job-tab="' + key + '">' + DEFS[key].label + '<span class="job-tab-count" id="jobTabCount-' + key + '"></span></button>').join('');
      tabs.querySelectorAll('[data-job-tab]').forEach(button => button.addEventListener('click', () => { active = button.dataset.jobTab; applyTabs(); }));
      active = keys[0];
    }
    return tabs;
  }

  function applyTabs() {
    if (typeof dashboard === 'undefined' || !dashboard || !dashboard.company) return;
    ensureSections();
    const keys = tabKeys();
    const tabs = ensureTabs(keys);
    if (!tabs) return;
    const postedJobs = document.getElementById('postedJobsSection');
    if (postedJobs && postedJobs.previousElementSibling !== tabs) tabs.after(postedJobs);
    tabs.classList.toggle('show', keys.length > 0);
    if (!keys.length) return;
    if (!keys.includes(active)) active = keys[0];
    keys.forEach(key => {
      const countEl = document.getElementById('jobTabCount-' + key);
      if (countEl) { const count = DEFS[key].count ? DEFS[key].count() : 0; countEl.textContent = count || ''; }
      const button = tabs.querySelector('[data-job-tab="' + key + '"]');
      if (button) button.classList.toggle('active', key === active);
      DEFS[key].sections().forEach(element => setVisible(element, key === active));
    });
  }

  ensureSections();
  if (typeof renderJobMarketplace !== 'undefined') {
    const base = renderJobMarketplace;
    renderJobMarketplace = function () { base(); applyTabs(); };
  }
  const timer = setInterval(() => { if (typeof dashboard !== 'undefined' && dashboard) { clearInterval(timer); applyTabs(); } }, 100);
  setTimeout(() => clearInterval(timer), 10000);
})();
