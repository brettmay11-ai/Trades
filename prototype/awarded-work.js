(()=>{
  function ensureSection(){
    let section=document.getElementById('awardedWorkSection');
    if(section)return section;
    section=document.createElement('section');
    section.className='job-section awarded-work-section';
    section.id='awardedWorkSection';
    section.innerHTML='<div class="card-heading"><div><span class="kicker">Work won</span><h2>Awarded Work</h2><p>Every job awarded to your company, with the accepted bid and shared project details.</p></div><button class="text-link" type="button" data-awarded-calendar>Open calendar</button></div><div class="awarded-work-grid" id="awardedWorkGrid"></div>';
    document.getElementById('availableJobGrid').closest('.job-section').before(section);
    section.querySelector('[data-awarded-calendar]').onclick=()=>switchView('calendar');
    return section;
  }

  function awardedWorkCard(bid){
    const job=bid.job,contractor=job.postingCompany,status=job.status==='completed'?'Completed':'In progress';
    const dates=job.startDate&&job.endDate?`${fmtJobDate(job.startDate)} - ${fmtJobDate(job.endDate)}`:fmtJobDate(job.startDate);
    return `<article class="awarded-work-card">
      <div class="awarded-work-topline"><span class="trade-pill">${escapeHtml(job.trade)}</span><span class="connection-status accepted">${status}</span></div>
      <h3>${escapeHtml(job.title)}</h3>
      <div class="awarded-work-value"><small>Awarded bid</small><strong>${escapeHtml(bid.amount)}</strong></div>
      <div class="awarded-work-facts">
        <span><small>Contractor</small><strong>${escapeHtml(contractor.name)}</strong></span>
        <span><small>Location</small><strong>${escapeHtml(job.city)}, ${escapeHtml(job.state)}</strong></span>
        <span><small>Project dates</small><strong>${escapeHtml(dates)}</strong></span>
        <span><small>Project type</small><strong>${escapeHtml(job.projectType||'Construction project')}</strong></span>
        <span><small>Posted budget</small><strong>${escapeHtml(fmtBudget(job.budget))}</strong></span>
      </div>
      <div class="awarded-work-detail"><small>Job scope</small><p>${escapeHtml(job.description||'No job scope provided.')}</p></div>
      <div class="awarded-work-detail"><small>Accepted scope</small><p>${escapeHtml(bid.scope||'No bid scope provided.')}</p></div>
      <div class="awarded-work-detail"><small>Proposed schedule</small><p>${escapeHtml(bid.schedule||'No proposed schedule provided.')}</p></div>
      ${job.calendarNotes?`<div class="awarded-work-note"><small>Shared schedule notes</small><p>${escapeHtml(job.calendarNotes)}</p></div>`:''}
      <div class="market-job-actions"><button class="button button-orange" type="button" data-awarded-message="${job.id}" data-company="${contractor.id}">Message contractor</button><button class="button button-outline" type="button" data-awarded-calendar-job="${job.id}">Open calendar</button></div>
    </article>`;
  }

  function renderAwardedWork(){
    if(typeof dashboard==='undefined'||!dashboard?.company)return;
    const section=ensureSection(),isSub=dashboard.company.capabilities.includes('subcontractor');
    section.hidden=!isSub;
    section.style.display=isSub?'':'none';
    if(!isSub)return;
    const awarded=(dashboard.submittedBids||[]).filter(bid=>bid.status==='accepted').sort((a,b)=>String(b.job.awardedAt||b.updatedAt||'').localeCompare(String(a.job.awardedAt||a.updatedAt||'')));
    document.getElementById('awardedWorkGrid').innerHTML=awarded.length?awarded.map(awardedWorkCard).join(''):'<div class="list-empty">Awarded bids will appear here with the job scope, accepted amount, contractor, and shared schedule.</div>';
    section.querySelectorAll('[data-awarded-message]').forEach(button=>button.onclick=()=>messageJob(button.dataset.awardedMessage,button.dataset.company));
    section.querySelectorAll('[data-awarded-calendar-job]').forEach(button=>button.onclick=()=>switchView('calendar'));
  }

  const baseRenderJobMarketplace=renderJobMarketplace;
  renderJobMarketplace=function(){baseRenderJobMarketplace();renderAwardedWork()};
  const timer=setInterval(()=>{if(typeof dashboard!=='undefined'&&dashboard){clearInterval(timer);renderAwardedWork()}},100);
  setTimeout(()=>clearInterval(timer),10000);
})();
