const roleViews={
  contractor:{
    cta:'Create contractor workspace',
    preview:`<div class="preview-window" data-preview="contractor">
      <div class="preview-chrome"><span></span><span></span><span></span><strong>Contractor workspace</strong><small>trades.app/dashboard</small></div>
      <div class="preview-app">
        <nav class="preview-nav"><div class="preview-logo">T</div><span class="selected">Overview</span><span>My jobs</span><span>Bids</span><span>Network</span><span>Messages</span><div class="preview-user">BH</div></nav>
        <div class="preview-main">
          <div class="preview-heading"><div><small>Good morning, Brett</small><h3>Keep your projects moving.</h3></div><button>+ Post a job</button></div>
          <div class="preview-stats"><span><small>Open jobs</small><strong>8</strong><em>3 closing soon</em></span><span><small>New bids</small><strong>14</strong><em>Since Monday</em></span><span><small>Trade partners</small><strong>36</strong><em>5 trusted</em></span></div>
          <div class="preview-columns"><div class="preview-list"><div class="preview-section-title"><strong>Active jobs</strong><small>View all</small></div><article><i class="trade-mark orange">FR</i><div><strong>Framing crew needed</strong><small>Plano, TX · Starts Jun 22</small></div><b>6 bids</b></article><article><i class="trade-mark green">EL</i><div><strong>Electrical rough-in</strong><small>Frisco, TX · Starts Jul 01</small></div><b>4 bids</b></article><article><i class="trade-mark gold">HV</i><div><strong>HVAC installation</strong><small>McKinney, TX · Starts Jul 08</small></div><b>2 bids</b></article></div><aside class="preview-activity"><div class="preview-section-title"><strong>New bids</strong><small>Today</small></div><div class="bid-person"><i>JM</i><span><strong>J&M Framing</strong><small>Bid on Framing crew</small></span><b>$18.4k</b></div><div class="bid-person"><i>AP</i><span><strong>All-Pro Electric</strong><small>Bid on Electrical rough-in</small></span><b>$9.8k</b></div><button class="preview-action">Compare bids</button></aside></div>
        </div>
      </div>
    </div>`
  },
  subcontractor:{
    cta:'Create subcontractor workspace',
    preview:`<div class="preview-window" data-preview="subcontractor">
      <div class="preview-chrome"><span></span><span></span><span></span><strong>Subcontractor workspace</strong><small>trades.app/jobs</small></div>
      <div class="preview-app">
        <nav class="preview-nav"><div class="preview-logo">T</div><span class="selected">Find jobs</span><span>My bids</span><span>Network</span><span>Messages</span><span>Profile</span><div class="preview-user sub-user">JM</div></nav>
        <div class="preview-main">
          <div class="preview-heading"><div><small>Jobs near Dallas, TX</small><h3>Find the right work for your crew.</h3></div><button>Update profile</button></div>
          <div class="preview-search"><span>Framing</span><span>Within 50 miles</span><button>Search jobs</button></div>
          <div class="preview-columns sub-columns"><div class="preview-list opportunity-list"><div class="preview-section-title"><strong>Recommended opportunities</strong><small>24 matches</small></div><article><i class="trade-mark orange">FR</i><div><strong>Framing crew needed</strong><small>Plano · Posted 2 hours ago</small><em>Verified contractor · 6 week project</em></div><b>View job</b></article><article><i class="trade-mark green">DW</i><div><strong>Commercial drywall install</strong><small>Irving · Posted yesterday</small><em>12,000 sq ft · Plans attached</em></div><b>View job</b></article></div><aside class="preview-activity profile-ready"><div class="profile-ring"><strong>86%</strong></div><strong>Profile strength</strong><small>Add recent project photos to stand out.</small><div class="profile-check"><span>✓</span> Insurance added</div><div class="profile-check"><span>✓</span> 3 trade references</div><button class="preview-action">Finish profile</button></aside></div>
        </div>
      </div>
    </div>`
  }
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
