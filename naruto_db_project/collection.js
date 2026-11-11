'use strict';

// Keep one ownership marker per card; copies, variants and account metadata are not stored.
const CARD_COLLECTION = (() => {
  const storageKey='naruto-ninja-cards.collection';
  const url='https://api.narutoninjacards.com/v1/collection/me';
  const syncChannel='naruto-collection-sync';
  const officialOrigin='https://app.narutoninjacards.com';
  const known=new Set(CARDS.map(card=>card.card_key));
  const maxBytes=2_000_000;
  function parse(text) {
    if (typeof text!=='string' || new Blob([text]).size>maxBytes) throw Error('collectionInvalid');
    let data;
    try { data=JSON.parse(text.replace(/^\uFEFF/,'')); } catch { throw Error('collectionInvalid'); }
    if (!data || !Array.isArray(data.seasons) || data.seasons.length>100) throw Error('collectionInvalid');
    const counts={},ignored=new Set();
    let entries=0;
    for (const season of data.seasons) {
      if (!season || !/^(?:S\d{1,2}|ES)$/.test(season.id) || !Array.isArray(season.cards)) throw Error('collectionInvalid');
      entries+=season.cards.length;
      if (entries>10_000) throw Error('collectionInvalid');
      for (const card of season.cards) {
        if (!card || typeof card.id!=='string' || !/^(?:S\d{1,2}|ES)_\d{3}$/.test(card.id) || card.id.split('_')[0]!==season.id || !Number.isSafeInteger(card.count) || card.count<0) throw Error('collectionInvalid');
        if (!card.count) continue;
        if (!known.has(card.id)) { ignored.add(card.id);continue; }
        counts[card.id]=1;
      }
    }
    return {counts,ignored:ignored.size};
  }
  function restore() {
    const raw=localStorage.getItem(storageKey);
    if (raw===null) return null;
    const counts=JSON.parse(raw);
    if (!counts || Array.isArray(counts) || typeof counts!=='object' || Object.entries(counts).some(([key,count])=>!known.has(key) || !Number.isSafeInteger(count) || count<1)) throw Error('collectionInvalid');
    return Object.fromEntries(Object.keys(counts).map(key=>[key,1]));
  }
  function save(counts) {
    if (counts===null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey,JSON.stringify(counts));
  }
  function bookmarklet(messages,builderOrigin) {
    // This runs only when the user activates the bookmark on the official app.
    async function synchronize(messages,endpoint,channel,builderOrigin) {
      if (location.origin!=='https://app.narutoninjacards.com') {
        const bookmark=document.getElementById('collection-bookmark');
        const onBuilder=builderOrigin==='file:'?location.protocol==='file:':location.origin===builderOrigin;
        if (onBuilder && typeof bookmark?.onclick==='function') bookmark.click();else alert(messages.wrongSite);
        return;
      }
      const builder=window.opener,fileBuilder=builderOrigin==='file:',targetOrigin=fileBuilder?'*':builderOrigin;
      if (!builder || builder.closed) { alert(messages.noConnection);return; }
      if (window.__narutoCollectionSyncRunning) return;
      window.__narutoCollectionSyncRunning=true;
      let token,errorCode='failed';
      function exchange(type,message,expectedToken) {
        return new Promise((resolve,reject)=>{
          const finish=(callback,value)=>{clearTimeout(timer);window.removeEventListener('message',receive);callback(value);};
          const timer=setTimeout(()=>finish(reject,Error('no_connection')),12_000);
          function receive(event) {
            const data=event.data;
            const matchingOrigin=fileBuilder?['null','file://'].includes(event.origin):event.origin===builderOrigin;
            if (event.source!==builder || !matchingOrigin || !data || data.channel!==channel || data.type!==type || !/^[a-f0-9]{32}$/.test(data.token) || (expectedToken && data.token!==expectedToken)) return;
            finish(resolve,data);
          }
          window.addEventListener('message',receive);
          try { builder.postMessage({channel,...message},targetOrigin); }
          catch(error) { finish(reject,error); }
        });
      }
      try {
        token=(await exchange('request',{type:'ready'})).token;
        const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20_000);
        let response;
        try { response=await fetch(endpoint,{credentials:'include',cache:'no-store',signal:controller.signal}); }
        finally { clearTimeout(timer); }
        if (response.status===401) { errorCode='signIn';throw Error('sign_in'); }
        if (!response.ok) throw Error('request_failed');
        const data=await response.json();
        if (!Array.isArray(data.seasons)) throw Error('invalid_collection');
        const collection={seasons:data.seasons.map(season=>({id:season.id,cards:season.cards.map(card=>({id:card.id,count:card.count}))}))};
        const confirmation=await exchange('ack',{type:'result',token,collection:JSON.stringify(collection)},token);
        builder.focus();if (confirmation.ok) window.close();
      } catch {
        if (token && !builder.closed) {
          try {
            const confirmation=await exchange('ack',{type:'error',token,code:errorCode},token);
            if (confirmation.ok) { builder.focus();return; }
          } catch { /* Fall back only if the builder cannot confirm receipt. */ }
        }
        alert(messages.noConnection);
      } finally { delete window.__narutoCollectionSyncRunning; }
    }
    return 'javascript:'+encodeURIComponent(`void (${synchronize.toString()})(${JSON.stringify(messages)},${JSON.stringify(url)},${JSON.stringify(syncChannel)},${JSON.stringify(builderOrigin)})`);
  }
  return {parse,restore,save,bookmarklet,url,syncChannel,officialOrigin};
})();
