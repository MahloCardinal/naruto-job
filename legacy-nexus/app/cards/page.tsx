import { CardExplorer } from '@/components/card-explorer';
import { cards } from '@/lib/cards';
export default function CardsPage(){return <main className="container page"><div className="page-heading"><div className="eyebrow">NEXUS DATABASE</div><h1>DATABASE <em>CARTE</em></h1><p>Esplora tutte le carte disponibili in Naruto Ninja Cards.</p><b>{cards.length} CARTE · 4 COLLEZIONI</b></div><CardExplorer cards={cards}/></main>}
