(()=>{
  const phone=()=>window.matchMedia('(max-width:768px)').matches;
  const labels={overview:'Dashboard',jobs:'Jobs',messages:'Messages',network:'Trade Network',profile:'Profile',calendar:'Calendar',notifications:'Notifications'};
  const subtitles={overview:'Your company workspace',jobs:'Nearby opportunities',messages:'Company conversations',network:'Trusted trade partners',profile:'Company details',calendar:'Shared project schedule',notifications:'Recent activity'};
  const body=document.body,bar=document.createElement('header'),backdrop=document.createElement('button'),sheet=document.createElement('section');
  bar.className='mobile-app-bar';
  bar.innerHTML='<div class="mobile-app-brand">T</div><div class="mobile-app-title"><strong>Dashboard</strong><small>Your company workspace</small></div><button class="mobile-app-action" type="button" data-mobile-notifications aria-label="Notifications"><span class="material-symbols-outlined" aria-hidden="true">notifications</span><b class="mobile-notification-badge"></b></button><button class="mobile-app-action" type="button" data-mobile-more aria-label="More account actions"><span class="material-symbols-outlined" aria-hidden="true">more_horiz</span></button>';
  backdrop.className='mobile-sheet-backdrop';backdrop.type='button';backdrop.setAttribute('aria-label','Close menu');
  sheet.className='mobile-more-sheet';sheet.setAttribute('aria-label','More account actions');
  sheet.innerHTML='<div class="mobile-sheet-head"><div><strong>More</strong><small>Schedule and account tools</small></div><button class="mobile-sheet-close" type="button" aria-label="Close menu">&times;</button></div><div class="mobile-sheet-actions"><button type="button" data-mobile-view="calendar"><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span>Calendar</button><button type="button" data-mobile-view="notifications"><span class="material-symbols-outlined" aria-hidden="true">notifications</span>Notifications</button><button type="button" data-mobile-view="profile"><span class="material-symbols-outlined" aria-hidden="true">manage_accounts</span>Account & profile</button><button type="button" data-mobile-signout><span class="material-symbols-outlined" aria-hidden="true">logout</span>Sign out</button></div>';
  body.prepend(bar);body.append(backdrop,sheet);
  const title=bar.querySelector('.mobile-app-title strong'),subtitle=bar.querySelector('.mobile-app-title small'),badge=bar.querySelector('.mobile-notification-badge');
  const activeView=()=>document.querySelector('.dashboard-nav nav button.active')?.dataset.view||'overview';
  function syncBar(view=activeView()){title.textContent=labels[view]||'Trades';subtitle.textContent=subtitles[view]||'Company workspace';badge.textContent=document.getElementById('notificationCount')?.textContent||''}
  function closeSheet(){sheet.classList.remove('open');backdrop.classList.remove('open')}function openSheet(){sheet.classList.add('open');backdrop.classList.add('open')}
  bar.querySelector('[data-mobile-more]').onclick=openSheet;backdrop.onclick=closeSheet;sheet.querySelector('.mobile-sheet-close').onclick=closeSheet;
  bar.querySelector('[data-mobile-notifications]').onclick=()=>{document.querySelector('[data-view="notifications"]')?.click();closeSheet()};
  sheet.querySelectorAll('[data-mobile-view]').forEach(button=>button.onclick=()=>{document.querySelector(`[data-view="${button.dataset.mobileView}"]`)?.click();closeSheet()});
  sheet.querySelector('[data-mobile-signout]').onclick=()=>document.getElementById('signOut')?.click();
  function repairPrimaryNav(){const icons={overview:'dashboard',jobs:'handyman',messages:'forum',network:'groups',profile:'person'},short={overview:'Home',jobs:'Jobs',messages:'Messages',network:'Network',profile:'Profile'};Object.keys(icons).forEach(view=>{const button=document.querySelector(`.dashboard-nav [data-view="${view}"]`);if(!button)return;const existingText=button.querySelector('.nav-text'),label=existingText?.textContent.trim()||button.textContent.trim()||labels[view];if(!existingText)button.innerHTML=`<span class="material-symbols-outlined nav-icon" aria-hidden="true">${icons[view]}</span><span class="nav-text" data-short="${short[view]}">${label}</span>`;const icon=button.querySelector('.nav-icon');if(icon&&icon.textContent!==icons[view])icon.textContent=icons[view]})}
  repairPrimaryNav();
  const originalSwitchView=window.switchView;window.switchView=function(name,...args){originalSwitchView(name,...args);repairPrimaryNav();if(name!=='messages')document.querySelector('.messaging-shell')?.classList.remove('mobile-chat-open');syncBar(name);closeSheet()};
  const header=document.querySelector('.message-header');
  if(header&&!header.querySelector('.mobile-message-back')){const back=document.createElement('button');back.type='button';back.className='mobile-message-back';back.setAttribute('aria-label','Back to conversations');back.innerHTML='&larr;';back.onclick=()=>document.querySelector('.messaging-shell')?.classList.remove('mobile-chat-open');header.prepend(back)}
  const originalOpenConversation=window.openConversation;window.openConversation=async function(...args){await originalOpenConversation(...args);if(phone())document.querySelector('.messaging-shell')?.classList.add('mobile-chat-open')};
  new MutationObserver(()=>{repairPrimaryNav();syncBar()}).observe(document.querySelector('.dashboard-nav nav'),{subtree:true,childList:true,characterData:true,attributes:true});
  window.addEventListener('resize',()=>{if(!phone())closeSheet()});syncBar();
})();
