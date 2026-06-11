const locationStyle=document.createElement('link');
locationStyle.rel='stylesheet';
locationStyle.href='location.css';
document.head.appendChild(locationStyle);

function renderLocationSettings(){
  if(!dashboard)return;
  const profile=document.getElementById('profileView');
  let panel=document.getElementById('locationSettings');
  if(!panel){
    panel=document.createElement('article');
    panel.id='locationSettings';
    panel.className='workspace-card location-settings';
    profile.prepend(panel);
  }
  const company=dashboard.company;
  panel.innerHTML=`<div class="location-copy"><span class="kicker">Marketplace location</span><h2>Show work and companies near you.</h2><p>Your marketplace is currently limited to <strong>${escapeHtml(company.city)}, ${escapeHtml(company.state)}</strong>. Trusted connections and conversations remain available from anywhere.</p></div><form id="locationForm"><label><span>City</span><input name="city" required autocomplete="address-level2" value="${escapeHtml(company.city)}" placeholder="Columbus"></label><label><span>State</span><input name="state" required autocomplete="address-level1" maxlength="2" value="${escapeHtml(company.state)}" placeholder="OH"></label><button class="button button-orange" type="submit">Update location</button></form>`;
  document.getElementById('locationForm').addEventListener('submit',updateLocation);
}

async function updateLocation(event){
  event.preventDefault();
  const button=event.currentTarget.querySelector('button'),data=Object.fromEntries(new FormData(event.currentTarget));
  button.disabled=true;button.textContent='Updating...';
  try{
    await api('/api/profile/location',{method:'PUT',body:JSON.stringify(data)});
    await refresh();
    renderLocationSettings();
    showNotice('Marketplace location updated. Jobs and company discovery now match your area.');
  }catch(error){showNotice(error.message,true);button.disabled=false;button.textContent='Update location'}
}

const locationRefresh=refresh;
refresh=async function(){await locationRefresh();renderLocationSettings()};
document.querySelector('[data-view="profile"]').addEventListener('click',renderLocationSettings);
