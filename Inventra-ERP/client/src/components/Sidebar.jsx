import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Truck,
  FileText,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Products",
      icon: Package,
      path: "/products",
    },
    {
      name: "Customers",
      icon: Users,
      path: "/customers",
    },
    {
      name: "Sales",
      icon: ShoppingCart,
      path: "/sales",
    },
    {
      name: "Suppliers",
      icon: Truck,
      path: "/suppliers",
    },
    {
      name: "Purchases",
      icon: ShoppingCart,
      path: "/purchases",
    },
    {
      name: "Reports",
      icon: FileText,
      path: "/reports",
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen sticky top-0 flex flex-col justify-between border-r border-slate-800 shrink-0 z-40 p-5 overflow-y-auto">
      <div>
        {/* Animated Brand Badge */}
        <div className="flex items-center gap-3.5 mb-8 px-1 mt-2">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
              Inventra
            </h1>
            <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest block -mt-0.5">
              ERP System
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => {
                  console.log("Clicked:", item.name, "Path:", item.path);
                  navigate(item.path);
                }}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon size={19} className={isActive ? "text-white" : "text-slate-400"} />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-300 text-slate-400 hover:text-white hover:bg-red-600/20 active:scale-[0.98]"
      >
        <LogOut size={19} className="text-slate-400 hover:text-white" />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </div>
  );
}

export default Sidebar;