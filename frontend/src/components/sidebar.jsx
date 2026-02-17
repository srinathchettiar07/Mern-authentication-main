// sidebar.jsx - Fixed nested button issue
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShoppingBag, 
  CreditCard, 
  Wallet,
  LogOut,
  Settings,
  ChevronRight
} from "lucide-react";

const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 }
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.25 }
  }
};

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const navigate = useNavigate();

  const baseLink = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group";
  const inactive = "text-gray-600 hover:text-orange-600 hover:bg-orange-50";
  const active = "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-200";

  const iconMap = {
    dashboard: LayoutDashboard,
    products: Package,
    suppliers: Truck,
    orders: ShoppingBag,
    transactions: CreditCard,
    expenses: Wallet,
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logout clicked");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-40 border-b border-orange-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
          className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center hover:bg-orange-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-orange-500" />
        </motion.button>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
            />
            
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl p-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                    <span className="text-white font-bold text-xl">A</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                      Admin Panel
                    </h2>
                    <p className="text-xs text-gray-400">v1.0.0</p>
                  </div>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center hover:bg-orange-100 transition-colors"
                >
                  <X className="w-5 h-5 text-orange-500" />
                </motion.button>
              </div>

              <nav className="flex flex-col gap-2">
                {links.map((link) => {
                  const Icon = iconMap[link.icon];
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `${baseLink} ${isActive ? active : inactive}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className={`relative z-10 ${isActive ? 'text-white' : ''}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="relative z-10 flex-1">{link.label}</span>
                          {isActive && (
                            <ChevronRight className="w-4 h-4 relative z-10" />
                          )}
                          {/* Hover effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Footer Links */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent my-4"></div>
                <NavLink
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </NavLink>
                {/* Fixed: Changed from button to div with onClick */}
                <div 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="hidden md:flex md:flex-col md:w-72 md:h-screen md:fixed md:left-0 md:top-0 bg-white shadow-2xl p-6"
      >
        {/* Logo Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 group hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-400 mt-1">Business Management</p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {links.map((link, index) => {
            const Icon = iconMap[link.icon];
            return (
              <motion.div
                key={link.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                onHoverStart={() => setHoveredLink(link.path)}
                onHoverEnd={() => setHoveredLink(null)}
              >
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? active : inactive}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="relative z-10 flex-1 font-medium">{link.label}</span>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="relative z-10"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      )}
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      {/* Hover effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-orange-50 to-transparent rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredLink === link.path ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">JD</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <motion.button 
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-4 h-4 text-orange-500" />
            </motion.button>
          </div>
        </motion.div>

        {/* Logout Button - Fixed: Changed from motion.button to motion.div */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg shadow-red-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </motion.div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

/* Sidebar links */
const links = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/products", label: "Products", icon: "products" },
  { path: "/suppliers", label: "Suppliers", icon: "suppliers" },
  { path: "/orders", label: "Orders", icon: "orders" },
  { path: "/transactions", label: "Transactions", icon: "transactions" },
  { path: "/expenses", label: "Expenses", icon: "expenses" }
];