// Dati del negozio in un unico posto: home, footer, mappa e dati strutturati per Google li leggono da qui.
// Fonte: profilo Instagram @panetteriailforno; coordinate da OpenStreetMap ("Panetteria Il Forno", Via Cavour 2).

export const negozio = {
  nome: "Panetteria Il Forno",
  via: "Via Cavour 2",
  cap: "10046",
  citta: "Poirino",
  provincia: "TO",
  telefono: "+390119450228",
  telefonoVisibile: "011 945 0228",
  instagram: "https://www.instagram.com/panetteriailforno/",
  facebook: "https://www.facebook.com/Panetteria-Il-Forno-101964995114489/",
  coordinate: { lat: 44.9196084, lng: 7.8483041 },
} as const;

const { lat, lng } = negozio.coordinate;

export const indirizzo = (lang: "it" | "en") =>
  `${negozio.via}, ${negozio.cap} ${negozio.citta} (${negozio.provincia})${lang === "en" ? ", Italy" : ""}`;

export const mappaEmbed = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
export const indicazioni = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

/** Dati strutturati schema.org per i risultati di Google (scheda attività, mappa). */
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: negozio.nome,
  telephone: negozio.telefono,
  address: {
    "@type": "PostalAddress",
    streetAddress: negozio.via,
    postalCode: negozio.cap,
    addressLocality: negozio.citta,
    addressRegion: negozio.provincia,
    addressCountry: "IT",
  },
  geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
  hasMap: indicazioni,
  sameAs: [negozio.instagram, negozio.facebook],
};
