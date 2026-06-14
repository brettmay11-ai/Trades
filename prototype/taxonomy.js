const TRADE_OPTIONS=['Framing and Rough Carpentry','Electrical','HVAC and Refrigeration','Concrete, Formwork, and Rebar','Plumbing','Drywall and Finishing','Painting and Coatings','Masonry, Brick, and Stone','Roofing','Excavation, Grading, and Sitework','Demolition','Insulation','Flooring and Tile','Finish Carpentry, Cabinets, and Millwork','Siding, Stucco, and Exterior Finishes','Windows, Doors, Glass, and Glazing','Landscaping and Irrigation','Fencing and Gates','Low-Voltage, Data, Security, and Access Control','Welding, Structural Steel, and Miscellaneous Metals','Waterproofing, Gutters, and Drainage','Cleaning, Hauling, and Final Jobsite Cleanup'];
const TRADE_ALIASES={'framing':'Framing and Rough Carpentry','carpentry':'Framing and Rough Carpentry','hvac':'HVAC and Refrigeration','concrete':'Concrete, Formwork, and Rebar','drywall':'Drywall and Finishing','painting':'Painting and Coatings','masonry':'Masonry, Brick, and Stone','excavation':'Excavation, Grading, and Sitework','flooring':'Flooring and Tile','tile':'Flooring and Tile','stone and tile':'Flooring and Tile','finish carpentry':'Finish Carpentry, Cabinets, and Millwork','cabinetry':'Finish Carpentry, Cabinets, and Millwork','siding':'Siding, Stucco, and Exterior Finishes','doors and windows':'Windows, Doors, Glass, and Glazing','glass and glazing':'Windows, Doors, Glass, and Glazing','landscaping':'Landscaping and Irrigation','fencing':'Fencing and Gates','welding':'Welding, Structural Steel, and Miscellaneous Metals','structural steel':'Welding, Structural Steel, and Miscellaneous Metals','metal fabrication':'Welding, Structural Steel, and Miscellaneous Metals','waterproofing':'Waterproofing, Gutters, and Drainage','gutters':'Waterproofing, Gutters, and Drainage','cleaning':'Cleaning, Hauling, and Final Jobsite Cleanup','general labor':'Cleaning, Hauling, and Final Jobsite Cleanup'};
const CITY_OPTIONS=['Arlington, TX','Austin, TX','Columbus, OH','Dallas, TX','Fort Worth, TX','Frisco, TX','Garland, TX','Houston, TX','Irving, TX','McKinney, TX','Plano, TX','San Antonio, TX'];
const CITY_COORDINATES={'arlington,tx':[32.7357,-97.1081],'austin,tx':[30.2672,-97.7431],'columbus,oh':[39.9612,-82.9988],'dallas,tx':[32.7767,-96.797],'fort worth,tx':[32.7555,-97.3308],'frisco,tx':[33.1507,-96.8236],'garland,tx':[32.9126,-96.6389],'houston,tx':[29.7604,-95.3698],'irving,tx':[32.814,-96.9489],'mckinney,tx':[33.1972,-96.6398],'plano,tx':[33.0198,-96.6989],'san antonio,tx':[29.4241,-98.4936]};
const LOCATION_FIELDS=['placeId','formattedLocation','postalCode','latitude','longitude'];

function canonicalTrade(value){const normalized=String(value||'').trim().toLowerCase();return TRADE_OPTIONS.find(option=>option.toLowerCase()===normalized)||TRADE_ALIASES[normalized]||''}
function stateField(input){const scope=input.closest('form,fieldset,.form-row,.location-settings')||document;return scope.querySelector('[name="state"],#jobStateFilter')}
function locationScope(input){return input.closest('form')||input.parentElement||document}
function ensureLocationFields(input){
  const scope=locationScope(input),fields={};
  LOCATION_FIELDS.forEach(name=>{
    let field=scope.querySelector(`[name="${name}"]`);
    if(!field&&scope.tagName==='FORM'){field=document.createElement('input');field.type='hidden';field.name=name;scope.appendChild(field)}
    fields[name]=field;
  });
  return fields;
}
function setLocationMetadata(input,values={}){
  const fields=ensureLocationFields(input);
  LOCATION_FIELDS.forEach(name=>{if(fields[name])fields[name].value=values[name]??''});
}
function clearLocationMetadata(input){setLocationMetadata(input)}
function component(place,type,short=false){const value=(place.address_components||[]).find(item=>item.types.includes(type));return short?value?.short_name:value?.long_name}
function applyCity(cityInput,description){
  const parts=String(description||'').split(',').map(value=>value.trim()),state=parts.at(-1),city=parts[0]||description;
  cityInput.value=city;
  const field=stateField(cityInput);
  if(field&&state&&state.length===2)field.value=state.toUpperCase();
  const coordinates=CITY_COORDINATES[`${city.toLowerCase()},${String(state||'').toLowerCase()}`];
  setLocationMetadata(cityInput,{formattedLocation:`${city}, ${String(state||'').toUpperCase()}`,latitude:coordinates?.[0]??'',longitude:coordinates?.[1]??''});
  cityInput.dispatchEvent(new Event('input',{bubbles:true}));
}
function enableSuggestionMenu(input,options,{label='Option',onSelect}={}){
  if(input.dataset.suggestionReady)return;
  input.dataset.suggestionReady='true';
  input.removeAttribute('list');
  input.setAttribute('autocomplete','off');
  input.setAttribute('aria-autocomplete','list');
  input.setAttribute('aria-expanded','false');
  const wrap=document.createElement('div'),menu=document.createElement('div');
  wrap.className='trades-suggestion-wrap';
  menu.className='trades-suggestion-menu';
  menu.setAttribute('role','listbox');
  input.parentNode.insertBefore(wrap,input);
  wrap.append(input,menu);
  let visible=[],active=-1;
  function render(query=''){
    const normalized=String(query).trim().toLowerCase();
    visible=options.filter(value=>!normalized||value.toLowerCase().includes(normalized));
    active=-1;
    menu.innerHTML=visible.length?visible.map((value,index)=>`<button type="button" role="option" data-suggestion-index="${index}"><span>${value}</span><small>${label}</small></button>`).join(''):'<p>No matching options. Try a different search.</p>';
  }
  function open(showAll=false){
    render(showAll?'':input.value);
    menu.classList.add('open');
    wrap.classList.add('open');
    input.setAttribute('aria-expanded','true');
  }
  function close(){
    menu.classList.remove('open');
    wrap.classList.remove('open');
    input.setAttribute('aria-expanded','false');
    active=-1;
  }
  function highlight(index){
    const buttons=[...menu.querySelectorAll('button')];
    if(!buttons.length)return;
    active=(index+buttons.length)%buttons.length;
    buttons.forEach((button,buttonIndex)=>button.classList.toggle('active',buttonIndex===active));
    buttons[active].scrollIntoView({block:'nearest'});
  }
  function choose(value){
    input.value=value;
    onSelect?.(value);
    input.dispatchEvent(new Event('change',{bubbles:true}));
    close();
  }
  input.addEventListener('focus',()=>open(true));
  input.addEventListener('click',()=>open(true));
  input.addEventListener('input',()=>open(false));
  input.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      if(!menu.classList.contains('open'))open(true);
      highlight(active+(event.key==='ArrowDown'?1:-1));
    }else if(event.key==='Enter'&&active>=0){
      event.preventDefault();
      choose(visible[active]);
    }else if(event.key==='Escape'){
      close();
    }
  });
  menu.addEventListener('mousedown',event=>{
    const button=event.target.closest('[data-suggestion-index]');
    if(!button)return;
    event.preventDefault();
    choose(visible[Number(button.dataset.suggestionIndex)]);
  });
  document.addEventListener('pointerdown',event=>{if(!wrap.contains(event.target))close()});
}
function enableFallbackCity(input){
  input.placeholder=input.placeholder||'Start typing a city';
  enableSuggestionMenu(input,CITY_OPTIONS,{label:'City',onSelect:value=>applyCity(input,value)});
  input.addEventListener('change',()=>{const match=CITY_OPTIONS.find(value=>value.toLowerCase()===input.value.trim().toLowerCase());if(match)applyCity(input,match)});
}
function enableGoogleCity(input){
  if(!window.google?.maps?.places||input.dataset.googlePlacesReady)return;
  input.dataset.googlePlacesReady='true';
  const autocomplete=new google.maps.places.Autocomplete(input,{types:['(cities)'],componentRestrictions:{country:'us'},fields:['address_components','formatted_address','geometry','name','place_id']});
  autocomplete.addListener('place_changed',()=>{
    const place=autocomplete.getPlace(),city=component(place,'locality')||component(place,'postal_town')||place.name,state=component(place,'administrative_area_level_1',true),latitude=place.geometry?.location?.lat(),longitude=place.geometry?.location?.lng();
    if(city)input.value=city;
    if(state){const field=stateField(input);if(field)field.value=state}
    setLocationMetadata(input,{placeId:place.place_id||'',formattedLocation:place.formatted_address||`${city}, ${state}`,postalCode:component(place,'postal_code')||'',latitude,longitude});
    cityInputEvent(input);
  });
}
function cityInputEvent(input){input.dispatchEvent(new Event('input',{bubbles:true}))}
function enableSingleTrade(input){if(input.dataset.tradeReady)return;input.dataset.tradeReady='true';input.placeholder=input.placeholder||'Start typing a trade';enableSuggestionMenu(input,TRADE_OPTIONS,{label:'Trade',onSelect:value=>{input.value=canonicalTrade(value)}});input.addEventListener('change',()=>{const match=canonicalTrade(input.value);if(match)input.value=match});const form=input.closest('form');if(form&&!form.dataset.tradeValidationReady){form.dataset.tradeValidationReady='true';form.addEventListener('submit',event=>{const fields=[...form.querySelectorAll('[data-trade-picker="single"]')];for(const field of fields){if(field.value&&!canonicalTrade(field.value)){event.preventDefault();event.stopImmediatePropagation();field.setCustomValidity('Select a trade from the standard list.');field.reportValidity();setTimeout(()=>field.setCustomValidity(''),2000);return}field.value=canonicalTrade(field.value)||field.value}},true)}}
function enableMultiTrade(root){if(root.dataset.tradeReady)return;root.dataset.tradeReady='true';const input=root.querySelector('[data-trade-add]'),hidden=root.querySelector('[name="trades"]'),chips=root.querySelector('[data-trade-chips]');let selected=String(hidden.value||'').split(',').map(canonicalTrade).filter(Boolean);function render(){hidden.value=selected.join(', ');chips.innerHTML=selected.map(trade=>`<button type="button" data-remove-trade="${trade}" aria-label="Remove ${trade}">${trade}<span>&times;</span></button>`).join('');chips.querySelectorAll('[data-remove-trade]').forEach(button=>button.onclick=()=>{selected=selected.filter(trade=>trade!==button.dataset.removeTrade);render()})}function add(value=input.value){const trade=canonicalTrade(value);if(!trade){input.setCustomValidity('Select a trade from the standard list.');input.reportValidity();setTimeout(()=>input.setCustomValidity(''),2000);return}if(!selected.includes(trade))selected.push(trade);input.value='';render()}enableSuggestionMenu(input,TRADE_OPTIONS,{label:'Trade',onSelect:add});input.addEventListener('change',()=>{if(input.value)add()});render()}
function enhancePickers(root=document){
  root.querySelectorAll('[name="trade"],#jobTradeFilter').forEach(input=>{input.dataset.tradePicker='single';enableSingleTrade(input)});
  root.querySelectorAll('[data-trade-picker="multi"]').forEach(enableMultiTrade);
  root.querySelectorAll('[name="city"],#jobCityFilter').forEach(input=>{enableGoogleCity(input);if(input.dataset.cityReady)return;input.dataset.cityReady='true';ensureLocationFields(input);enableFallbackCity(input);input.addEventListener('input',event=>{if(event.isTrusted)clearLocationMetadata(input)})});
  root.querySelectorAll('[name="state"],#jobStateFilter').forEach(input=>{input.maxLength=2;input.addEventListener('input',event=>{input.value=input.value.toUpperCase();if(event.isTrusted){const city=(input.closest('form')||document).querySelector('[name="city"]');if(city)clearLocationMetadata(city)}})});
}
async function loadGooglePlaces(){try{const response=await fetch('/api/public-config',{cache:'no-store'}),config=await response.json();if(!config.googleMapsApiKey)return;const script=document.createElement('script');script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.googleMapsApiKey)}&libraries=places&callback=tradesGooglePlacesReady`;script.async=true;script.defer=true;document.head.appendChild(script)}catch(error){console.warn('Google Places unavailable; using standardized city fallback.',error)}}
window.tradesGooglePlacesReady=()=>enhancePickers();window.TradesTaxonomy={trades:TRADE_OPTIONS,canonicalTrade,enhancePickers,setLocationMetadata};enhancePickers();new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)enhancePickers(node.matches?.('form,fieldset,section,article,div')?node:document)}))).observe(document.body,{childList:true,subtree:true});loadGooglePlaces();
