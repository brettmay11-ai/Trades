const contractorJobs=[
  {trade:'Framing',title:'Framing crew needed',location:'Plano, TX',meta:'Starts Jun 22',budget:'$18k - $24k',bids:'6 bids',tone:'orange'},
  {trade:'Electrical',title:'Electrical rough-in',location:'Frisco, TX',meta:'Starts Jul 1',budget:'$9k - $14k',bids:'4 bids',tone:'green'},
  {trade:'HVAC',title:'HVAC installation',location:'McKinney, TX',meta:'Starts Jul 8',budget:'$22k - $30k',bids:'2 bids',tone:'gold'}
];

const subcontractorJobs=[
  {trade:'Drywall',title:'Commercial drywall install',location:'Irving, TX',meta:'14 miles away',budget:'$32k - $44k',detail:'Starts Jul 8',tone:'green'},
  {trade:'Tile',title:'Tile package for 18 townhomes',location:'Dallas, TX',meta:'8 miles away',budget:'$18k - $25k',detail:'Starts Jun 29',tone:'orange'},
  {trade:'Framing',title:'Framing crew for custom homes',location:'Plano, TX',meta:'21 miles away',budget:'$42k - $58k',detail:'Starts Jul 15',tone:'gold'}
];

const jobCard=(job,role)=>`<article class="hero-job-card">
  <div class="hero-job-topline"><span class="hero-trade ${job.tone}">${job.trade}</span><span class="hero-job-status">${role==='contractor'?job.bids:'Verified contractor'}</span></div>
  <h3>${job.title}</h3>
  <p class="hero-job-location"><span aria-hidden="true">&#9679;</span>${job.location}<small>${job.meta}</small></p>
  <div class="hero-job-footer"><div><small>Estimated value</small><strong>${job.budget}</strong></div><button type="button">${role==='contractor'?'Review bids':'View & bid'}</button></div>
  ${role==='subcontractor'?`<p class="hero-job-start">${job.detail}<span>Plans attached</span></p>`:''}
</article>`;

const preview=(role,jobs)=>`<div class="role-marketplace-preview" data-preview="${role}">
  <div class="role-preview-heading"><div><span>${role==='contractor'?'Your posted jobs':'Matched to your profile'}</span><h2>${role==='contractor'?'Watch qualified bids come in.':'Good work, close to your crew.'}</h2></div><strong>${role==='contractor'?'12 new bids':'24 nearby jobs'}</strong></div>
  <div class="hero-job-stack">${jobs.map(job=>jobCard(job,role)).join('')}</div>
  <div class="role-preview-note"><span aria-hidden="true">&#10003;</span>${role==='contractor'?'Compare experience, credentials, and pricing before you hire.':'Filtered by trade, location, travel radius, and availability.'}</div>
</div>`;

const roleViews={
  contractor:{cta:'Create contractor workspace',preview:preview('contractor',contractorJobs)},
  subcontractor:{cta:'Create subcontractor workspace',preview:preview('subcontractor',subcontractorJobs)}
};

const rolePreview=document.getElementById('rolePreview');
const roleCta=document.getElementById('rolePrimaryCta');
const roleButtons=[...document.querySelectorAll('[data-role]')];

function selectRole(role){
  const view=roleViews[role]||roleViews.contractor;
  roleButtons.forEach(button=>{const selected=button.dataset.role===role;button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1});
  rolePreview.classList.remove('preview-enter');
  rolePreview.innerHTML=view.preview;
  requestAnimationFrame(()=>rolePreview.classList.add('preview-enter'));
  roleCta.querySelector('[data-role-cta]').textContent=view.cta;
  roleCta.href=`/signup?role=${role}`;
}

roleButtons.forEach((button,index)=>{
  button.addEventListener('click',()=>selectRole(button.dataset.role));
  button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const direction=event.key==='ArrowRight'?1:-1;const next=(index+direction+roleButtons.length)%roleButtons.length;roleButtons[next].focus();selectRole(roleButtons[next].dataset.role)});
});

selectRole('contractor');
document.querySelector('.hero-search')?.remove();
