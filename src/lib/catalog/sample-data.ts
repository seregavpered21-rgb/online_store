export const categories = [
  { slug: "neu", title: "Neu eingetroffen", description: "Unsere neuesten Stücke in warmen Farben." },
  { slug: "kleidung", title: "Kleidung", description: "Kleidung, die sich gut anfühlt und leicht kombinieren lässt." },
  { slug: "accessoires", title: "Accessoires", description: "Kleine Details mit großer Wirkung." },
  { slug: "geschenke", title: "Geschenke", description: "Besondere Fundstücke zum Schenken." },
];

export const products = [
  {
    slug: "wollmantel-terracotta",
    name: "Wollmantel in Terrakotta",
    price: "189,00 EUR",
    tone: "clay",
    label: "Neu eingetroffen",
    category: "kleidung",
    description: "Ein weicher Wollmantel mit klarer Silhouette, großen Taschen und einem warmen Farbton.",
    sizes: ["S", "M", "L"],
  },
  {
    slug: "ledertasche-bernstein",
    name: "Ledertasche in Bernstein",
    price: "124,00 EUR",
    tone: "ochre",
    label: "Liebling der Woche",
    category: "accessoires",
    description: "Kompakte Tasche aus Leder mit verstellbarem Riemen für alles Wichtige im Alltag.",
    sizes: ["Einheitsgröße"],
  },
  {
    slug: "seidentuch-rosenholz",
    name: "Seidentuch in Rosenholz",
    price: "46,00 EUR",
    tone: "rose",
    label: "Kleine Auflage",
    category: "accessoires",
    description: "Leichtes Seidentuch in einer warmen Nuance. Schön im Haar, am Hals oder an der Tasche.",
    sizes: ["Einheitsgröße"],
  },
  {
    slug: "strickjacke-kastanie",
    name: "Strickjacke in Kastanie",
    price: "89,00 EUR",
    tone: "chestnut",
    label: "Für den Alltag",
    category: "kleidung",
    description: "Eine weiche Strickjacke für kühle Tage, gefertigt in einer zeitlosen, warmen Farbe.",
    sizes: ["S", "M", "L"],
  },
  {
    slug: "keramikbecher-sand",
    name: "Keramikbecher in Sand",
    price: "28,00 EUR",
    tone: "sand",
    label: "Schönes Geschenk",
    category: "geschenke",
    description: "Handgefertigter Becher für den ersten Kaffee und die kleine Pause zwischendurch.",
    sizes: ["Einheitsgröße"],
  },
];

export const featuredProducts = products.slice(0, 3);

export const storeInfo = {
  about: {
    title: "Über Warenladen",
    text: "Warenladen ist ein kleiner Laden für Kleidung und Accessoires mit warmen Farben, schönen Materialien und einer persönlichen Auswahl. Jedes Stück soll sich leicht in den Alltag einfügen und lange Freude machen.",
  },
  shipping: {
    title: "Lieferung",
    text: "In Essen bieten wir Abholung nach Vereinbarung und lokale Lieferung an. Innerhalb Deutschlands versenden wir sorgfältig verpackte Bestellungen mit der Post. Kosten und Lieferzeit werden vor dem Kauf klar angezeigt.",
  },
  returns: {
    title: "Rückgabe",
    text: "Sollte ein Artikel nicht passen oder nicht gefallen, kannst du dich innerhalb von 14 Tagen nach Erhalt bei uns melden. Ungetragene Artikel in einwandfreiem Zustand nehmen wir nach vorheriger Absprache zurück.",
  },
  privacy: {
    title: "Datenschutz",
    text: "Wir verwenden persönliche Daten ausschließlich zur Bearbeitung deiner Bestellung, für die Kommunikation dazu und zur Erfüllung gesetzlicher Pflichten. Vor dem Livegang wird dieser Entwurf durch eine rechtlich geprüfte Datenschutzerklärung ersetzt.",
  },
};