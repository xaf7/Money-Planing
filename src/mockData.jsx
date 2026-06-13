export const initialTransactions = [
  {
    id: 1,
    desc: "Kopi Susu Creamy",
    amount: 28000,
    type: "expense",
    category: "Makanan & Minuman",
    period: "harian",
  },
  {
    id: 2,
    desc: "Makan Siang Bento",
    amount: 45000,
    type: "expense",
    category: "Makanan & Minuman",
    period: "harian",
  },
  {
    id: 3,
    desc: "Gaji Bulanan",
    amount: 6500000,
    type: "income",
    category: "Umum",
    period: "bulanan",
  },
  {
    id: 4,
    desc: "Bensin Motor",
    amount: 50000,
    type: "expense",
    category: "Transportasi",
    period: "mingguan",
  },
  {
    id: 5,
    desc: "Nonton Bioskop + Popcorn",
    amount: 95000,
    type: "expense",
    category: "Hiburan & Healing",
    period: "mingguan",
  },
];

export const initialBudgets = [
  {
    id: "b1",
    category: "Makanan & Minuman",
    limit: 1500000,
    used: 73000,
    icon: "🍔",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "b2",
    category: "Transportasi",
    limit: 600000,
    used: 50000,
    icon: "🚗",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "b3",
    category: "Hiburan & Healing",
    limit: 800000,
    used: 95000,
    icon: "🎬",
    color: "from-purple-400 to-pink-500",
  },
];

export const initialSavings = [
  {
    id: "s1",
    target: "Beli Laptop Core i7",
    goal: 12000000,
    current: 4500000,
    icon: "💻",
  },
  {
    id: "s2",
    target: "Upgrade HP Baru",
    goal: 5000000,
    current: 1200000,
    icon: "📱",
  },
];
