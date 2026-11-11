'use strict';

const {languages,cards}=require('../server-data/proposals.json');
const byKey=new Map(Object.entries(cards));
const recentRequests=new Map();
function validDeck(deck) {
  return deck && typeof deck.name==='string' && deck.name.trim().length>0 && deck.name.trim().length<=15 && Array.isArray(deck.cards) && deck.cards.length===10 && new Set(deck.cards).size===10 && deck.cards.every(key=>byKey.has(key));
}
function discordPayload(data) {
  const embed={title:data.type==='deck'?'Deck proposal: '+data.deck.name:'Synergy proposal',color:0xbe6b27,fields:[{name:'Language',value:languages[data.language].name,inline:true}],timestamp:new Date().toISOString()};
  if (data.type==='deck') {
    embed.fields.push({name:'Cards',value:data.deck.cards.map(key=>{
      const card=byKey.get(key);
      return `${key.replace('_',' #')} · ${card.name.toUpperCase()} · ${card.ability}`;
    }).join('\n')});
    embed.footer={text:'The attached file contains the proposed card list.'};
  }
  return {content:data.description,embeds:[embed],allowed_mentions:{parse:[]}};
}

module.exports=async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  const respond=(status,error)=>res.status(status).json(error?{ok:false,error}:{ok:true});
  if (req.method!=='POST') {res.setHeader('Allow','POST');return respond(405,'method_not_allowed');}
  // The public form accepts JSON only from its own origin.
  try {
    if (new URL(req.headers.origin).host!==req.headers.host || req.headers['sec-fetch-site'] && req.headers['sec-fetch-site']!=='same-origin') return respond(403,'forbidden');
  } catch {return respond(403,'forbidden');}
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')) return respond(415,'invalid_content_type');
  let data;
  try {
    if (Number(req.headers['content-length']||0)>16000) return respond(413,'too_large');
    const body=typeof req.body==='string'?req.body:JSON.stringify(req.body);
    if (!body || Buffer.byteLength(body)>16000) return respond(413,'too_large');
    data=JSON.parse(body);
  } catch {return respond(400,'invalid_request');}
  if (!data || !['deck','synergy'].includes(data.type) || typeof data.description!=='string' || data.type==='synergy' && !data.description.trim() || data.description.length>2000 || typeof data.language!=='string' || !Object.hasOwn(languages,data.language) || data.type==='deck' && !validDeck(data.deck)) return respond(400,'invalid_request');
  data.description=data.description.trim()||(data.type==='deck'?languages[data.language].proposalNoDescription:'');
  if (data.type==='deck') data.deck={name:data.deck.name.trim(),cards:[...data.deck.cards]};
  let webhook;
  try {
    webhook=new URL(process.env.DISCORD_WEBHOOK_URL);
    if (webhook.protocol!=='https:' || !['discord.com','discordapp.com'].includes(webhook.hostname) || !/^\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+$/.test(webhook.pathname)) throw Error('Invalid configuration');
    webhook.search='?wait=true';
  } catch {return respond(503,'not_configured');}
  // Per-instance guard against rapid repeats; edge rules can enforce deployment-wide limits.
  const now=Date.now(),address=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  for (const [key,value] of recentRequests) if (value.until<=now) recentRequests.delete(key);
  const recent=recentRequests.get(address)||{count:0,until:now+60000};
  if (recent.count>=5) {res.setHeader('Retry-After',String(Math.ceil((recent.until-now)/1000)));return respond(429,'rate_limited');}
  if (recentRequests.size>=1000 && !recentRequests.has(address)) return respond(429,'rate_limited');
  recent.count++;recentRequests.set(address,recent);
  const payload=discordPayload(data);
  let body,headers;
  if (data.type==='deck') {
    payload.attachments=[{id:0,filename:'deck-proposal.json'}];
    body=new FormData();body.set('payload_json',JSON.stringify(payload));
    body.set('files[0]',new Blob([JSON.stringify(data.deck,null,2)],{type:'application/json'}),'deck-proposal.json');
  } else {body=JSON.stringify(payload);headers={'Content-Type':'application/json'};}
  try {
    const result=await fetch(webhook,{method:'POST',headers,body,signal:AbortSignal.timeout(10000)});
    if (result.status===429) {res.setHeader('Retry-After','60');return respond(429,'rate_limited');}
    if (!result.ok) return respond(502,'delivery_failed');
    const message=await result.json();
    if (!message.id || message.content!==data.description) return respond(502,'delivery_failed');
    return respond(200);
  } catch {return respond(502,'delivery_failed');}
};
