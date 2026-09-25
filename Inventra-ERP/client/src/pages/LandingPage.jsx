import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Truck,
  Layers,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Database,
  Server,
  Code2,
  Star,
  DollarSign,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  ChevronRight,
  Boxes,
  Check,
  RefreshCw,
  ExternalLink,
  Laptop
} from "lucide-react";
import Logo from "../components/Logo";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [billingPeriod, setBillingPeriod] = useState("annual");
  const [openFaq, setOpenFaq] = useState(null);
  const [orderVolume, setOrderVolume] = useState(450);

  // Simulated live demo state
  const [demoCart] = useState([
    { id: 1, name: "Ergonomic Mechanical Keyboard", price: 3499, qty: 2 },
    { id: 2, name: "Wireless Gaming Mouse RGB", price: 1899, qty: 1 }
  ]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSimulateOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
    }, 3500);
  };

  // ROI calculations
  const hoursSaved = Math.round(orderVolume * 0.18);
  const costSavings = Math.round(orderVolume * 75);
  const stockoutRiskReduction = Math.min(99, Math.round(75 + orderVolume * 0.04));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500/20 selection:text-blue-800 relative overflow-x-hidden">
      {/* Soft Ambient Light Blobs - Faint Blue & Faint Indigo matching clean Dashboard Palette */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] animate-blob" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-indigo-500/5 rounded-full blur-[140px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-[650px] h-[650px] bg-sky-500/5 rounded-full blur-[160px] animate-blob animation-delay-4000" />
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP LIGHT LIQUID NAV */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto rounded-2xl liquid-glass-light border border-slate-200/60 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-md backdrop-blur-xl">
          {/* Brand Logo */}
          <Link to="/login" className="flex items-center gap-3 group">
            <Logo className="w-9 h-9 transition-transform group-hover:scale-110 duration-300" />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Inventra<span className="text-blue-600">.ERP</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 -mt-1">
                Enterprise OS
              </span>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-semibold text-slate-600">
            <a
              href="#modules"
              className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              Modules
            </a>
            <a
              href="#interactive-demo"
              className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-slate-200/50 transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              Live Demo
            </a>
            <a
              href="#workflow"
              className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              Workflow
            </a>
            <a
              href="#architecture"
              className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              Architecture
            </a>
            <a
              href="#roi"
              className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              ROI Tool
            </a>
            <a
              href="#pricing"
              className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="px-3.5 py-1.5 rounded-xl hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 hidden sm:inline-flex items-center gap-1.5"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="liquid-btn-primary px-4 sm:px-5 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <span>Launch ERP</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION - LIGHT CORPORATE DASHBOARD PALETTE */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        {/* Soft Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-badge-light mb-8 animate-fade-in border border-blue-200/60">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
          <span className="text-xs font-bold text-blue-700">
            Inventra ERP • Enterprise Resource Planning OS
          </span>
          <ChevronRight size={14} className="text-blue-500" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1] mb-6 animate-slide-up">
          Unified Inventory, Sales &amp; Procurement in{" "}
          <span className="gradient-text-blue">One Professional Platform</span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed mb-10 text-balance">
          Eliminate stock discrepancies, accelerate checkout speeds, track suppliers,
          and unlock comprehensive business statistics with real-time relational precision.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/login"
            className="w-full sm:w-auto liquid-btn-primary px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-white flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 group"
          >
            <span>Access ERP Portal</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto liquid-glass-light hover:bg-white px-8 py-4 rounded-2xl font-semibold text-sm sm:text-base text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center gap-2 border border-slate-200"
          >
            <PlayCircle size={18} className="text-blue-600" />
            <span>Interactive Module Tour</span>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          <div className="liquid-glass-card-light rounded-2xl p-5 text-left border border-slate-200/80 bg-white">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">99.98%</div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Stock Accuracy
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Zero manual log drift</div>
          </div>
          <div className="liquid-glass-card-light rounded-2xl p-5 text-left border border-slate-200/80 bg-white">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">&lt; 15ms</div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Sync Latency
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Instant database records</div>
          </div>
          <div className="liquid-glass-card-light rounded-2xl p-5 text-left border border-slate-200/80 bg-white">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">4.8x</div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Checkout Speed
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Efficient invoice processing</div>
          </div>
          <div className="liquid-glass-card-light rounded-2xl p-5 text-left border border-slate-200/80 bg-white">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">100%</div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Audit Trails
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Strict database compliance</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE SIMULATION STUDIO */}
      {/* ========================================================================= */}
      <section id="interactive-demo" className="relative z-10 py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill-light text-xs font-bold text-blue-700 border border-slate-200 mb-3">
            <Sparkles size={13} className="text-blue-600" />
            Live Component Workspace
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore Actual System Components
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            Click through the workspace modules below to simulate invoice and stock updates.
          </p>
        </div>

        {/* Clean Light-Mode OS Container Frame */}
        <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-7 shadow-xl">
          {/* Header controls bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-xs font-mono text-slate-500 ml-2">
                inventra://erp.portal/workspace/preview
              </span>
            </div>

            {/* Simulated Workspace Selector tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === "dashboard"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <BarChart3 size={14} />
                <span>Dashboard Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === "inventory"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Package size={14} />
                <span>Stock Matrix</span>
              </button>
              <button
                onClick={() => setActiveTab("pos")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === "pos"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <ShoppingCart size={14} />
                <span>Sales Checkout</span>
              </button>
              <button
                onClick={() => setActiveTab("procurement")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === "procurement"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Truck size={14} />
                <span>Procurement PO</span>
              </button>
            </div>
          </div>

          {/* Module 1: Dashboard View */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase">Products</span>
                    <Package size={16} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">1,482 SKUs</div>
                  <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                    <TrendingUp size={12} /> +12 this week
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase">Revenue</span>
                    <DollarSign size={16} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">₹ 4,892,400</div>
                  <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                    <TrendingUp size={12} /> +24.8% monthly
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase">Net Profits</span>
                    <TrendingUp size={16} className="text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mt-2">₹ 1,324,800</div>
                  <div className="text-[11px] text-indigo-600 mt-1 font-semibold">27.08% Margin</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold uppercase">Low Stock</span>
                    <AlertTriangle size={16} className="text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-amber-600 mt-2">3 items</div>
                  <div className="text-[11px] text-amber-600 mt-1 font-semibold">Replenish alert</div>
                </div>
              </div>

              {/* Chart + Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Operational Inflow</h4>
                      <p className="text-xs text-slate-500">Live ledger transaction volume</p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">
                      Live Stream
                    </span>
                  </div>

                  <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
                    {[
                      { m: "Jan", v: 45 },
                      { m: "Feb", v: 58 },
                      { m: "Mar", v: 52 },
                      { m: "Apr", v: 68 },
                      { m: "May", v: 74 },
                      { m: "Jun", v: 89 },
                      { m: "Jul", v: 95 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-slate-200 rounded-t-lg relative overflow-hidden h-32 flex items-end">
                          <div
                            style={{ height: `${item.v}%` }}
                            className="w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-500 transition-all"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">{item.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ledger Feed */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                    <span>Recent Sales</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">SYNCED</span>
                  </h4>
                  <div className="space-y-3">
                    {[
                      { inv: "INV-2026-8901", name: "Apex Retailers Ltd", amt: "₹ 48,200" },
                      { inv: "INV-2026-8902", name: "CyberTech Hub", amt: "₹ 112,500" },
                      { inv: "INV-2026-8903", name: "Nova Supply Corp", amt: "₹ 24,600" },
                      { inv: "INV-2026-8904", name: "Quantum Systems", amt: "₹ 68,900" }
                    ].map((t, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800">{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{t.inv}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">{t.amt}</div>
                          <span className="text-[9px] font-bold text-emerald-600">COMPLETED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Module 2: Stock Matrix View */}
          {activeTab === "inventory" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600 font-semibold">
                  Real-time stock balance records inside warehouse directories
                </span>
                <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  Prisma Engine
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3">Stock Level</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      { name: "UltraHD Curved Monitor 34\"", sku: "MON-34-4K", cat: "Electronics", price: "₹ 38,999", stock: 48, status: "In Stock" },
                      { name: "Wireless Mechanical Keyboard", sku: "KB-MECH-PRO", cat: "Peripherals", price: "₹ 4,599", stock: 124, status: "In Stock" },
                      { name: "Studio Microphone XLR", sku: "MIC-XLR-PRO", cat: "Audio", price: "₹ 11,499", stock: 4, status: "Low Stock" },
                      { name: "Ergonomic Mesh Chair", sku: "CHR-ERG-900", cat: "Furniture", price: "₹ 16,800", stock: 32, status: "In Stock" },
                      { name: "Thunderbolt 4 Docking Station", sku: "DCK-TB4-12P", cat: "Peripherals", price: "₹ 19,250", stock: 2, status: "Critical" }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-800">{row.name}</td>
                        <td className="p-3 font-mono text-slate-500">{row.sku}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            {row.cat}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{row.price}</td>
                        <td className="p-3 font-semibold text-slate-800">{row.stock} units</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === "In Stock"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : row.status === "Low Stock"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Module 3: POS Invoicing View */}
          {activeTab === "pos" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ShoppingCart size={16} className="text-blue-600" />
                    <span>POS Terminal Checkout</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Invoice ID: INV-2026-9042</span>
                </div>

                <div className="space-y-3 mb-4">
                  {demoCart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          ₹ {item.price.toLocaleString()} × {item.qty}
                        </div>
                      </div>
                      <div className="text-right font-bold text-slate-900">
                        ₹ {(item.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-700 flex items-center justify-between">
                  <span>Client: Horizon Infotech Pvt Ltd</span>
                  <span className="font-bold">GST: 33AAACH7891M1Z5</span>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-4">Ledger Summary</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-800">₹ 8,897.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span className="font-bold text-slate-800">₹ 1,601.46</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                      <span>Total Invoice</span>
                      <span className="text-blue-600">₹ 10,498.46</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {orderPlaced ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-700 font-bold flex items-center justify-center gap-2 animate-fade-in">
                      <CheckCircle2 size={16} />
                      <span>Stock Sync Complete</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSimulateOrder}
                      className="w-full liquid-btn-primary py-3 rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Zap size={14} />
                      <span>Simulate Invoice Execution</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Module 4: Procurement */}
          {activeTab === "procurement" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-xs text-slate-500 font-bold uppercase">Active Suppliers</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">42 Registered</div>
                  <span className="text-[11px] text-blue-600 font-semibold">Ledger verified</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-xs text-slate-500 font-bold uppercase">Pending Shipments</span>
                  <div className="text-xl font-bold text-amber-600 mt-1">5 Purchase Orders</div>
                  <span className="text-[11px] text-amber-600 font-semibold">Gate in checklist</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-xs text-slate-500 font-bold uppercase">Procurement Value</span>
                  <div className="text-xl font-bold text-emerald-600 mt-1">₹ 2,410,000</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Monthly spend total</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Truck size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">PO-8842 from TechSource Global</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      150× Mechanical Keyboards • Increments stock on gate pass confirmation
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                  Ready to Inward
                </span>
              </div>
            </div>
          )}

          {/* Bottom frame actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={14} className="text-blue-600" />
              Standard secure sessions with JWT token verification and PostgreSQL schema compliance
            </span>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              Access Complete ERP portal <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MODULES GRID */}
      {/* ========================================================================= */}
      <section id="modules" className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill-light text-xs font-bold text-blue-700 border border-slate-200 mb-3">
            <Boxes size={13} className="text-blue-600" />
            ERP Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Integrated Business Management
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3">
            Every module acts in synchronization, keeping your warehouse catalog, purchases,
            and invoices harmonized without latency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Inventory */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform">
              <Package size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Automated Inventory Hub</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Track thousands of SKUs across custom categories. Configure threshold notifications,
              and process instant stock sync checks.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Multi-tier SKU directory</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Low stock auto-alert warnings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Stock in/out transaction histories</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Sales */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform">
              <ShoppingCart size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">POS &amp; Sales Invoicing</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Generate sales invoices with automated tax calculations, customer assignments,
              and immediate warehouse quantity reduction.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Rapid multi-item order execution</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Subtotal &amp; GST auto-calculations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Customer invoice historical logs</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Supplier */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform">
              <Truck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Supplier &amp; PO Engine</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Manage complete vendor registries, issue purchases, and automatically increment
              associated items upon delivery.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Vendor profiles &amp; contact database</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Purchase order tracking lifecycle</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Auto-computed purchase unit costs</span>
              </li>
            </ul>
          </div>

          {/* Card 4: Reports */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">BI &amp; Financial Statistics</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Analyze performance via charts visualizing monthly revenue trajectories, net margins,
              and category-wise stock ratios.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Interactive area performance graphs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Gross net margin auto-calculators</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Exportable business intelligence data</span>
              </li>
            </ul>
          </div>

          {/* Card 5: CRM */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">CRM Directory</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Maintain detailed customer accounts, track sales histories, and calculate lifetime
              value variables easily.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Customer profile dossiers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Unified sales auto-complete integration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Detailed customer billing addresses</span>
              </li>
            </ul>
          </div>

          {/* Card 6: Security */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-105 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">JWT Authentication Guard</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Secure REST API endpoints with encrypted tokens, bcrypt password hashing,
              and strict server verification middleware.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Salted password hashing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Role-based routing boundaries</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Strict REST authorization headers</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. LIFE CYCLE FLOW */}
      {/* ========================================================================= */}
      <section id="workflow" className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-badge-light text-xs font-bold text-blue-700 mb-3 border border-blue-200">
              <RefreshCw size={13} className="text-blue-600" />
              Standard Process Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Synchronized Enterprise Data Lifecycle
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              From purchase orders to instant customer invoice checking, all databases stay aligned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-4 border border-blue-200">
                01
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Procure</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create purchase invoices. Inward items with auto-computed purchase cost ratios.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center mb-4 border border-indigo-200">
                02
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Sync Stock</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Prisma database transactions instantly increment stock levels across directories.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center mb-4 border border-sky-200">
                03
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Fulfill Sale</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Process retail sales items. The system validates quantity limits and writes reductions.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center mb-4 border border-slate-200">
                04
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Statistics</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Aggregate net profit results, monthly inflow charts, and low stock reports dynamically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TECH STACK ARCHITECTURE */}
      {/* ========================================================================= */}
      <section id="architecture" className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill-light text-xs font-bold text-blue-700 border border-slate-200 mb-3">
            <Code2 size={13} className="text-blue-600" />
            System Stack
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Robust Enterprise Web Technology
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3">
            Built on a standard node-based full-stack architecture to ensure scalability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Frontend */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
                <Laptop size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Frontend Client</h3>
                <p className="text-xs text-slate-500">React Interface</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">React 19 &amp; Vite</span>
                <span className="text-blue-600 font-semibold">Vite Bundler</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Tailwind CSS v4</span>
                <span className="text-blue-600 font-semibold">Utility Classes</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Recharts Statistics</span>
                <span className="text-blue-600 font-semibold">Interactive Graphs</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Lucide Icons</span>
                <span className="text-blue-600 font-semibold">Crisp Visuals</span>
              </div>
            </div>
          </div>

          {/* Backend */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
                <Server size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">API Gateway</h3>
                <p className="text-xs text-slate-500">Express REST Web Services</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Node.js &amp; Express</span>
                <span className="text-blue-600 font-semibold">API Controllers</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">JWT Token Security</span>
                <span className="text-blue-600 font-semibold">Middleware Gate</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Bcrypt Encryption</span>
                <span className="text-blue-600 font-semibold">Password Salts</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Axios API Client</span>
                <span className="text-blue-600 font-semibold">Axios Interceptors</span>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">
                <Database size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Data Directory</h3>
                <p className="text-xs text-slate-500">PostgreSQL Schema</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">PostgreSQL</span>
                <span className="text-blue-600 font-semibold">Relational Database</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Prisma ORM</span>
                <span className="text-blue-600 font-semibold">Schema Models</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Relational Models</span>
                <span className="text-blue-600 font-semibold">Foreign Key Cascades</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Transaction Logs</span>
                <span className="text-blue-600 font-semibold">STOCK_IN / OUT Enums</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BENCHMARK TABLE */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill-light text-xs font-bold text-blue-700 border border-slate-200 mb-3">
            <Layers size={13} className="text-blue-600" />
            Comparison Matrix
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Inventra Outperforms Manual Alternatives
          </h2>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-4 sm:p-5">Feature Variable</th>
                <th className="p-4 sm:p-5 text-blue-700 font-bold bg-blue-50 border-x border-blue-100">
                  ⚡ Inventra ERP
                </th>
                <th className="p-4 sm:p-5 text-slate-600">Legacy ERP Suites</th>
                <th className="p-4 sm:p-5 text-slate-600">Spreadsheets / Manual Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-800">Data Synchronicity</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-blue-50/50 border-x border-blue-100/50 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Instant (&lt; 15ms)
                </td>
                <td className="p-4 sm:p-5">Delayed hourly syncing</td>
                <td className="p-4 sm:p-5 text-red-600">Manual entry delays</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-800">User Interface</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-blue-50/50 border-x border-blue-100/50 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Clean Dashboard Layout
                </td>
                <td className="p-4 sm:p-5">Complex, bloated 90s-style UI</td>
                <td className="p-4 sm:p-5">Basic spreadsheet tables</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-800">Transaction History</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-blue-50/50 border-x border-blue-100/50 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Auto-written Audit Logs
                </td>
                <td className="p-4 sm:p-5">Complex custom modules</td>
                <td className="p-4 sm:p-5 text-red-600">Easily deleted / edited</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-800">Automated Sales POS</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-blue-50/50 border-x border-blue-100/50 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Automatic stock deduction
                </td>
                <td className="p-4 sm:p-5">Requires manual re-indexing</td>
                <td className="p-4 sm:p-5 text-red-600">No automation triggers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. ROI CALCULATOR */}
      {/* ========================================================================= */}
      <section id="roi" className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-badge-light text-xs font-bold text-blue-700 border border-blue-200 mb-3">
                <DollarSign size={13} className="text-blue-600" />
                ROI Estimator
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Calculate Monthly Operational Time Savings
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                Adjust the volume slider below to view the simulated overhead reductions and
                time-saved metrics with Inventra ERP.
              </p>

              {/* Slider */}
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <label htmlFor="volume-slider" className="text-slate-700">Monthly Order Volume</label>
                  <span className="text-blue-600 font-bold text-base">{orderVolume} orders/mo</span>
                </div>
                <input
                  id="volume-slider"
                  type="range"
                  min="50"
                  max="2500"
                  step="50"
                  value={orderVolume}
                  onChange={(e) => setOrderVolume(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                  <span>50 orders</span>
                  <span>1,000 orders</span>
                  <span>2,500+ orders</span>
                </div>
              </div>
            </div>

            {/* Metric Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left shadow-sm">
                <span className="text-xs text-slate-500 font-bold uppercase">Time Saved</span>
                <div className="text-3xl font-black text-slate-900 mt-1">~{hoursSaved} hrs</div>
                <div className="text-xs text-blue-600 mt-2 font-bold">Per Month In Data Syncing</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left shadow-sm">
                <span className="text-xs text-slate-500 font-bold uppercase">Estimated Savings</span>
                <div className="text-3xl font-black text-blue-600 mt-1">
                  ₹ {costSavings.toLocaleString()}
                </div>
                <div className="text-xs text-slate-600 mt-2 font-bold">Fewer Stock discrepancies</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left sm:col-span-2 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Stockout Risk Reduced</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {stockoutRiskReduction}% Fewer Out-of-Stocks
                  </div>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                  <ShieldCheck size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. TESTIMONIALS */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill-light text-xs font-bold text-blue-700 border border-slate-200 mb-3">
            <Star size={13} className="text-blue-600" />
            Client Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Supply Chain Operations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white">
            <div className="flex items-center gap-1 text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              &quot;Switching to Inventra reduced our inventory discrepancies down to zero. The
              checkout speed is remarkable and the relational schema handles heavy volume with ease.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                AK
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Anand Kumar</div>
                <div className="text-xs text-slate-500 font-semibold">Operations, Apex Retail</div>
              </div>
            </div>
          </div>

          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white">
            <div className="flex items-center gap-1 text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              &quot;Our store managers started using it in minutes. The clean light-mode dashboard matches
              our enterprise software style guidelines perfectly without unnecessary clutter.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                PR
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Pooja Ramesh</div>
                <div className="text-xs text-slate-500 font-semibold">Logistics Director, NovaMart</div>
              </div>
            </div>
          </div>

          <div className="liquid-glass-card-light rounded-3xl p-7 border border-slate-200/80 bg-white">
            <div className="flex items-center gap-1 text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              &quot;The combination of Express.js, PostgreSQL, and Prisma ORM is extremely robust.
              Highly recommended for companies needing stable inventory tracking.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                VS
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Vikram Sethi</div>
                <div className="text-xs text-slate-500 font-semibold">CTO, CloudWare Solutions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. PRICING */}
      {/* ========================================================================= */}
      <section id="pricing" className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill-light text-xs font-bold text-blue-700 border border-slate-200 mb-3">
            <DollarSign size={13} className="text-blue-600" />
            Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Flexible Licensing Tiers
          </h2>

          {/* Billing switch */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className={`text-xs font-semibold ${
                billingPeriod === "monthly" ? "text-slate-900" : "text-slate-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "annual" ? "monthly" : "annual")}
              className="w-12 h-6 rounded-full bg-slate-200 p-1 relative border border-slate-300 transition-colors"
            >
              <div
                className={`w-4 h-4 rounded-full bg-blue-600 transition-transform ${
                  billingPeriod === "annual" ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 ${
                billingPeriod === "annual" ? "text-slate-900" : "text-slate-400"
              }`}
            >
              Annual
              <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full border border-blue-200 font-bold">
                Save 25%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* OS Community */}
          <div className="liquid-glass-card-light rounded-3xl p-8 border border-slate-200/80 bg-white flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Community Edition
              </div>
              <div className="text-3xl font-black text-slate-900 mb-4">Free / Self-Hosted</div>
              <p className="text-xs text-slate-500 mb-6">
                Open source codebase for developers and self-hosted instances.
              </p>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> Full codebase access
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> PostgreSQL &amp; Prisma support
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> Unlimited local SKUs
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>Access Portal</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          {/* Business Growth */}
          <div className="bg-white rounded-3xl p-8 border-2 border-blue-600 relative flex flex-col justify-between shadow-lg scale-105 z-20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-[10px] font-bold uppercase tracking-wider text-white rounded-full">
              Featured Plan
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                Business Growth
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                {billingPeriod === "annual" ? "₹ 2,499" : "₹ 3,299"}
                <span className="text-xs font-normal text-slate-400"> / month</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Fully hosted dashboard with automated secure database backups.
              </p>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> Real-time POS checkout module
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> Low stock alert notifications
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> Financial BI statistics reports
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> Dedicated 24/7 priority support
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link
                to="/login"
                className="w-full liquid-btn-primary py-3.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <span>Start Free Trial</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="liquid-glass-card-light rounded-3xl p-8 border border-slate-200/80 bg-white flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Enterprise Scale
              </div>
              <div className="text-3xl font-black text-slate-900 mb-4">Custom Quote</div>
              <p className="text-xs text-slate-500 mb-6">
                Dedicated server cluster instances for large scale business nodes.
              </p>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> Unlimited warehouses &amp; nodes
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> Dedicated database replication
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-blue-600 shrink-0" /> SLA uptime guarantee (99.99%)
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <span>Contact Sales</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FAQ */}
      {/* ========================================================================= */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill-light text-xs font-bold text-blue-700 border border-slate-200 mb-3">
            <HelpCircle size={13} className="text-blue-600" />
            General Q&amp;A
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does Inventra handle real-time inventory deductions?",
              a: "When a checkout occurs in the Sales POS module, an Express.js controller opens an atomic PostgreSQL transaction. It verifies SKU quantities, updates the table, and logs the change to prevent stock discrepancies."
            },
            {
              q: "Can I import product data from CSV or Excel spreadsheets?",
              a: "Yes. Inventra includes REST API endpoints specifically mapped to import product categories, supplier contact info, and customer records directly from Excel structures."
            },
            {
              q: "Is there role-based permission control?",
              a: "Yes. JWT session structures hold role scopes. For instance, cashier accounts can be restricted to POS checkouts, whereas revenue reporting and procurement forms require ADMIN credentials."
            },
            {
              q: "What database is required for self-hosting?",
              a: "Inventra is built on PostgreSQL relational database software, handled dynamically through Prisma ORM schemas."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                    openFaq === idx ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. FINAL CALLOUT */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-14 text-center relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Streamline Your Enterprise Operations
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mb-8 leading-relaxed">
              Verify stock accuracy, accelerate billing transactions, and view live statistics
              within a secure database framework.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto liquid-btn-primary px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-white flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95"
              >
                <span>Launch ERP Workspace</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 px-8 py-4 rounded-2xl font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <span>Sign In to Session</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-200 bg-white pt-16 pb-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-black tracking-tight text-slate-900">
                Inventra<span className="text-blue-600">.ERP</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Enterprise Resource Planning platform for stock management, supplier coordination,
              sales tracking, and accounting insights.
            </p>
            <div className="text-xs text-slate-400 font-semibold">
              Designed &amp; Developed by <span className="text-slate-700">SRIRAM S</span>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              ERP Modules
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Sales POS
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Purchases
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Suppliers Registry
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              Statistics &amp; Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Executive Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Business Reports
                </Link>
              </li>
              <li>
                <a href="#roi" className="hover:text-blue-600 transition-colors">
                  ROI Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              Workspace Access
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Sign In Portal
                </Link>
              </li>
              <li>
                <a href="#architecture" className="hover:text-blue-600 transition-colors">
                  Prisma Schema
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-blue-600 transition-colors">
                  Licensing Plans
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Inventra ERP. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>PostgreSQL &amp; Express Stack</span>
            <span>JWT Authenticated</span>
            <span className="text-emerald-600 font-bold">● Operations Stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
