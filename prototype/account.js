const notice=document.getElementById('accountNotice');
const signupForm=document.getElementById('signupForm');
const loginForm=document.getElementById('loginForm');
const pageParams=new URLSearchParams(location.search);
const inviteToken=pageParams.get('invite');
const selectedRole=['contractor','subcontractor'].includes(pageParams.get('role'))?pageParams.get('role'):'';
let inviteMessage='';

const views={
  signup:{
    title:'Create your account | Trades',
    kicker:'Built for every market',
    heading:'One network.<br><em>Two sides.</em><br>Better projects.',
    body:'Create a company account that can hire subcontractors, find trade work, or do both.',
    items:['Find and hire trusted trade partners','Bid on nearby jobs and grow your business','Build a reputation contractors can verify']
  },
  login:{
    title:'Sign in | Trades',
    kicker:'Your work, all in one place',
    heading:'Pick up where<br><em>you left off.</em>',
    body:'Sign in to manage opportunities, crews, bids, and the relationships that keep projects moving.',
    items:['Review new jobs and active bids','Message contractors and trade partners','Keep your company profile up to date']
  }
};

function showNotice(message,error=false){notice.textContent=message;notice.hidden=false;notice.classList.toggle('error',error)}
function hideNotice(){notice.hidden=true;notice.classList.remove('error')}
async function api(path,options={}){const response=await fetch(path,{headers:{'Content-Type':'application/json'},...options}),data=await response.json();if(!response.ok)throw new Error(data.error||'Request failed');return data}
function signupUrl(){const params=new URLSearchParams();if(inviteToken)params.set('invite',inviteToken);if(selectedRole)params.set('role',selectedRole);return `/signup${params.size?`?${params}`:''}`}

function switchTab(name,{updateUrl=true}={}){
  const view=views[name]||views.signup;
  document.querySelectorAll('[data-tab]').forEach(button=>{const active=button.dataset.tab===name;button.classList.toggle('active',active);if(button.getAttribute('role')==='tab')button.setAttribute('aria-selected',String(active))});
  signupForm.hidden=name!=='signup';
  loginForm.hidden=name!=='login';
  document.title=view.title;
  document.getElementById('storyKicker').textContent=view.kicker;
  document.getElementById('storyTitle').innerHTML=view.heading;
  document.getElementById('storyBody').textContent=view.body;
  document.getElementById('storyList').innerHTML=view.items.map(item=>`<li>${item}</li>`).join('');
  hideNotice();
  if(name==='signup'&&inviteMessage)showNotice(inviteMessage);
  if(updateUrl)history.replaceState({tab:name},'',name==='login'?'/login':signupUrl());
}

function setSubmitting(form,submitting){const button=form.querySelector('[type="submit"]');if(!button.dataset.label)button.dataset.label=button.textContent;button.disabled=submitting;button.textContent=submitting?button.dataset.loadingLabel:button.dataset.label;form.setAttribute('aria-busy',String(submitting))}

document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>switchTab(button.dataset.tab)));
window.addEventListener('popstate',()=>switchTab(location.pathname==='/login'?'login':'signup',{updateUrl:false}));
if(selectedRole){const capability=signupForm.querySelector(`[name="capability"][value="${selectedRole}"]`);if(capability)capability.checked=true}
switchTab(location.pathname==='/login'?'login':'signup',{updateUrl:false});

if(inviteToken)api(`/api/invites/preview?token=${encodeURIComponent(inviteToken)}`).then(data=>{inviteMessage=`${data.inviterCompany.name} invited you to join their trusted trade network. Create your account to connect automatically.`;if(!signupForm.hidden)showNotice(inviteMessage)}).catch(error=>showNotice(error.message,true));

signupForm.addEventListener('submit',async event=>{event.preventDefault();hideNotice();const form=new FormData(event.currentTarget),capabilities=[...event.currentTarget.querySelectorAll('[name="capability"]:checked')].map(input=>input.value);try{if(!capabilities.length)throw new Error('Choose at least one company capability.');setSubmitting(event.currentTarget,true);await api('/api/signup',{method:'POST',body:JSON.stringify({fullName:form.get('fullName'),companyName:form.get('companyName'),city:form.get('city'),state:form.get('state'),trades:String(form.get('trades')||'').split(',').map(value=>value.trim()).filter(Boolean),email:form.get('email'),password:form.get('password'),capabilities,inviteToken})});location.href='/dashboard'}catch(error){showNotice(error.message,true);setSubmitting(event.currentTarget,false)}});
loginForm.addEventListener('submit',async event=>{event.preventDefault();hideNotice();const form=new FormData(event.currentTarget);try{setSubmitting(event.currentTarget,true);await api('/api/login',{method:'POST',body:JSON.stringify({email:form.get('email'),password:form.get('password')})});location.href='/dashboard'}catch(error){showNotice(error.message,true);setSubmitting(event.currentTarget,false)}});
fetch('/api/me').then(response=>{if(response.ok)location.href='/dashboard'});
