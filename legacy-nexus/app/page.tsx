import Image from 'next/image';
import Link from 'next/link';
const sections=[
  {title:'TIER LIST',desc:'Scopri i mazzi più forti del momento',href:'/tierlist',code:'01',tone:'tier'},
  {title:'MAZZI',desc:'Consulta mazzi, combo e strategie',href:'/decks',code:'02',tone:'decks'},
  {title:'TORNEI',desc:'Competizioni e risultati · sezione in pausa',href:'/tournaments',code:'03',tone:'tourney'},
  {title:'UPDATE',desc:'Patch, nuove carte e bilanciamenti',href:'/updates',code:'04',tone:'updates'},
];
export default function Home(){return <main className="container home">
  <section className="hero"><div className="hero-mark"><Image src="/nexus_logo_titanium.png" alt="NEXUS" width={440} height={170} priority/></div><div className="eyebrow">NARUTO NINJA CARDS · COMPETITIVE HUB</div><p>Strategia, competizione e community. Tutto il mondo competitivo di Naruto Ninja Cards in un unico posto.</p><a className="primary" href="https://discord.gg/Z37VKQytGv" target="_blank" rel="noreferrer">ENTRA NEL DISCORD ↗</a></section>
  <section className="tilegrid" aria-label="Sezioni NEXUS">{sections.map(item=><Link href={item.href} className={`tile ${item.tone}`} key={item.code}><span className="tile-kicker">NEXUS DATABASE <i>{item.code}</i></span><h2>{item.title}</h2><p>{item.desc}</p><span className="tile-arrow" aria-hidden="true">↗</span></Link>)}</section>
  <section className="home-note"><b>290 CARTE CATALOGATE</b><span>Season 1 · Season 2 · Season 3 · Event Scroll</span><Link href="/cards">Esplora il database carte →</Link></section>
</main>}
