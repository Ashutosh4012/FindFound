import { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Home, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  Package, 
  Activity, 
  MapPin, 
  Calendar, 
  User, 
  ArrowRight, 
  SlidersHorizontal,
  LogOut
} from "lucide-react";
import "./Dashboard.css";

const API_URL = "https://your-render-backend.onrender.com/api";

// Demo mock data in case your backend is offline
const MOCK_ITEMS = [
  {
    _id: "1",
    title: "Money",
    description: "I lost my 1k money near the library.",
    location: "Library",
    date: "2026-08-18",
    type: "LOST",
    image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=500&auto=format&fit=crop&q=60",
    reportedBy: { name: "Ashutosh Panda" }
  },
  {
    _id: "2",
    title: "Black Wallet",
    description: "I found this item near B2 block.",
    location: "B2 Block",
    date: "2026-08-30",
    type: "FOUND",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60",
    reportedBy: { name: "Ashutosh Panda" }
  },
  {
    _id: "3",
    title: "Black Bag",
    description: "Lost my bag in the Canteen area.",
    location: "Canteen",
    date: "2026-08-30",
    type: "LOST",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
    reportedBy: { name: "Rohit Kumar" }
  },
  {
    _id: "4",
    title: "Student ID Card",
    description: "Found this ID card near Academic Block.",
    location: "Academic Block",
    date: "2026-08-29",
    type: "FOUND",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60",
    reportedBy: { name: "Neha Singh" }
  }
];

function Dashboard({ currentUser, onLogout, onReport }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/items`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setItems(Array.isArray(data.items) && data.items.length > 0 ? data.items : MOCK_ITEMS);
    } catch (error) {
      console.warn("Backend not reached, using mock data for preview:", error);
      setItems(MOCK_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const totalCount = items.length;
  const lostCount = items.filter((i) => i.type === "LOST").length;
  const foundCount = items.filter((i) => i.type === "FOUND").length;
  const activeCount = items.filter((i) => !i.status || i.status === "ACTIVE").length;

  const formatDate = (date) => {
    if (!date) return "Date unavailable";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Date unavailable" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (activeFilter === "LOST") result = result.filter((i) => i.type === "LOST");
    if (activeFilter === "FOUND") result = result.filter((i) => i.type === "FOUND");
    if (activeFilter === "RECENT") {
      result.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q));
    }
    return result;
  }, [items, activeFilter, search]);

  const userName = currentUser?.name || "Ashutosh Panda";
  const userInitial = userName.charAt(0).toUpperCase();
  const studentId = currentUser?.studentId || "Panda248CS10592";

  return (
    <div className="findback-dashboard">
      {/* SIDEBAR */}
      <aside className="fb-sidebar">
        <div className="fb-brand">
          <div className="fb-brand-logo">
            <Search size={20} />
          </div>
          <span>FindBack</span>
        </div>

        <nav className="fb-navigation">
          <button className="fb-nav-item active">
            <Home size={18} />
            <span>Dashboard</span>
          </button>
          <button className="fb-nav-item" onClick={() => onReport?.("LOST")}>
            <PlusCircle size={18} />
            <span>Report Lost</span>
          </button>
          <button className="fb-nav-item" onClick={() => onReport?.("FOUND")}>
            <CheckCircle2 size={18} />
            <span>Report Found</span>
          </button>
          <button className="fb-nav-item" onClick={() => document.getElementById("recent-items")?.scrollIntoView({ behavior: "smooth" })}>
            <Clock size={18} />
            <span>Recent Items</span>
          </button>
        </nav>

        <div className="fb-help-box">
          <h3>Need help?</h3>
          <p>Report an item and let your campus community help you find it.</p>
        </div>

        <div className="fb-sidebar-user">
          <div className="fb-user-avatar">{userInitial}</div>
          <div className="fb-user-info">
            <strong>{userName}</strong>
            <span>{studentId}</span>
          </div>
        </div>

        <button className="fb-logout" onClick={onLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN VIEW */}
      <main className="fb-main">
        {/* STATS */}
        <section className="fb-stats">
          <div className="fb-stat-card">
            <div className="fb-stat-icon purple"><Clock size={20} /></div>
            <div className="fb-stat-content">
              <span>Total Reports</span>
              <strong>{totalCount}</strong>
              <small>All time</small>
            </div>
          </div>
          <div className="fb-stat-card">
            <div className="fb-stat-icon red"><ShoppingBag size={20} /></div>
            <div className="fb-stat-content">
              <span>Lost Items</span>
              <strong>{lostCount}</strong>
              <small>All time</small>
            </div>
          </div>
          <div className="fb-stat-card">
            <div className="fb-stat-icon green"><Package size={20} /></div>
            <div className="fb-stat-content">
              <span>Found Items</span>
              <strong>{foundCount}</strong>
              <small>All time</small>
            </div>
          </div>
          <div className="fb-stat-card">
            <div className="fb-stat-icon blue"><Activity size={20} /></div>
            <div className="fb-stat-content">
              <span>Active Reports</span>
              <strong>{activeCount}</strong>
              <small>Needs attention</small>
            </div>
          </div>
        </section>

        {/* ITEMS SECTION */}
        <section className="fb-items-section" id="recent-items">
          <div className="fb-items-header">
            <div className="fb-items-heading">
              <h1>Recent Items</h1>
              <p>Browse the latest lost &amp; found reports from your campus community.</p>
            </div>

            <div className="fb-items-tools">
              <div className="fb-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search items, locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && <button className="fb-clear-search" onClick={() => setSearch("")}>×</button>}
              </div>

              <button className="fb-filter-button" onClick={() => setActiveFilter(activeFilter === "ALL" ? "LOST" : activeFilter === "LOST" ? "FOUND" : "ALL")}>
                <SlidersHorizontal size={15} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          <div className="fb-tabs">
            {["ALL", "LOST", "FOUND", "RECENT"].map((f) => (
              <button
                key={f}
                className={`fb-tab ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === "ALL" && "All Items"}
                {f === "LOST" && "Lost Items"}
                {f === "FOUND" && "Found Items"}
                {f === "RECENT" && "Recently Added"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="fb-empty-state"><div className="fb-spinner"></div></div>
          ) : (
            <div className="fb-item-grid">
              {filteredItems.map((item) => (
                <article className="fb-item-card" key={item._id}>
                  <div className="fb-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <div className={`fb-placeholder ${item.type.toLowerCase()}`}>
                        <Package size={30} />
                      </div>
                    )}
                    <span className={`fb-item-badge ${item.type.toLowerCase()}`}>{item.type}</span>
                    <span className="fb-item-time">1d ago</span>
                  </div>

                  <div className="fb-item-content">
                    <h3>{item.title}</h3>
                    <p className="fb-item-description">{item.description}</p>
                    <div className="fb-item-details">
                      <div><MapPin size={13} /> <span>{item.location}</span></div>
                      <div><Calendar size={13} /> <span>{formatDate(item.date)}</span></div>
                    </div>
                    <div className="fb-item-reporter">
                      <div className="fb-reporter-icon"><User size={12} /></div>
                      <span>Reported by <strong>{item.reportedBy?.name || "Student"}</strong></span>
                    </div>
                    <button className="fb-view-button" onClick={() => alert(`${item.title}\n\n${item.description}`)}>
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* BOTTOM PROMOS */}
        <section className="fb-report-section">
          <div className="fb-report-card lost">
            <div className="fb-report-art lost"><Search size={28} /></div>
            <div className="fb-report-content">
              <h3>Did you lose something?</h3>
              <p>Report your lost item and let the community help you find it.</p>
              <button onClick={() => onReport?.("LOST")}>
                <span>Report Lost</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="fb-report-card found">
            <div className="fb-report-art found"><Package size={28} /></div>
            <div className="fb-report-content">
              <h3>Found something?</h3>
              <p>Help someone by reporting found items in your campus.</p>
              <button onClick={() => onReport?.("FOUND")}>
                <span>Report Found Item</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;