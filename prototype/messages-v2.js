let messageFilter='all',messageSearch='';

function messageShortTime(value){
  if(!value)return'';
  const date=new Date(value),today=new Date();
  return date.toDateString()===today.toDateString()?date.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):date.toLocaleDateString([],{month:'short',day:'numeric'});
}
function messageDate(value){
  const date=new Date(value),today=new Date(),yesterday=new Date(Date.now()-864e5);
  if(date.toDateString()===today.toDateString())return'Today';
  if(date.toDateString()===yesterday.toDateString())return'Yesterday';
  return date.toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'});
}
function messageTime(value){return new Date(value).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}
function conversationMarkup(item){
  const context=item.job?`${item.job.trade} · ${item.job.title}`:'General company conversation',updated=item.lastMessage?.createdAt||item.createdAt;
  return`<button type="button" class="conversation-item ${item.id===activeConversationId?'active':''} ${item.unread?'unread':''}" data-conversation="${item.id}"><span class="company-mark">${initials(item.otherCompany.name)}</span><div class="conversation-copy"><span class="conversation-line"><strong>${escapeHtml(item.otherCompany.name)}</strong><time>${messageShortTime(updated)}</time></span><small class="conversation-job">${escapeHtml(context)}</small><small class="conversation-preview">${escapeHtml(item.lastMessage?.body||'Conversation ready')}</small></div>${item.unread?`<b>${item.unread}</b>`:''}</button>`;
}
function filteredConversations(){
  const query=messageSearch.trim().toLowerCase();
  return dashboard.conversations.filter(item=>(messageFilter!=='unread'||item.unread)&&(!query||[item.otherCompany.name,item.job?.title,item.job?.trade,item.lastMessage?.body].some(value=>String(value||'').toLowerCase().includes(query))));
}
function bindConversationButtons(){document.querySelectorAll('[data-conversation]').forEach(button=>button.addEventListener('click',()=>openConversation(button.dataset.conversation)))}
renderConversations=function(){
  const conversations=filteredConversations();
  document.getElementById('conversationList').innerHTML=conversations.length?conversations.map(conversationMarkup).join(''):`<div class="list-empty">${dashboard.conversations.length?'No conversations match this view.':'No conversations yet. Find a job or connect with a company to get started.'}</div>`;
  document.getElementById('recentConversations').innerHTML=dashboard.conversations.length?dashboard.conversations.slice(0,4).map(conversationMarkup).join(''):'<div class="list-empty">No conversations yet.</div>';
  bindConversationButtons();
};
function renderMessageGroups(messages){
  if(!messages.length)return'<div class="message-empty compact"><span>Start the conversation. Introduce your company or discuss the project opportunity.</span></div>';
  let lastDay='',lastSender='';
  return messages.map(message=>{
    const day=new Date(message.createdAt).toDateString(),mine=message.senderCompanyId===dashboard.company.id;
    let html='';
    if(day!==lastDay){html+=`<div class="message-day">${messageDate(message.createdAt)}</div>`;lastDay=day;lastSender=''}
    const sameSender=lastSender===message.senderCompanyId;
    html+=`<div class="message-group ${mine?'mine':''}">${sameSender?'':`<div class="message-group-label">${mine?'You':escapeHtml(message.senderName)}</div>`}<div class="message-bubble ${mine?'mine':''}"><p>${escapeHtml(message.body)}</p><small>${messageTime(message.createdAt)}</small></div></div>`;
    lastSender=message.senderCompanyId;
    return html;
  }).join('');
}
startConversation=async function(companyId,jobId=''){
  try{const result=await api('/api/conversations',{method:'POST',body:JSON.stringify({companyId,jobId})});activeConversationId=result.conversation.id;await refresh();switchView('messages');await openConversation(result.conversation.id)}catch(error){showNotice(error.message,true)}
};
openConversation=async function(conversationId){
  try{
    activeConversationId=conversationId;
    const result=await api(`/api/conversations/${conversationId}/messages`),locationText=[result.otherCompany.city,result.otherCompany.state].filter(Boolean).join(', '),job=document.getElementById('messageJob'),actions=document.getElementById('messageHeaderActions');
    document.getElementById('messageEmpty').hidden=true;document.getElementById('messageWorkspace').hidden=false;
    document.getElementById('messageInitials').textContent=initials(result.otherCompany.name);document.getElementById('messageCompany').textContent=result.otherCompany.name;document.getElementById('messageMeta').textContent=[capabilityText(result.otherCompany),locationText].filter(Boolean).join(' · ');
    job.hidden=!result.job;job.textContent=result.job?`${result.job.trade} · ${result.job.title}`:'';
    actions.innerHTML=`${result.job?'<button class="button button-outline" type="button" data-message-view-job>View job</button>':''}<button class="button button-outline" type="button" data-message-view-profile>View profile</button>`;
    actions.querySelector('[data-message-view-job]')?.addEventListener('click',()=>switchView('jobs'));actions.querySelector('[data-message-view-profile]').addEventListener('click',()=>loadTrustProfile(result.otherCompany.id));
    const thread=document.getElementById('messageThread');thread.innerHTML=renderMessageGroups(result.messages);thread.scrollTop=thread.scrollHeight;
    dashboard=await api('/api/dashboard');renderShell();renderConversations();
  }catch(error){showNotice(error.message,true)}
};
(function enhanceMessages(){
  const oldForm=document.getElementById('messageForm'),form=oldForm.cloneNode(true);oldForm.replaceWith(form);
  const field=form.elements.body;
  async function send(){if(!activeConversationId||!field.value.trim())return;try{await api(`/api/conversations/${activeConversationId}/messages`,{method:'POST',body:JSON.stringify({body:field.value.trim()})});field.value='';field.style.height='';await openConversation(activeConversationId)}catch(error){showNotice(error.message,true)}}
  form.addEventListener('submit',event=>{event.preventDefault();send()});
  field.addEventListener('input',()=>{field.style.height='auto';field.style.height=`${Math.min(field.scrollHeight,150)}px`});
  field.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();form.requestSubmit()}});
  document.getElementById('conversationSearch').addEventListener('input',event=>{messageSearch=event.target.value;renderConversations()});
  document.querySelectorAll('[data-message-filter]').forEach(button=>button.addEventListener('click',()=>{messageFilter=button.dataset.messageFilter;document.querySelectorAll('[data-message-filter]').forEach(item=>item.classList.toggle('active',item===button));renderConversations()}));
  const baseSwitchView=switchView;switchView=function(name){baseSwitchView(name);if(name==='messages'&&dashboard?.conversations.length&&!activeConversationId)openConversation(dashboard.conversations[0].id)};
  setTimeout(()=>{if(location.pathname==='/messages'&&dashboard?.conversations.length&&!activeConversationId)openConversation(dashboard.conversations[0].id)},350);
})();
