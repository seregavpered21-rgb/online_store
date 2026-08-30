import Link from "next/link";

export function StoreFooter() {
  return <footer className="site-footer"><span>WARENLADEN</span><nav aria-label="Rechtliches"><Link href="/impressum">Impressum</Link><Link href="/datenschutz">Datenschutz</Link><Link href="/widerruf">Widerruf</Link><Link href="/versand-und-zahlung">Versand & Zahlung</Link></nav></footer>;
}