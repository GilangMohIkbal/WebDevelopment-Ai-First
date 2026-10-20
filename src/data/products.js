const products = [
  {
    id: 1,
    name: "Kaos Polos Cotton",
    description:
      "Kaos polos berbahan cotton combed 24s, nyaman dipakai sehari-hari.",
    category: "Fashion",
    price: 75000,
    image: "https://picsum.photos/seed/kaos-polos-cotton/400/400",
    variants: {
      colorOrSize: ["S", "M", "L", "XL"],
      quantity: 25,
    },
  },
  {
    id: 2,
    name: "Kemeja Flanel",
    description:
      "Kemeja flanel lengan panjang dengan potongan slim fit, cocok untuk acara semi-formal.",
    category: "Fashion",
    price: 120000,
    image: "https://picsum.photos/seed/kemeja-flanel/400/400",
    variants: {
      colorOrSize: ["M", "L", "XL"],
      quantity: 15,
    },
  },
  {
    id: 3,
    name: "Hoodie Oversize",
    description:
      "Hoodie oversize berbahan fleece, hangat dan stylish untuk cuaca dingin.",
    category: "Fashion",
    price: 180000,
    image: "https://picsum.photos/seed/hoodie-oversize/400/400",
    variants: {
      colorOrSize: ["Black", "Grey", "Navy"],
      quantity: 10,
    },
  },
  {
    id: 4,
    name: "Sepatu Sneakers",
    description:
      "Sepatu sneakers kasual dengan sol karet empuk, cocok untuk aktivitas sehari-hari.",
    category: "Footwear",
    price: 350000,
    image: "https://picsum.photos/seed/sepatu-sneakers/400/400",
    variants: {
      colorOrSize: ["39", "40", "41", "42", "43"],
      quantity: 8,
    },
  },
  {
    id: 5,
    name: "Sepatu Running",
    description:
      "Sepatu running ringan dengan teknologi cushioning, dirancang untuk lari jarak jauh.",
    category: "Footwear",
    price: 450000,
    image: "https://picsum.photos/seed/sepatu-running/400/400",
    variants: {
      colorOrSize: ["40", "41", "42", "43", "44"],
      quantity: 6,
    },
  },
  {
    id: 6,
    name: "Headphone Wireless",
    description:
      "Headphone wireless dengan noise cancelling dan baterai tahan hingga 20 jam.",
    category: "Electronics",
    price: 550000,
    image: "https://picsum.photos/seed/headphone-wireless/400/400",
    variants: {
      colorOrSize: ["Black", "White", "Blue"],
      quantity: 12,
    },
  },
  {
    id: 7,
    name: "Smartwatch",
    description:
      "Smartwatch dengan layar AMOLED, monitor detak jantung, dan tahan air.",
    category: "Electronics",
    price: 850000,
    image: "https://picsum.photos/seed/smartwatch/400/400",
    variants: {
      colorOrSize: ["Black", "Silver"],
      quantity: 5,
    },
  },
  {
    id: 8,
    name: "Tote Bag Canvas",
    description:
      "Tote bag berbahan canvas tebal, kapasitas besar untuk kebutuhan harian.",
    category: "Accessories",
    price: 60000,
    image: "https://picsum.photos/seed/tote-bag-canvas/400/400",
    variants: {
      colorOrSize: ["Natural", "Black", "Olive"],
      quantity: 30,
    },
  },
  {
    id: 9,
    name: "Kacamata Hitam",
    description:
      "Kacamata hitam dengan lensa polarized dan UV protection, gaya klasik.",
    category: "Accessories",
    price: 95000,
    image: "https://picsum.photos/seed/kacamata-hitam/400/400",
    variants: {
      colorOrSize: ["Black", "Tortoise"],
      quantity: 18,
    },
  },
];

module.exports = products;
