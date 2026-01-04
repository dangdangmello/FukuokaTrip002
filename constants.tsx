
import { DayPlan, Category } from './types';

export const INITIAL_DAYS: DayPlan[] = [
  {
    date: '1/11',
    weekday: 'SUN',
    itinerary: [
      {
        id: '1',
        name: 'CI110 台北-福岡',
        category: '航班',
        startTime: '06:50',
        endTime: '10:00',
        transportMode: 'plane',
        notes: 'T2 航廈，提早2小時。',
        lat: 33.5859,
        lng: 130.4462
      },
      {
        id: 'hotel-d1',
        name: 'The Breakfast Hotel',
        category: '住宿',
        startTime: '11:00',
        endTime: '11:30',
        transportMode: 'car',
        transportDetail: '計程車: 國際航廈1F直達天神 (約20分鐘，¥2500)。',
        openingHours: '24小時營業',
        bookingLink: 'https://www.agoda.com/',
        notes: '先寄放行李，卡特&阿圓推薦這間飯店。',
        lat: 33.5901,
        lng: 130.4044
      },
      {
        id: '3',
        name: 'Shin-Shin 拉麵 天神本店',
        category: '美食',
        startTime: '11:45',
        endTime: '12:45',
        transportMode: 'walk',
        transportDetail: '步行約 8 分鐘。',
        openingHours: '11:00–03:00 (無公休)',
        bookingLink: 'https://www.hakata-shinshin.com/',
        notes: '博多必吃，卡特阿圓強力推薦。',
        lat: 33.5932,
        lng: 130.3977
      },
      {
        id: '4',
        name: '櫛田神社 & 川端通',
        category: '景點',
        startTime: '13:30',
        endTime: '15:30',
        transportMode: 'train',
        transportDetail: '地鐵空港線: 天神站 -> 櫛田神社前站 (1站)。',
        openingHours: '04:00–22:00 (神社服務)',
        notes: '博多總鎮守，感受傳統文化。',
        lat: 33.5930,
        lng: 130.4105
      },
      {
        id: '6',
        name: '博多運河城 (Canal City)',
        category: '購物',
        startTime: '16:00',
        endTime: '18:30',
        transportMode: 'walk',
        transportDetail: '就在神社旁邊，步行 3 分鐘。',
        openingHours: '10:00–21:00',
        notes: '博多區最大的商場，噴水秀每半小時一次。',
        lat: 33.5898,
        lng: 130.4107
      },
      {
        id: '7',
        name: '博多牛腸鍋 Ooyama',
        category: '美食',
        startTime: '19:00',
        endTime: '21:00',
        transportMode: 'walk',
        transportDetail: '步行至博多車站 (約 10 分鐘)。',
        openingHours: '11:00–23:00 (無休)',
        bookingLink: 'https://www.motu-ooyama.com/reservation/',
        notes: '已預約。就在博多車站旁 KITTE 大樓。',
        lat: 33.5892,
        lng: 130.4211
      }
    ]
  },
  {
    date: '1/12',
    weekday: 'MON',
    itinerary: [
      {
        id: 'hotel-d2',
        name: 'The Breakfast Hotel (出發)',
        category: '住宿',
        startTime: '08:00',
        endTime: '08:45',
        openingHours: '早餐 07:00 開始',
        notes: '吃完豐盛早餐後出發。',
        lat: 33.5901,
        lng: 130.4044
      },
      {
        id: '9',
        name: '西鐵天神站',
        category: '交通',
        startTime: '08:50',
        endTime: '09:15',
        transportMode: 'walk',
        openingHours: '05:00–24:00',
        notes: '購買柳川太宰府觀光套票。',
        lat: 33.5898,
        lng: 130.3995
      },
      {
        id: '10',
        name: '柳川遊船',
        category: '景點',
        startTime: '10:15',
        endTime: '11:30',
        transportMode: 'train',
        transportDetail: '西鐵特急: 西鐵福岡(天神) -> 西鐵柳川 (約50分)。',
        openingHours: '09:00–17:00 (無休)',
        notes: '水都柳川悠閒遊船體驗。',
        lat: 33.2657,
        lng: 130.4077
      },
      {
        id: '11',
        name: '若松屋 (Wakamatsuya)',
        category: '美食',
        startTime: '11:45',
        endTime: '13:00',
        transportMode: 'walk',
        openingHours: '11:00–19:30 (週三休)',
        notes: '必吃蒸鰻魚飯，今日週一正常營業。',
        lat: 33.2616,
        lng: 130.4014
      },
      {
        id: '12',
        name: '太宰府天滿宮',
        category: '景點',
        startTime: '14:30',
        endTime: '16:00',
        transportMode: 'train',
        openingHours: '06:30–19:00 (全年無休)',
        notes: '表參道散策、星巴克旗艦店、梅枝餅。',
        lat: 33.5215,
        lng: 130.5349
      },
      {
        id: 'yatai-d2',
        name: '中洲屋台街',
        category: '美食',
        startTime: '19:00',
        endTime: '21:00',
        transportMode: 'train',
        openingHours: '18:00–00:00',
        notes: '感受福岡最道地的夜晚氛圍。',
        lat: 33.5906,
        lng: 130.4085
      }
    ]
  },
  {
    date: '1/13',
    weekday: 'TUE',
    itinerary: [
      {
        id: 'mina',
        name: 'Mina 天神 (卡特買爆區)',
        category: '購物',
        startTime: '10:00',
        endTime: '12:30',
        transportMode: 'walk',
        openingHours: '10:00–20:00',
        notes: '卡特形容的「買爆區」！品牌：九州最大 Uniqlo/GU、大型 Loft (有 Olive Young 專區)、3COINS 質感雜貨。',
        lat: 33.5939,
        lng: 130.3989
      },
      {
        id: 'mentaiju',
        name: '元祖博多明太重',
        category: '美食',
        startTime: '12:45',
        endTime: '14:00',
        transportMode: 'walk',
        openingHours: '07:00–22:30',
        notes: '福岡必吃網紅名店，建議提前預約。',
        lat: 33.5910,
        lng: 130.4045
      },
      {
        id: 'parco-complex',
        name: '天神首戰: PARCO & Solaria',
        category: '購物',
        startTime: '14:15',
        endTime: '16:00',
        transportMode: 'walk',
        openingHours: '10:00–20:30',
        notes: '【PARCO】年輕女生服飾聖地：Snidel, Gelato Pique, @cosme, 伊都きんぐ草莓甜點(B2)。【SOLARIA】質感選物：卡特大推 Beauty & Youth, FREAK\'S STORE。',
        lat: 33.5915,
        lng: 130.3989
      },
      {
        id: 'daimyo',
        name: '大名區 (福岡裏原宿)',
        category: '購物',
        startTime: '16:15',
        endTime: '17:45',
        transportMode: 'walk',
        openingHours: '11:00–20:00',
        notes: '福岡的「裏原宿」，巷弄潮流聖地。品牌：Supreme, Stussy, 各式古著屋 (Vintage Shops), 水曜日的愛麗絲。',
        lat: 33.5878,
        lng: 130.3954
      },
      {
        id: 'bic-underground',
        name: 'Bic Camera 2號館 & 地下街',
        category: '購物',
        startTime: '18:00',
        endTime: '18:45',
        openingHours: '10:00–21:00',
        notes: '【Bic Camera】卡特在這裡買了相機，買 3C 電器首選。【天神地下街】歐風石板路氣氛極佳，必吃 Ringo 蘋果派。',
        lat: 33.5888,
        lng: 130.3995
      },
      {
        id: '13',
        name: '葫蘆壽司 (Hyotan Sushi)',
        category: '美食',
        startTime: '19:00',
        endTime: '21:00',
        transportMode: 'walk',
        openingHours: '11:30–14:30, 17:00–21:00',
        notes: '天神排隊壽司名店。',
        lat: 33.5901,
        lng: 130.3991
      }
    ]
  },
  {
    date: '1/14',
    weekday: 'WED',
    itinerary: [
      {
        id: 'stock',
        name: 'Pain Stock (stock)',
        category: '美食',
        startTime: '08:20',
        endTime: '09:00',
        transportMode: 'walk',
        openingHours: '08:00–19:00',
        notes: '今日週三有營業！天神中央公園旁，著名的明太子法國麵包。',
        lat: 33.5915,
        lng: 130.4042
      },
      {
        id: 'daco',
        name: 'Dacomecca 麵包店',
        category: '美食',
        startTime: '09:30',
        endTime: '10:30',
        transportMode: 'train',
        openingHours: '08:00–20:00',
        notes: '博多站旁，森林系裝潢，明太子法棍極推。',
        lat: 33.5898,
        lng: 130.4192
      },
      {
        id: 'pancake-d4',
        name: 'PANCAKE HOUSE 博多丸井店',
        category: '美食',
        startTime: '11:00',
        endTime: '12:30',
        transportMode: 'walk',
        openingHours: '10:00–21:00',
        notes: '2F 必點荷蘭寶貝鬆餅。',
        lat: 33.5891,
        lng: 130.4208
      },
      {
        id: 'hakata-final',
        name: '博多車站最後衝刺',
        category: '購物',
        startTime: '14:30',
        endTime: '17:00',
        openingHours: '10:00–20:00',
        notes: '【博多阪急 B1】伴手禮補貨：Tubu Tube (明太子軟管/牙膏)、努努雞(冷炸雞)、博多通饅頭。【AMU EST】年輕商場：Hello Kitty 福岡限定磁鐵、各式卡通周邊。',
        lat: 33.5897,
        lng: 130.4208
      },
      {
        id: 'croissant',
        name: 'Il Forno del Mignon',
        category: '美食',
        startTime: '17:15',
        endTime: '17:45',
        openingHours: '07:00–23:00',
        notes: '車站內排隊迷你可頌，口感酥脆，適合帶回台或在機場享用。',
        lat: 33.5895,
        lng: 130.4205
      },
      {
        id: 'airport',
        name: '福岡機場 (FUK)',
        category: '航班',
        startTime: '18:15',
        endTime: '21:00',
        openingHours: '05:00–22:00',
        notes: '提早2小時報到。',
        lat: 33.5859,
        lng: 130.4462
      }
    ]
  }
];

export const CATEGORY_STYLES: Record<Category, { color: string; hex: string; icon: string }> = {
  '航班': { color: 'bg-blue-600', hex: '#2563eb', icon: 'fa-solid fa-plane' },
  '景點': { color: 'bg-emerald-500', hex: '#10b981', icon: 'fa-solid fa-camera-retro' },
  '美食': { color: 'bg-rose-500', hex: '#f43f5e', icon: 'fa-solid fa-utensils' },
  '交通': { color: 'bg-amber-500', hex: '#f59e0b', icon: 'fa-solid fa-bus' },
  '住宿': { color: 'bg-indigo-500', hex: '#6366f1', icon: 'fa-solid fa-hotel' },
  '購物': { color: 'bg-fuchsia-500', hex: '#d946ef', icon: 'fa-solid fa-bag-shopping' },
  '其他': { color: 'bg-slate-400', hex: '#94a3b8', icon: 'fa-solid fa-circle-question' }
};
