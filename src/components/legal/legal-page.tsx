import { StoreHeader } from "@/components/layout/store-header";

type LegalSection = { title: string; text: string };

export async function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return <main><StoreHeader /><article className="legal-page"><p className="eyebrow">Informationen</p><h1>{title}</h1><p className="legal-intro">{intro}</p>{sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}</article></main>;
}