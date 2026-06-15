(()=>{
  const phone=()=>window.matchMedia('(max-width:768px)').matches;
  const labels={overview:'Dashboard',jobs:'Jobs',messages:'Messages',network:'Trade Network',profile:'Profile',calendar:'Calendar',notifications:'Notifications'};
  const subtitles={overview:'Your company workspace',jobs:'Nearby opportunities',messages:'Company conversations',network:'Trusted trade partners',profile:'Company details',calendar:'Shared project schedule',notifications:'Recent activity'};
  const body=document.body,bar=document.createElement('header');
  bar.className='mobile-app-bar';
  bar.innerHTML='<div class="mobile-app-brand">T</div><div class="mobile-app-title"><strong>Dashboard</strong><small>Your company workspace</small></div><div class="mobile-app-actions"><button class="mobile-app-action" type="button" data-mobile-notifications aria-label="Notifications"><span class="material-symbols-outlined" aria-hidden="true">notifications</span><b class="mobile-notification-badge"></b></button><button class="mobile-app-action" type="button" data-mobile-calendar aria-label="Calendar"><span class="material-symbols-outlined" aria-hidden="true">calendar_month</span></button><button class="mobile-app-action mobile-signout-action" type="button" data-mobile-signout aria-label="Sign out"><span class="material-symbols-outlined" aria-hidden="true">logout</span></button></div>';
  body.prepend(bar);
  const title=bar.querySelector('.mobile-app-title strong'),subtitle=bar.querySelector('.mobile-app-title small'),badge=bar.querySelector('.mobile-notification-badge');
  const activeView=()=>document.querySelector('.dashboard-nav nav button.active')?.dataset.view||'overview';
  function syncBar(view=activeView()){title.textContent=labels[view]||'Trades';subtitle.textContent=subtitles[view]||'Company workspace';badge.textContent=document.getElementById('notificationCount')?.textContent||''}
  bar.querySelector('[data-mobile-notifications]').onclick=()=>document.querySelector('[data-view="notifications"]')?.click();
  bar.querySelector('[data-mobile-calendar]').onclick=()=>document.querySelector('[data-view="calendar"]')?.click();
  bar.querySelector('[data-mobile-signout]').onclick=()=>document.getElementById('signOut')?.click();
  function repairPrimaryNav(){const icons={overview:'dashboard',jobs:'handyman',messages:'forum',network:'groups',profile:'person'},short={overview:'Home',jobs:'Jobs',messages:'Messages',network:'Network',profile:'Profile'};Object.keys(icons).forEach(view=>{const button=document.querySelector(`.dashboard-nav [data-view="${view}"]`);if(!button)return;const existingText=button.querySelector('.nav-text'),label=existingText?.textContent.trim()||button.textContent.trim()||labels[view];if(!existingText)button.innerHTML=`<span class="material-symbols-outlined nav-icon" aria-hidden="true">${icons[view]}</span><span class="nav-text" data-short="${short[view]}">${label}</span>`;const icon=button.querySelector('.nav-icon');if(icon&&icon.textContent!==icons[view])icon.textContent=icons[view]})}
  repairPrimaryNav();
  const originalSwitchView=window.switchView;window.switchView=function(name,...args){originalSwitchView(name,...args);repairPrimaryNav();if(name!=='messages')document.querySelector('.messaging-shell')?.classList.remove('mobile-chat-open');syncBar(name)};
  const header=document.querySelector('.message-header');
  if(header&&!header.querySelector('.mobile-message-back')){const back=document.createElement('button');back.type='button';back.className='mobile-message-back';back.setAttribute('aria-label','Back to conversations');back.innerHTML='&larr;';back.onclick=()=>document.querySelector('.messaging-shell')?.classList.remove('mobile-chat-open');header.prepend(back)}
  const originalOpenConversation=window.openConversation;window.openConversation=async function(...args){await originalOpenConversation(...args);if(phone())document.querySelector('.messaging-shell')?.classList.add('mobile-chat-open')};
  new MutationObserver(()=>{repairPrimaryNav();syncBar()}).observe(document.querySelector('.dashboard-nav nav'),{subtree:true,childList:true,characterData:true,attributes:true});
  syncBar();
})();
