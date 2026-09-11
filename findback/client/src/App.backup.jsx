import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "https://your-render-backend.onrender.com/api";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  location: "",
  date: "",
  image: "",
};
function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState("LOST");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/items`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch items");
      }

      setItems(data.items || []);
    } catch (error) {
      console.error("Fetch items error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openReportForm = (type) => {
    setReportType(type);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first to report an item.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_URL}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          type: reportType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to report item");
      }

      alert(
        reportType === "LOST"
          ? "Lost item reported successfully 🎉"
          : "Found item reported successfully 🎉"
      );

      setShowForm(false);
      setForm(emptyForm);
      await fetchItems();
    } catch (error) {
      console.error("Submit item error:", error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const activeItems = items.filter((item) => item.status === "ACTIVE");

  const lostItems = activeItems.filter((item) => item.type === "LOST");

  const foundItems = activeItems.filter((item) => item.type === "FOUND");

  const returnedItems = items.filter(
    (item) => item.status === "RETURNED"
  );

  const totalReports = items.length;

  const recentItems = useMemo(() => {
    return [...items]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date) -
          new Date(a.createdAt || a.date)
      )
      .slice(0, 5);
  }, [items]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getInitial = (name) => {
    if (!name) return "A";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">⌕</div>
          <span>FindBack</span>
        </div>

        <nav className="sidebar-nav">
          <a className="sidebar-link active" href="#dashboard">
            <span>▦</span>
            Dashboard
          </a>

          <a className="sidebar-link" href="#reports">
            <span>▣</span>
            My Reports
          </a>

          <a className="sidebar-link" href="#community">
            <span>♧</span>
            Community
          </a>

          <a className="sidebar-link" href="#campus">
            <span>◉</span>
            Campus Network
          </a>

          <a className="sidebar-link" href="#how-it-works">
            <span>?</span>
            How It Works
          </a>

          <a className="sidebar-link" href="#support">
            <span>?</span>
            Support
          </a>
        </nav>

        <div className="sidebar-help">
          <div className="help-art">
            <div className="wallet-shape">▰</div>
            <div className="spark spark-one">✦</div>
            <div className="spark spark-two">✦</div>
            <div className="spark spark-three">•</div>
          </div>

          <h3>Help others find their lost items</h3>

          <p>
            Be a good samaritan. Report found items and help your
            community.
          </p>

          <button className="purple-button">Learn More</button>
        </div>

        <div className="sidebar-footer">
          <div className="security-icon">◉</div>
          <p>© 2026 FindBack</p>
          <span>University Lost & Found</span>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-area">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-icon">⌕</span>
            FindBack
          </div>

          <nav className="top-nav">
            <a className="top-link active" href="#dashboard">
              Dashboard
            </a>

            <a className="top-link" href="#reports">
              My Reports
            </a>

            <a className="top-link" href="#profile">
              Profile
            </a>
          </nav>

          <div className="top-actions">
            <button className="notification-button" aria-label="Notifications">
              ♧
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">
              <div className="avatar">AS</div>

              <span className="user-name">Ashutosh</span>

              <span className="chevron">⌄</span>
            </div>
          </div>
        </header>

        <main className="content">
          {/* HERO */}
          <section className="hero-panel" id="dashboard">
            <div className="hero-decoration hero-decoration-one"></div>
            <div className="hero-decoration hero-decoration-two"></div>

            <p className="hero-eyebrow">UNIVERSITY LOST &amp; FOUND</p>

            <h1>
              Find what you've{" "}
              <span>lost.</span>
            </h1>

            <p className="hero-description">
              A simple way for students to report lost items, report
              found belongings, and reconnect with what matters.
            </p>

            <div className="hero-actions">
              <button
                className="hero-action lost-action"
                onClick={() => openReportForm("LOST")}
              >
                <div className="action-icon purple-icon">⌕</div>

                <div className="action-copy">
                  <strong>Lost something?</strong>
                  <span>Create a report for lost items</span>
                </div>

                <span className="action-arrow">›</span>
              </button>

              <button
                className="hero-action found-action"
                onClick={() => openReportForm("FOUND")}
              >
                <div className="action-icon green-icon">♧</div>

                <div className="action-copy">
                  <strong>Found something?</strong>
                  <span>Help return it to its owner</span>
                </div>

                <span className="action-arrow">›</span>
              </button>
            </div>
          </section>

          {/* STATS */}
          <section className="stats-grid">
            <div className="stat-card lost-stat">
              <div className="stat-icon">⌾</div>

              <div>
                <span>Lost Items</span>
                <strong>{lostItems.length}</strong>
                <small>Your active reports</small>
              </div>
            </div>

            <div className="stat-card found-stat">
              <div className="stat-icon">♧</div>

              <div>
                <span>Found Items</span>
                <strong>{foundItems.length}</strong>
                <small>Items you've reported</small>
              </div>
            </div>

            <div className="stat-card returned-stat">
              <div className="stat-icon">✓</div>

              <div>
                <span>Items Returned</span>
                <strong>{returnedItems.length}</strong>
                <small>Successfully returned</small>
              </div>
            </div>

            <div className="stat-card total-stat">
              <div className="stat-icon">⌁</div>

              <div>
                <span>Total Reports</span>
                <strong>{totalReports}</strong>
                <small>Across campus</small>
              </div>
            </div>
          </section>

          {/* COMMUNITY */}
          <section className="community-section" id="community">
            <div className="section-heading">
              <div>
                <h2>Community</h2>
                <p>Recently reported items in your campus</p>
              </div>

              <button className="refresh-button" onClick={fetchItems}>
                ↻ &nbsp; Refresh
              </button>
            </div>

            {loading && (
              <div className="empty-state">
                <div className="loading-spinner"></div>
                <p>Loading community reports...</p>
              </div>
            )}

            {!loading && recentItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⌕</div>
                <h3>No reports yet</h3>
                <p>Be the first person to report a lost or found item.</p>
              </div>
            )}

            {!loading && recentItems.length > 0 && (
              <div className="items-container">
                {recentItems.map((item) => (
                  <article className="item-card" key={item._id}>
                    <div className="item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <div className="placeholder-item-image">
                          {item.type === "LOST" ? "⌕" : "♧"}
                        </div>
                      )}
                    </div>

                    <div className="item-main">
                      <div className="item-heading">
                        <div>
                          <span
                            className={`type-badge ${
                              item.type === "LOST"
                                ? "lost-badge"
                                : "found-badge"
                            }`}
                          >
                            {item.type}
                          </span>

                          <h3>{item.title}</h3>
                        </div>

                        <span className="active-badge">
                          {item.status}
                        </span>
                      </div>

                      <p className="item-description">
                        {item.description}
                      </p>

                      <div className="item-meta">
                        <span>⌖ {item.location}</span>
                        <span>▣ {formatDate(item.date)}</span>
                        <span>⌑ {item.category}</span>
                      </div>

                      <div className="reported-row">
                        <span>
                          Reported by{" "}
                          <strong>
                            {item.reportedBy?.name || "Student"}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {!loading && items.length > 5 && (
              <button className="view-reports-button">
                View All Reports <span>›</span>
              </button>
            )}
          </section>

          {/* QUICK ACTIONS */}
          <section className="quick-actions">
            <div className="quick-card quick-lost">
              <div className="quick-icon">▣</div>
              <h3>Report Lost Item</h3>
              <p>
                Can't find something? Report it and let the community
                help.
              </p>
              <button onClick={() => openReportForm("LOST")}>
                Report Lost Item
              </button>
            </div>

            <div className="quick-card quick-found">
              <div className="quick-icon">♧</div>
              <h3>Report Found Item</h3>
              <p>
                Found something? Help return it to its owner.
              </p>
              <button onClick={() => openReportForm("FOUND")}>
                Report Found Item
              </button>
            </div>

            <div className="quick-card quick-community">
              <div className="quick-icon">♧</div>
              <h3>Join Community</h3>
              <p>
                Be part of a helpful community and make a difference.
              </p>
              <button>Join Now</button>
            </div>
          </section>

          {/* BOTTOM MESSAGE */}
          <section className="bottom-message">
            <div className="bottom-message-icon">♢</div>

            <div>
              <h3>Together, we can make our campus a better place.</h3>
              <p>Let's help each other find what matters.</p>
            </div>

            <div className="message-pattern">••••••••</div>
          </section>
        </main>
      </div>

      {/* REPORT MODAL */}
      {showForm && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className="modal">
            <button
              className="close-btn"
              onClick={() => setShowForm(false)}
              type="button"
            >
              ×
            </button>

            <div
              className={`modal-icon ${
                reportType === "LOST"
                  ? "modal-lost"
                  : "modal-found"
              }`}
            >
              {reportType === "LOST" ? "⌕" : "♧"}
            </div>

            <p className="modal-eyebrow">
              {reportType === "LOST" ? "LOST ITEM" : "FOUND ITEM"}
            </p>

            <h2>
              {reportType === "LOST"
                ? "Report a Lost Item"
                : "Report a Found Item"}
            </h2>

            <p className="modal-subtitle">
              {reportType === "LOST"
                ? "Tell us what you've lost so your campus community can help."
                : "Tell us what you've found so we can help reconnect it with its owner."}
            </p>

            <form onSubmit={handleSubmit}>
              <label>
                Item Title
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Black Wallet"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  placeholder="Describe the item..."
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <input
                    type="text"
                    name="category"
                    placeholder="Wallet, Phone, ID..."
                    value={form.category}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Date
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label>
                Location
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. University Library"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="photo-upload">
  Item Photo

  <input
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("Please choose an image smaller than 5MB.");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setForm((current) => ({
          ...current,
          image: reader.result,
        }));
      };

      reader.readAsDataURL(file);
    }}
  />

  <span className="upload-box">
    📷
    <strong>Choose a photo</strong>
    <small>PNG, JPG or WEBP · Max 5MB</small>
  </span>
</label>

{form.image && (
  <div className="image-preview">
    <img src={form.image} alt="Preview" />

    <button
      type="button"
      onClick={() =>
        setForm((current) => ({
          ...current,
          image: "",
        }))
      }
    >
      Remove photo
    </button>
  </div>
)}

              <button
                className={`submit-btn ${
                  reportType === "LOST"
                    ? "lost-submit"
                    : "found-submit"
                }`}
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : reportType === "LOST"
                  ? "Report Lost Item"
                  : "Report Found Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;