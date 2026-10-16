import type { ImageMetadata } from 'astro';

export type CategoryId = 'beauty' | 'fashion' | 'eat' | 'human' | 'room' | 'etc';

export type Category = {
  id: CategoryId;
  en: string;
  ja: string;
  images: ImageMetadata[];
};

const folders: { id: CategoryId; en: string; ja: string }[] = [
  { id: 'beauty', en: 'Beauty', ja: 'ビューティー' },
  { id: 'fashion', en: 'Fashion', ja: 'ファッション' },
  { id: 'eat', en: 'Food', ja: 'フード' },
  { id: 'human', en: 'People', ja: '人物' },
  { id: 'room', en: 'Interior', ja: 'インテリア' },
  { id: 'etc', en: 'Product', ja: 'プロダクト' },
];

const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/{beauty,fashion,eat,human,room,etc}/*.{jpg,jpeg,png,JPG,JPEG,PNG}',
  { eager: true },
);

function sortKey(path: string) {
  const file = path.split('/').pop() ?? path;
  return file.replace(/(\d+)/g, (num) => num.padStart(6, '0'));
}

export const categories: Category[] = folders.map((folder) => {
  const images = Object.entries(files)
    .filter(([path]) => path.replace(/\\/g, '/').includes(`/${folder.id}/`))
    .sort(([a], [b]) => sortKey(a).localeCompare(sortKey(b)))
    .map(([, mod]) => mod.default);

  return { ...folder, images };
});

export const profile = {
  label: 'Profile',
  ja: 'プロフィール',
  name: '青野　豊',
  kana: 'アオノ　ユタカ',
  lead: '光の角度、影の濃さ、背景の余白。商品の輪郭も、人の表情も、部屋の空気も、余計な演出で濁さないこと。それが AONO STUDIO の撮影です。',
  paragraphs: [
    '青野　豊（アオノ　ユタカ）は1953年生まれ。AONO STUDIO 代表、フォトグラファーです。1977年にフォトムへ入社し、1981年の独立以降、商品撮影を軸に活動してきました。',
    'Pen Magazine、ELLE DECO、GetNavi などの雑誌から、アメリカン・エキスプレス、ヘインズ、テルモまで。ハイブランドのバッグや化粧品、日用品、自動車、医療器具と、被写体は分野を越えます。人物、料理、インテリアも、同じ眼差しで撮っています。',
    '撮影からレタッチ、デジタル納品までを一貫して手がけます。目黒の事務所にはスタジオを併設しており、打ち合わせから撮影まで、同じ場所で進められます。',
  ],
};

export const timeline = [
  { year: '1953', text: '生まれる' },
  { year: '1977', text: 'フォトム入社' },
  { year: '1981', text: '独立' },
  { year: '現在', text: '撮影を続ける' },
];

export const services = ['撮影', 'レタッチ', 'デジタル納品'];
