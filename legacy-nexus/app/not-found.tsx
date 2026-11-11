import Link from 'next/link';
export default function NotFound(){return <main className="container page"><div className="empty panel"><div className="eyebrow">404 · PAGE NOT FOUND</div><h1>Questa pagina non esiste</h1><p>Il contenuto richiesto non è disponibile o è stato spostato.</p><Link className="primary" href="/">Torna alla homepage</Link></div></main>;}
