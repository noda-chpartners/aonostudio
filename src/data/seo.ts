import { categories, services } from './data';
import { site } from './site';

function internationalTel(tel: string) {
  const local = tel.replace(/\D/g, '').replace(/^0/, '');
  if (local.startsWith('3') && local.length === 9) {
    return `+81-3-${local.slice(1, 5)}-${local.slice(5)}`;
  }
  return `+81-${local.slice(0, 2)}-${local.slice(2, 6)}-${local.slice(6)}`;
}

export function structuredData(pageUrl: string, imageUrl: string) {
  const businessId = `${pageUrl}#business`;
  const websiteId = `${pageUrl}#website`;
  const personName = site.representative.replace(/\s/g, '');
  const offers = [
    ...categories.map((category) => `${category.ja}撮影`),
    ...services.filter((service) => service !== '撮影'),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: pageUrl,
        name: site.name,
        description: site.description,
        inLanguage: 'ja',
        publisher: { '@id': businessId },
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: site.title,
        description: site.description,
        inLanguage: 'ja',
        isPartOf: { '@id': websiteId },
        about: { '@id': businessId },
        primaryImageOfPage: imageUrl,
      },
      {
        '@type': 'Photographer',
        '@id': businessId,
        name: site.name,
        description: site.description,
        url: pageUrl,
        image: imageUrl,
        logo: imageUrl,
        telephone: internationalTel(site.phones[0].tel),
        foundingDate: '1981',
        address: {
          '@type': 'PostalAddress',
          postalCode: site.postal.replace('〒', ''),
          addressCountry: 'JP',
          addressRegion: '東京都',
          addressLocality: '目黒区',
          streetAddress: `${site.address[0].replace(/^東京都目黒区/, '')} ${site.address[1]}`,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '19:00',
        },
        contactPoint: site.phones.map((phone) => ({
          '@type': 'ContactPoint',
          telephone: internationalTel(phone.tel),
          contactType: 'customer service',
          availableLanguage: 'Japanese',
          areaServed: 'JP',
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '10:00',
            closes: '19:00',
          },
        })),
        founder: {
          '@type': 'Person',
          name: personName,
          alternateName: site.representativeKana.replace(/\s/g, ''),
          jobTitle: 'フォトグラファー',
          birthDate: '1953',
        },
        areaServed: {
          '@type': 'AdministrativeArea',
          name: '東京都',
        },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`,
        knowsAbout: offers,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: '撮影・レタッチ・デジタル納品',
          itemListElement: offers.map((name) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name,
            },
          })),
        },
      },
    ],
  };
}
