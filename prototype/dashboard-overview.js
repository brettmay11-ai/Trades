(()=>{
  const overview=document.getElementById('overviewView');
  overview.innerHTML='<div class="stat-grid" id="statGrid"></div><div class="dashboard-columns"><article class="workspace-card"><div class="card-heading"><div><span class="kicker">Inbox</span><h2>Recent conversations</h2></div><button class="text-link" type="button" data-dashboard-view="messages">Open inbox</button></div><div id="recentConversations"></div></article><article class="workspace-card"><div class="card-heading"><div><span class="kicker">Shared schedule</span><h2>Jobs this week</h2></div><button class="text-link" type="button" data-dashboard-view="calendar">Open calendar</button></div><div id="setupSteps"></div></article></div><div class="dashboard-role-grid"><article class="workspace-card" id="dashboardPrimaryCard"></article><div class="dashboard-role-stack" id="dashboardSecondaryCards"></div></div>';

  const safe=value=>escapeHtml(value||''),dateText=value=>value?new Date(`${String(value).slice(0,10)}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Flexible';
  function cardHeading(kicker,title,action,view){return`<div class="card-heading"><div><span class="kicker">${kicker}</span><h2>${title}</h2></div>${action?`<button class="text-link" type="button" data-dashboard-view="${view}">${action}</button>`:''}</div>`}
  function list(items,empty){return items.length?`<div class="dashboard-list">${items.join('')}</div>`:`<div class="list-empty">${empty}</div>`}
  function listItem(title,meta,badge='',view='jobs',jobId=''){return`<button class="dashboard-list-item" type="button" data-dashboard-view="${view}" ${jobId?`data-dashboard-job="${jobId}"`:''}><span><strong>${safe(title)}</strong><small>${safe(meta)}</small></span>${badge?`<b>${safe(badge)}</b>`:''}</button>`}
  function jobsThisWeek(){
    const today=new Date();today.setHours(0,0,0,0);const end=new Date(today);end.setDate(end.getDate()+7);
    return(dashboard.scheduledJobs||[]).filter(job=>{const start=new Date(`${job.startDate}T12:00:00`),finish=new Date(`${job.endDate}T12:00:00`);return start<=end&&finish>=today}).sort((a,b)=>a.startDate.localeCompare(b.startDate));
  }
  function scheduleMarkup(){
    const jobs=jobsThisWeek().slice(0,3);
    return jobs.length?jobs.map(job=>{const date=new Date(`${job.startDate}T12:00:00`),partner=safe(job.partnerCompany?.name||'Trade partner'),location=[safe(job.city),safe(job.state)].filter(Boolean).join(', ');return`<button class="dashboard-week-item" type="button" data-dashboard-view="calendar"><span class="dashboard-week-date"><strong>${date.getDate()}</strong><small>${date.toLocaleDateString('en-US',{month:'short'})}</small></span><span class="dashboard-week-copy"><strong>${safe(job.title)}</strong><span class="dashboard-week-reference"><small>${partner}</small>${location?`<small>${location}</small>`:''}</span></span><span class="dashboard-week-arrow" aria-hidden="true">&rarr;</span></button>`}).join(''):'<div class="list-empty">No scheduled work in the next seven days.</div>';
  }
  function contractorOverview(){
    const posted=dashboard.postedJobs||[],open=posted.filter(job=>job.status==='published'),inProgress=posted.filter(job=>job.status==='awarded'),bidsToReview=open.reduce((sum,job)=>sum+(job.bidCount||0),0),week=jobsThisWeek().length;
    document.getElementById('statGrid').innerHTML=`<div><span>Open postings</span><strong>${open.length}</strong><small>currently accepting bids</small></div><div><span>Bids to review</span><strong>${bidsToReview}</strong><small>across open jobs</small></div><div><span>Jobs in progress</span><strong>${inProgress.length}</strong><small>awarded active projects</small></div><div><span>Jobs this week</span><strong>${week}</strong><small>on your shared calendar</small></div>`;
    document.getElementById('dashboardPrimaryCard').innerHTML=cardHeading('Contractor pipeline','Posted jobs','Manage jobs','jobs')+list(posted.slice(0,5).map(job=>listItem(job.title,`${job.trade} · ${job.city}, ${job.state}`,`${job.bidCount||0} bids`)), 'Post a job to start receiving private bids.');
    document.getElementById('dashboardSecondaryCards').innerHTML=`<article class="workspace-card">${cardHeading('Active projects','Jobs in progress','Open calendar','calendar')}${list(inProgress.slice(0,4).map(job=>listItem(job.title,`${dateText(job.startDate)} - ${dateText(job.endDate)}`,job.status,'calendar')), 'Awarded jobs will appear here once work is scheduled.')}</article>`;
  }
  function subcontractorOverview(){
    const bids=dashboard.submittedBids||[],outstanding=bids.filter(bid=>bid.status==='submitted'),awarded=bids.filter(bid=>bid.status==='accepted'),matched=(dashboard.availableJobs||[]).filter(job=>!job.myBid).slice(0,3);
    document.getElementById('statGrid').innerHTML=`<div><span>Jobs for you</span><strong>${matched.length}</strong><small>top unbid matches</small></div><div><span>Outstanding bids</span><strong>${outstanding.length}</strong><small>waiting on contractors</small></div><div><span>Awarded bids</span><strong>${awarded.length}</strong><small>work won on Trades</small></div><div><span>Jobs this week</span><strong>${jobsThisWeek().length}</strong><small>on your shared calendar</small></div>`;
    document.getElementById('dashboardPrimaryCard').innerHTML=cardHeading('Matched opportunities','Jobs for you','Find more jobs','jobs')+list(matched.map(job=>listItem(job.title,`${job.trade} · ${job.city}, ${job.state}${Number.isFinite(job.distanceMiles)?` · ${job.distanceMiles} mi`:''}`,'View job','jobs',job.id)), 'No new unbid jobs match your trades and service area yet.');
    document.getElementById('dashboardSecondaryCards').innerHTML=`<article class="workspace-card">${cardHeading('Bid pipeline','Outstanding bids','View all','jobs')}${list(outstanding.slice(0,3).map(bid=>listItem(bid.job.title,`${bid.amount} · Submitted ${dateText(bid.updatedAt||bid.createdAt)}`,'Pending')), 'You have no bids waiting for a decision.') }</article><article class="workspace-card">${cardHeading('Work won','Awarded bids','Open calendar','calendar')}${list(awarded.slice(0,3).map(bid=>listItem(bid.job.title,`${bid.amount} · ${bid.job.postingCompany?.name||'Contractor'}`,'Awarded','calendar')), 'Awarded bids will appear here.')}</article>`;
  }
  function bindOverview(){
    overview.querySelectorAll('[data-dashboard-view]').forEach(button=>button.onclick=()=>{const view=button.dataset.dashboardView;switchView(view);if(button.dataset.dashboardJob&&view==='jobs')setTimeout(()=>document.querySelector(`[data-bid-job="${button.dataset.dashboardJob}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),80)});
  }
  function renderRoleOverview(){
    if(!dashboard?.company)return;
    document.getElementById('setupSteps').innerHTML=scheduleMarkup();
    dashboard.company.capabilities.includes('contractor')?contractorOverview():subcontractorOverview();
    bindOverview();
  }
  const baseRenderShell=renderShell;renderShell=function(){baseRenderShell();renderRoleOverview()};
  if(typeof dashboard!=='undefined'&&dashboard)renderRoleOverview();
})();
