import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <Sidebar />


      {/* Main Area */}
      <div className="flex-1">

        <Navbar />


        <main className="p-8 animate-fade-in max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>


      </div>

    </div>
  );
}


export default Layout;