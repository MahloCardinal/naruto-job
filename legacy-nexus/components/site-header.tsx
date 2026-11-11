import Image from 'next/image';
import Link from 'next/link';
import { AuthControl } from '@/components/auth-control';

export function SiteHeader(){
  return <header className="topbar">
    <Link href="/" className="wordmark" aria-label="NEXUS home"><Image src="/nexus_logo_titanium.png" alt="NEXUS" width={150} height={58} priority/><span>TOURNAMENTS</span></Link>
    <nav aria-label="Navigazione principale"><Link href="/tierlist">Tier List</Link><Link href="/decks">Mazzi</Link><Link href="/cards">Carte</Link><Link href="/updates">Update</Link><Link href="/collaborator/apply">Collabora</Link><Link href="/tournaments">Tornei</Link></nav>
    <div className="topbar-actions"><AuthControl/><a className="discord" href="https://discord.gg/Z37VKQytGv" target="_blank" rel="noreferrer">Discord ↗</a></div>
  </header>;
}
