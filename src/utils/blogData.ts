import { BlogPost } from "./types";

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "マッサージの効果：筋肉痛の軽減とリラクゼーション",
    slug: "massage-benefits-muscle-pain-relaxation",
    excerpt: "マッサージが筋肉痛の軽減やストレス軽減にどのように効果的かについて詳しく解説します。",
    content: `<p>マッサージは単に気持ちいいだけでなく、科学的にも様々な効果が証明されています。特に筋肉痛の軽減においては...</p><h2>筋肉痛のメカニズム</h2><p>運動後の筋肉痛は、筋繊維の微細な損傷と炎症によって引き起こされます。マッサージはこの炎症を軽減し、血流を促進することで回復を早めます。</p><h2>リラクゼーション効果</h2><p>マッサージ中に分泌されるエンドルフィンやセロトニンなどの神経伝達物質は、ストレスを軽減し、全体的な幸福感を高めます。</p>`,
    publishedAt: "2023-10-15",
    category: "健康",
    tags: ["マッサージ", "筋肉痛", "リラクゼーション", "健康"],
    coverImage: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3",
    readTime: 5,
    views: 1250,
    author_name: "山田 健太",
    author_avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    title: "アロマセラピーマッサージ：香りがもたらす癒やし",
    slug: "aromatherapy-massage-healing-through-scent",
    excerpt: "アロマセラピーマッサージの効果と、使用するエッセンシャルオイルの選び方についてご紹介します。",
    content: `<p>アロマセラピーマッサージは、マッサージとアロマセラピーを組み合わせたもので、心身のリラックスに非常に効果的です。エッセンシャルオイルの香りは...</p><h2>エッセンシャルオイルの選び方</h2><p>使用するエッセンシャルオイルは、その効果や香りを考慮して選びます。例えば、ラベンダーはリラックス効果が高く、ローズマリーは集中力を高める効果があります。</p><h2>マッサージの手法</h2><p>アロマセラピーマッサージでは、エッセンシャルオイルをキャリアオイルで希釈し、優しくマッサージします。これにより、香りの効果とマッサージの効果が相乗的に高まります。</p>`,
    publishedAt: "2023-10-20",
    category: "美容",
    tags: ["アロマセラピー", "マッサージ", "エッセンシャルオイル", "リラックス"],
    coverImage: "https://images.unsplash.com/photo-1504283394377-9609ca81f9ca?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3",
    readTime: 7,
    views: 890,
    author_name: "佐藤 美咲",
    author_avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    title: "自宅でできる簡単ストレッチ：肩こり解消",
    slug: "easy-home-stretches-relieve-shoulder-stiffness",
    excerpt: "肩こりを解消するための、自宅で簡単にできるストレッチ方法をご紹介します。",
    content: `<p>肩こりは、長時間のデスクワークやスマートフォンの使用によって引き起こされることが多いです。自宅で簡単にできるストレッチで、肩こりを解消しましょう。</p><h2>首のストレッチ</h2><p>首をゆっくりと左右に倒したり、回したりすることで、首の筋肉をほぐします。無理な力を加えず、ゆっくりと行うことが大切です。</p><h2>肩のストレッチ</h2><p>肩を回したり、腕を大きく回したりすることで、肩甲骨周りの筋肉をほぐします。これにより、肩こりが軽減されます。</p>`,
    publishedAt: "2023-10-25",
    category: "健康",
    tags: ["ストレッチ", "肩こり", "健康", "自宅"],
    coverImage: "https://images.unsplash.com/photo-1541534741688-6078c6baa3f3?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3",
    readTime: 4,
    views: 620,
    author_name: "高橋 翔太",
    author_avatar: "https://randomuser.me/api/portraits/men/12.jpg"
  },
  {
    id: 4,
    title: "睡眠の質を高める：寝る前のリラックス法",
    slug: "improve-sleep-quality-pre-sleep-relaxation",
    excerpt: "睡眠の質を高めるための、寝る前にできるリラックス方法をご紹介します。",
    content: `<p>睡眠の質を高めるためには、寝る前にリラックスすることが大切です。リラックスすることで、心身の緊張がほぐれ、スムーズな入眠を促します。</p><h2>瞑想</h2><p>瞑想は、心を落ち着かせ、リラックス効果を高める効果があります。寝る前に数分間瞑想することで、睡眠の質を高めることができます。</p><h2>入浴</h2><p>寝る前にぬるめのお湯に浸かることで、心身の緊張がほぐれます。入浴後、体温が下がることで、スムーズな入眠を促します。</p>`,
    publishedAt: "2023-10-30",
    category: "健康",
    tags: ["睡眠", "リラックス", "健康", "瞑想", "入浴"],
    coverImage: "https://images.unsplash.com/photo-1485815749033-d1f00eb0b754?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3",
    readTime: 6,
    views: 950,
    author_name: "中村 里奈",
    author_avatar: "https://randomuser.me/api/portraits/women/21.jpg"
  },
  {
    id: 5,
    title: "初心者向け：ヨガの基本ポーズ",
    slug: "beginners-guide-basic-yoga-poses",
    excerpt: "ヨガの基本ポーズをご紹介します。初心者でも簡単にできるポーズばかりです。",
    content: `<p>ヨガは、心身のバランスを整え、リラックス効果を高める効果があります。初心者でも簡単にできるポーズから始めてみましょう。</p><h2>山のポーズ</h2><p>山のポーズは、ヨガの基本となるポーズです。姿勢を正し、呼吸を整えることで、心身のバランスを整えます。</p><h2>木のポーズ</h2><p>木のポーズは、バランス感覚を養うポーズです。片足で立ち、もう片方の足を太ももの内側に当て、両手を合わせます。</p>`,
    publishedAt: "2023-11-05",
    category: "美容",
    tags: ["ヨガ", "美容", "健康", "ポーズ"],
    coverImage: "https://images.unsplash.com/photo-1532629338549-42f451b3463a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3",
    readTime: 8,
    views: 1100,
    author_name: "小林 大輔",
    author_avatar: "https://randomuser.me/api/portraits/men/4.jpg"
  }
];
