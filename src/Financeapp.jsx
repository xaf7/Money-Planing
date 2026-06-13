import React, { useState, useEffect } from "react";

// --- IMPORT FILE SUARA ---
// Sesuaikan path ini dengan tempat kamu menaruh file almak.mp3 di proyekmu
// Contoh: ditaruh di folder yang sama dengan file ini
import almakSound from "./almak.mp3";

// Default data jika Local Storage kosong murni saat pertama kali web dibuka
const defaultTransactions = [
  {
    id: 1,
    desc: "Kopi Susu Double Shot",
    amount: 28000,
    type: "expense",
    category: "Makanan & Minuman",
    period: "harian",
  },
  {
    id: 2,
    desc: "Makan Siang Bento Box",
    amount: 45000,
    type: "expense",
    category: "Makanan & Minuman",
    period: "harian",
  },
  {
    id: 3,
    desc: "Gaji Pokok Utama",
    amount: 7500000,
    type: "income",
    category: "Umum",
    period: "bulanan",
  },
  {
    id: 4,
    desc: "Isi Bensin Pertamax",
    amount: 60000,
    type: "expense",
    category: "Transportasi",
    period: "mingguan",
  },
  {
    id: 5,
    desc: "Nonton Bioskop IMAX",
    amount: 95000,
    type: "expense",
    category: "Hiburan & Healing",
    period: "mingguan",
  },
];

const defaultSavings = [
  {
    id: "s1",
    target: "Beli Laptop Core i7",
    goal: 12000000,
    current: 4500000,
    icon: "💻",
    image: null,
  },
  {
    id: "s2",
    target: "Upgrade HP Baru",
    goal: 5000000,
    current: 1200000,
    icon: "📱",
    image: null,
  },
];

export default function Financeapp() {
  // Ambil Google Fonts Nunito secara dinamis
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // --- LOGIKA UTAMA SOUND NOTIFIKASI ---
  const playNotificationSound = () => {
    const audio = new Audio(almakSound); // Menggunakan file audio hasil import di atas
    audio.currentTime = 0;
    audio.volume = 0.6; // Set volume di 60%
    audio.play().catch((err) => {
      console.log("Audio play diblokir oleh kebijakan interaksi browser:", err);
    });
  };

  // --- PERSISTENCE: INITIALIZE STATES FROM LOCAL STORAGE ---
  const [activeTab, setActiveTab] = useState("harian");
  const [selectedTxId, setSelectedTxId] = useState(null);

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("xaf_transactions");
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [savingsPlans, setSavingsPlans] = useState(() => {
    const saved = localStorage.getItem("xaf_savings");
    return saved ? JSON.parse(saved) : defaultSavings;
  });

  // Efek simpan otomatis ke Local Storage setiap kali data berubah
  useEffect(() => {
    localStorage.setItem("xaf_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("xaf_savings", JSON.stringify(savingsPlans));
  }, [savingsPlans]);

  // Form Input States
  const [newDesc, setNewDesc] = useState("");
  const [newAmountDisplay, setNewAmountDisplay] = useState("");
  const [newType, setNewType] = useState("expense");
  const [newCategory, setNewCategory] = useState("Makanan & Minuman");

  // Form Rencana Target States
  const [newPlanTarget, setNewPlanTarget] = useState("");
  const [newPlanGoalDisplay, setNewPlanGoalDisplay] = useState("");
  const [newPlanIcon, setNewPlanIcon] = useState("🎯");
  const [newPlanImage, setNewPlanImage] = useState(null); // Image base64 string opsional

  // Pop-up / Modal States
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [selectedItemsToClear, setSelectedItemsToClear] = useState({});
  const [showAllHistory, setShowAllHistory] = useState(false);

  // State Pengisian / Pengurangan Dana Celengan Individual
  const [activePlanForSaving, setActivePlanForSaving] = useState(null);
  const [savingInputDisplay, setSavingInputDisplay] = useState("");

  // --- LOGIKA UTAMA: SALDO GLOBAL TERHUBUNG ---
  const globalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const globalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const globalBalance = globalIncome - globalExpense;

  // Filter Data Transaksi Berdasarkan Tab
  const filteredTransactions = transactions.filter(
    (t) => t.period === activeTab,
  );
  const displayedTransactions = showAllHistory
    ? filteredTransactions
    : filteredTransactions.slice(0, 5);

  // --- HANDLER FORMAT UTILITAS ANGKA ---
  const handleAmountChange = (e, setter) => {
    const value = e.target.value;
    if (value === "") {
      setter("");
      return;
    }
    const cleanNumber = value.replace(/\D/g, "");
    if (!cleanNumber) {
      setter("");
      return;
    }
    setter(Number(cleanNumber).toLocaleString("id-ID"));
  };

  const getCleanRawNumber = (formattedValue) => {
    if (!formattedValue) return 0;
    return parseFloat(formattedValue.replace(/\./g, ""));
  };

  // Handler Konversi File Gambar Ke Base64 String (Opsional)
  const handleImageUploadChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Batasi ukuran gambar biar local storage tidak penuh (Maksimal ~1.5 MB)
    if (file.size > 1500000) {
      alert(
        "Ukuran file foto terlalu besar! Gunakan foto di bawah 1.5 MB agar bisa disimpan.",
      );
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPlanImage(reader.result); // Mengunci base64 string gambar
    };
    reader.readAsDataURL(file);
  };

  // Handler Simpan Catatan Baru + PEMICU NOTIFIKASI SUARA
  const handleAddTransaction = (e) => {
    e.preventDefault();
    const rawAmount = getCleanRawNumber(newAmountDisplay);
    if (!newDesc || rawAmount <= 0) return;

    const newTx = {
      id: Date.now(),
      desc: newDesc,
      amount: rawAmount,
      type: newType,
      category: newCategory,
      period: activeTab === "planning" ? "harian" : activeTab,
    };

    setTransactions([newTx, ...transactions]);

    // Bunyikan sound effect notifikasi tepat saat transaksi sukses disimpan!
    playNotificationSound();

    setNewDesc("");
    setNewAmountDisplay("");
  };

  // Handler Tambah Rencana Target Baru dengan Gambar Opsional
  const handleAddPlan = (e) => {
    e.preventDefault();
    const rawGoal = getCleanRawNumber(newPlanGoalDisplay);
    if (!newPlanTarget || rawGoal <= 0) return;

    const newPlan = {
      id: `plan-${Date.now()}`,
      target: newPlanTarget,
      goal: rawGoal,
      current: 0,
      icon: newPlanIcon,
      image: newPlanImage,
    };

    setSavingsPlans([...savingsPlans, newPlan]);

    // Reset form target
    setNewPlanTarget("");
    setNewPlanGoalDisplay("");
    setNewPlanImage(null);
    const fileInput = document.getElementById("plan-image-file");
    if (fileInput) fileInput.value = null;
  };

  // Modifikasi isi tabungan target (Tambah / Kurang Saldo Terkumpul)
  const handleUpdateSavingBalance = (isAdding) => {
    const rawAmount = getCleanRawNumber(savingInputDisplay);
    if (rawAmount <= 0 || !activePlanForSaving) return;

    setSavingsPlans(
      savingsPlans.map((plan) => {
        if (plan.id === activePlanForSaving.id) {
          const updatedCurrent = isAdding
            ? plan.current + rawAmount
            : Math.max(0, plan.current - rawAmount);
          return { ...plan, current: updatedCurrent };
        }
        return plan;
      }),
    );

    setSavingInputDisplay("");
    setActivePlanForSaving(null);
  };

  // Hapus Rencana Tabungan Target
  const handleDeletePlan = (id) => {
    setSavingsPlans(savingsPlans.filter((p) => p.id !== id));
  };

  // Modal Multi-Select Clear Handler
  const openClearModal = () => {
    const initialSelection = {};
    filteredTransactions.forEach((t) => {
      initialSelection[t.id] = true;
    });
    setSelectedItemsToClear(initialSelection);
    setIsClearModalOpen(true);
  };

  const toggleItemSelection = (id) => {
    setSelectedItemsToClear((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const executeClearSelected = () => {
    const idsToRemove = Object.keys(selectedItemsToClear).filter(
      (id) => selectedItemsToClear[id],
    );
    const updatedTransactions = transactions.filter(
      (t) => !idsToRemove.includes(t.id.toString()),
    );

    setTransactions(updatedTransactions);
    setIsClearModalOpen(false);
    setSelectedTxId(null);
  };

  const deleteSingleTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    if (selectedTxId === id) setSelectedTxId(null);
  };

  return (
    <div
      className="min-h-screen pb-24 modern-bg text-[#1E293B] antialiased"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* HEADER BANNER APP */}
      <nav className="bg-[#0F172A] sticky top-0 z-40 shadow-xl rounded-b-[2rem] border-b border-slate-800 px-5 pt-4 pb-5">
        <div className="max-w-md mx-auto flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-cyan-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                X
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-none">
                  Xaf Plan Money
                </h1>
                <span className="text-[10px] text-emerald-400 font-black tracking-widest uppercase">
                  Engine V1.4 Active
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-300 uppercase">
                Local Storage & Sound
              </span>
            </div>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-2xl border border-slate-100">
            {["harian", "mingguan", "bulanan", "planning"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedTxId(null);
                  setShowAllHistory(false);
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl capitalize transition-all duration-300 transform active:scale-95 ${
                  activeTab === tab
                    ? "bg-[#0F172A] text-white shadow-xl scale-105"
                    : "text-slate-400 hover:text-[#0F172A]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* BODY KONTEN UTAMA */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* CARD RINGKASAN SALDO GLOBAL: Sinkron Lintas Semua Tab */}
        <div className="bg-white p-6 rounded-[2.2rem] shadow-2xl border border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Sisa Saldo Dompet (Global)
            </span>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase">
              Sinkron
            </span>
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-800">
            Rp {globalBalance.toLocaleString("id-ID")}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Total Masuk
              </p>
              <p className="text-xs font-extrabold text-emerald-600">
                +{globalIncome.toLocaleString("id-ID")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Total Keluar
              </p>
              <p className="text-xs font-extrabold text-rose-500">
                -{globalExpense.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        {activeTab !== "planning" && (
          <div className="space-y-5 animate-fade-in">
            {/* FORM TAMBAH TRANSAKSI */}
            <div className="bg-white p-6 rounded-[2.2rem] shadow-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 bg-slate-100 rounded-xl">📝</span> Catat
                Finansial {activeTab}
              </h3>
              <form onSubmit={handleAddTransaction} className="space-y-3">
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Nama rincian transaksi..."
                  className="w-full px-5 py-3 text-sm border border-slate-200 bg-slate-50/60 rounded-xl focus:outline-none focus:border-[#0F172A] focus:bg-white transition-all shadow-inner font-semibold"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newAmountDisplay}
                    onChange={(e) => handleAmountChange(e, setNewAmountDisplay)}
                    placeholder="Nominal (Rp)"
                    className="w-full px-5 py-3 text-sm border border-slate-200 bg-slate-50/60 rounded-xl focus:outline-none focus:border-[#0F172A] focus:bg-white transition-all shadow-inner font-bold"
                    required
                  />
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-200 bg-slate-50/60 rounded-xl focus:outline-none font-black text-slate-700 shadow-inner"
                  >
                    <option value="expense">📉 Keluar</option>
                    <option value="income">📈 Masuk</option>
                  </select>
                </div>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-5 py-3 text-sm border border-slate-200 bg-slate-50/60 rounded-xl focus:outline-none font-black text-slate-600 shadow-inner"
                >
                  <option value="Makanan & Minuman">
                    🍔 Makanan & Minuman
                  </option>
                  <option value="Transportasi">🚗 Transportasi</option>
                  <option value="Hiburan & Healing">
                    🎬 Hiburan & Healing
                  </option>
                  <option value="Umum">💰 Kategori Umum</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#0F172A] text-white font-black py-3.5 rounded-xl shadow-lg transition transform active:scale-95 text-sm"
                >
                  Simpan Transaksi ({activeTab})
                </button>
              </form>
            </div>

            {/* RIWAYAT CATATAN: DIBATASI 5 DATA SAJA */}
            <div className="bg-white rounded-[2.2rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
                <h3 className="text-sm font-black text-slate-800">
                  Riwayat {activeTab}
                </h3>
                {filteredTransactions.length > 0 && (
                  <button
                    onClick={openClearModal}
                    className="text-[11px] font-black text-[#0F172A] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl active:scale-95 transition-all shadow-sm"
                  >
                    🗑️ Clear...
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100">
                {displayedTransactions.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs font-bold">
                    Belum ada aktivitas di periode ini.
                  </div>
                ) : (
                  displayedTransactions.map((t) => {
                    const isSelected = selectedTxId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() =>
                          setSelectedTxId(isSelected ? null : t.id)
                        }
                        className={`p-4 flex justify-between items-center transition-all ${isSelected ? "bg-slate-50 border-l-4 border-[#0F172A]" : ""}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {t.category === "Makanan & Minuman"
                              ? "🍔"
                              : t.category === "Transportasi"
                                ? "🚗"
                                : t.category === "Hiburan & Healing"
                                  ? "🎬"
                                  : "💰"}
                          </span>
                          <div>
                            <p className="font-extrabold text-xs text-slate-800">
                              {t.desc}
                            </p>
                            <span className="text-[9px] text-slate-400 font-black uppercase bg-gray-100 px-2 py-0.5 rounded-full">
                              {t.category}
                            </span>
                          </div>
                        </div>
                        <div
                          className="flex items-center space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p
                            className={`font-black text-xs ${t.type === "income" ? "text-emerald-600" : "text-slate-700"}`}
                          >
                            {t.type === "income" ? "+" : "-"}Rp{" "}
                            {t.amount.toLocaleString("id-ID")}
                          </p>
                          {isSelected && (
                            <button
                              onClick={() => deleteSingleTransaction(t.id)}
                              className="p-1 text-xs bg-rose-50 text-rose-600 rounded-md ml-2"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* TOMBOL LIHAT LEBIH LANJUT (Jika item lebih dari 5) */}
              {filteredTransactions.length > 5 && (
                <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                  <button
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-xs font-black text-[#0F172A] hover:underline"
                  >
                    {showAllHistory
                      ? "🔼 Sembunyikan Rincian"
                      : `🔽 Lihat Lebih Lanjut (${filteredTransactions.length - 5} Catatan Lain)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW TAB: PLANNING (ADA UNGGAL GAMBAR OPSIONAL) */}
        {activeTab === "planning" && (
          <div className="space-y-5 animate-fade-in">
            {/* Form Buat Target Baru */}
            <div className="bg-white p-6 rounded-[2.2rem] shadow-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="p-2 bg-emerald-50 rounded-xl">🎯</span> Target
                Rencana Baru
              </h3>
              <form onSubmit={handleAddPlan} className="space-y-3">
                <input
                  type="text"
                  value={newPlanTarget}
                  onChange={(e) => setNewPlanTarget(e.target.value)}
                  placeholder="Contoh: Tabungan Upgrade Laptop..."
                  className="w-full px-5 py-3 text-sm border border-slate-200 bg-slate-50/60 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={newPlanGoalDisplay}
                    onChange={(e) =>
                      handleAmountChange(e, setNewPlanGoalDisplay)
                    }
                    placeholder="Total Goal Rp"
                    className="w-full px-5 py-3 text-sm border border-slate-200 bg-slate-50/60 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                  <select
                    value={newPlanIcon}
                    onChange={(e) => setNewPlanIcon(e.target.value)}
                    className="w-full px-3 py-3 text-sm border border-slate-200 bg-slate-50/60 rounded-xl focus:outline-none font-black text-slate-600"
                  >
                    <option value="🎯">🎯 Umum</option>
                    <option value="💻">💻 Laptop</option>
                    <option value="📱">📱 Gadget</option>
                    <option value="🛡️">🛡️ Darurat</option>
                  </select>
                </div>

                {/* FILE INPUT OPSIONAL */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide block">
                    Upload Foto Target (Opsional)
                  </label>
                  <input
                    id="plan-image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUploadChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-100 file:text-[#0F172A] hover:file:bg-slate-200 cursor-pointer"
                  />
                  {newPlanImage && (
                    <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      ✓ Foto berhasil diproses & siap disimpan!
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-xl shadow-lg text-sm mt-2"
                >
                  Aktifkan Target
                </button>
              </form>
            </div>

            {/* PROGRESS TRACKER */}
            <div className="bg-white p-6 rounded-[2.2rem] shadow-2xl border border-slate-100 space-y-4">
              <h3 className="text-sm font-black text-slate-800">
                📊 Kemajuan Rencana Tabungan
              </h3>
              <div className="space-y-4">
                {savingsPlans.map((plan) => {
                  const pct = Math.min(
                    Math.round((plan.current / plan.goal) * 100),
                    100,
                  );
                  return (
                    <div
                      key={plan.id}
                      className="p-4 bg-gradient-to-br from-slate-50 to-emerald-50/10 rounded-2xl border border-slate-100 space-y-3 relative shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="absolute top-3 right-3 text-xs opacity-40 hover:opacity-100 z-10 bg-white/80 p-1 rounded-full shadow-sm"
                      >
                        ❌
                      </button>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          {/* LOGIKA DINAMIS: Foto Opsional vs Emoji */}
                          {plan.image ? (
                            <img
                              src={plan.image}
                              alt={plan.target}
                              className="w-11 h-11 rounded-xl object-cover shadow-md border-2 border-white"
                            />
                          ) : (
                            <span className="text-xl p-1.5 bg-white rounded-xl shadow-sm border">
                              {plan.icon}
                            </span>
                          )}

                          <div>
                            <h4 className="font-black text-xs text-slate-800">
                              {plan.target}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-bold">
                              Celengan Aktif
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-700">
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#0F172A] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between text-[10px] font-black text-slate-400">
                        <span>
                          Tersedia: Rp {plan.current.toLocaleString("id-ID")}
                        </span>
                        <span>
                          Goal: Rp {plan.goal.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setActivePlanForSaving(plan)}
                          className="text-[10px] bg-[#0F172A] text-white px-3 py-1.5 rounded-lg font-black hover:bg-slate-800 shadow-sm"
                        >
                          💰 Sesuaikan Dana Celengan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* POP-UP MODAL UPDATE DANA CELENGAN (TAMBAH/KURANG PLANNING) */}
      {activePlanForSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 space-y-4 shadow-2xl border animate-modal-scale">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm text-slate-800">
                Kelola Dana: {activePlanForSaving.target}
              </h3>
              <button
                onClick={() => setActivePlanForSaving(null)}
                className="text-xs font-bold text-slate-400"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={savingInputDisplay}
              onChange={(e) => handleAmountChange(e, setSavingInputDisplay)}
              placeholder="Masukkan Nominal Dana Rp..."
              className="w-full px-4 py-3 border rounded-xl text-center font-black text-base focus:outline-none bg-slate-50"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUpdateSavingBalance(false)}
                className="bg-rose-50 text-rose-600 font-black py-2.5 rounded-xl text-xs"
              >
                📉 Kurangi Dana
              </button>
              <button
                onClick={() => handleUpdateSavingBalance(true)}
                className="bg-emerald-600 text-white font-black py-2.5 rounded-xl text-xs shadow-md"
              >
                📈 Tambah Dana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL SELECTION (CLEAR TRANSACTION) */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-overlay-fade">
          <div className="bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.2rem] p-6 space-y-5 shadow-2xl border border-slate-100 transform animate-modal-scale max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <span>🗑️</span> Pilih Catatan untuk Di-clear
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                    Hanya item yang dicentang yang akan dihapus massal
                  </p>
                </div>
                <button
                  onClick={() => setIsClearModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[40vh] pr-1 mt-2 custom-scrollbar">
                {filteredTransactions.map((t) => {
                  const isChecked = !!selectedItemsToClear[t.id];
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleItemSelection(t.id)}
                      className="py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isChecked ? "bg-[#0F172A] border-[#0F172A]" : "border-slate-300 bg-white"}`}
                        >
                          {isChecked && (
                            <span className="text-white text-[10px] font-black">
                              ✓
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-slate-800">
                            {t.desc}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {t.category}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-black text-xs ${t.type === "income" ? "text-emerald-600" : "text-slate-600"}`}
                      >
                        {t.type === "income" ? "+" : "-"}Rp{" "}
                        {t.amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="w-full bg-slate-100 text-slate-600 font-black py-3 rounded-xl text-xs transition active:scale-95"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={executeClearSelected}
                className="w-full bg-rose-600 text-white font-black py-3 rounded-xl text-xs shadow-lg transition active:scale-95"
              >
                Clear Terpilih
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES PACK */}
      <style>{`
        .modern-bg {
          background: linear-gradient(135deg, #FFF6F6 0%, #FFFFFF 60%, #FFF8F8 100%);
          background-attachment: fixed;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalScale { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-overlay-fade { animation: overlayFade 0.25s ease-out forwards; }
        .animate-modal-scale { animation: modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
