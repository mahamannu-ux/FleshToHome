import React, { useEffect, useState } from "react";

function App() {
  // --- 1. APP STATE ---
  const [view, setView] = useState("home");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [viewedProduct, setViewedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("freshmeat_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  //const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // New States for Search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const API_BASE_URL = "https://flesh-to-home-api-632950254218.asia-south2.run.app";

  const [showAuthModal, setShowAuthModal] = useState(true); // Show on land
  const [authStep, setAuthStep] = useState("phone"); // 'phone' or 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [orders, setOrders] = useState([]); // Missing in your code
  // Profile Form States
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAddress, setProfileAddress] = useState("");

  // PERSISTENCE: Check if user is already logged in on load
  useEffect(() => {
    const savedUser = localStorage.getItem("freshmeat_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setShowAuthModal(false);
    }
  }, []);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("freshmeat_cart", JSON.stringify(cart));
  }, [cart]);

  // --- 2. DATA FETCHING ---

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`${API_BASE_URL}/categories/${selectedCategory.id}/products`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
          setView("catalog");
        });
    }
  }, [selectedCategory]);

  // NEW: Search Logic
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/products/search?q=${searchTerm}`
      );
      const data = await res.json();
      setSearchResults(data);
      setView("search-results");
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  // --- 3. CART ACTIONS (ENHANCED) ---

  const updateCartQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = () => {
    const itemToAdd = { ...viewedProduct, quantity: quantity };
    setCart((prev) => {
      const existing = prev.find((item) => item.id === viewedProduct.id);
      if (existing) {
        return prev.map((i) =>
          i.id === viewedProduct.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, itemToAdd];
    });
    /*  alert(`Added to cart!`); */
    setView("catalog");
    setQuantity(1);
  };
  // Submits a COD order to the backend
  const handlePlaceOrder = () => {
    // 1. Check Login
    if (!user) {
      console.log(" handlePlaceOrder User not logged in");
      setShowAuthModal(true);
      return;
    }

    // 2. Check for Profile Details (Name and Address)
    // Assuming 'user' object from backend/localStorage contains these fields
    if (!user.name || !user.address || user.name === "Guest User") {
      alert("Please provide your delivery details before placing the order.");
      setView("profile");
      return;
    }

    // 3. Place the Order
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        total_price: total,
        items: cart, // Sending the cart items to the backend
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(
          "Your order is received and would be delivered within 15 minutes!"
        );
        setCart([]); // This now clears both State and LocalStorage automatically
        localStorage.removeItem("freshmeat_cart"); // Force clean to be safe
        setView("home");
        // SIMULATION: After 15 minutes (900,000 ms), notify the user
        // Note: For testing, change 900000 to 10000 (10 seconds)

        // data.id is the ID generated by the database (returned by main.py)
        const orderId = data.id;
        setTimeout(() => {
          triggerDeliveryNotification(orderId);
        }, 20000);
      });
  };

  const triggerDeliveryNotification = (orderId) => {
    // 1. Browser Alert
    alert(
      `🔔 Your Order #FTH-${orderId} has been delivered, early! Enjoy your meal.`
    );

    // 2. Update Backend Status to 'Delivered'
    fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Delivered" }),
    });

    if (Notification.permission === "granted") {
      new Notification("FRESHMEAT Delivered!", {
        body: `Your order #${orderId} is at your doorstep.`,
        icon: "/favicon.ico",
      });
    }
  };

  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();

    const updatedUser = {
      name: profileName,
      email: profileEmail,
      address: profileAddress,
    };

    fetch(`${API_BASE_URL}/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser), // Backend expects name, email, address
    })
      .then((res) => res.json())
      .then((data) => {
        // data is the updated user from backend
        const fullUser = { ...user, ...updatedUser };
        setUser(fullUser);
        localStorage.setItem("freshmeat_user", JSON.stringify(fullUser));
        alert("Profile Saved Successfully!");
        if (cart.length > 0) setView("cart");
        else setView("home");
      });
  };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* SHARED HEADER with SEARCH */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 py-4 px-8 flex flex-wrap justify-between items-center gap-4">
        <h1
          className="text-2xl font-black text-green-700 cursor-pointer tracking-tighter"
          onClick={() => {
            setView("home");
            setSelectedCategory(null);
            setSearchTerm("");
          }}
        >
          <img
            //
            src={`${API_BASE_URL}/static/images/fleshtohome3.jpg`}
            alt={""}
            className="w-full h-24 object-cover rounded-md"
            // This is a safety net: if the image path is wrong, it shows a generic one
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x300?text=Fresh+To+Home";
            }}
          />
        </h1>

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            placeholder="Search for meat, fish..."
            className="w-full bg-gray-100 border-none rounded-full py-2 px-6 focus:ring-2 focus:ring-green-600 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-2">
            🔍
          </button>
        </form>

        <div className="flex gap-4">
          <button
            onClick={() => setView("cart")}
            className="relative flex items-center gap-2 p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition"
          >
            <span>🛒</span>
            {cart.length > 0 && (
              <>
                <span className="font-bold text-green-700 border-l pl-2 ml-1">
                  ₹{cart.reduce((s, i) => s + i.price * i.quantity, 0)}
                </span>
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              if (!user) {
                console.log(
                  "onclick of user : User not logged in, showing auth modal"
                );
                setShowAuthModal(true);
              } else {
                // Fetch fresh orders before showing dashboard
                console.log("Fetching orders for user:");
                fetch(`${API_BASE_URL}/orders/user/${user.id}`)
                  .then((res) => res.json())
                  .then((data) => setOrders(data));
                console.log("about to set dashboard");
                setView("dashboard");
              }
            }}
            className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition"
          >
            👤
          </button>
        </div>
      </header>

      {/* VIEW: SEARCH RESULTS */}
      {view === "search-results" && (
        <main className="max-w-6xl mx-auto p-8">
          <h2 className="text-2xl font-bold mb-6">
            Search Results for "{searchTerm}"
          </h2>
          {searchResults.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
              <p className="text-xl text-gray-500">
                Sorry, your search did not match any items.
              </p>
              <button
                onClick={() => setView("home")}
                className="mt-4 text-green-700 font-bold underline"
              >
                Go back home
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {searchResults.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  setViewedProduct={setViewedProduct}
                  setView={setView}
                  API_BASE_URL={API_BASE_URL}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* VIEW: HOME & CATALOG (Keep your existing code for these, but use the ProductCard helper) */}
      {/* ... (Categories code) ... */}

      {/* VIEW: HOME (Category Grid) */}
      {view === "home" && (
        <main className="max-w-6xl mx-auto p-8 animate-in fade-in duration-500">
          <div className="bg-green-700 rounded-3xl p-10 text-white mb-10 shadow-xl shadow-green-100">
            {/*             <h2 className="text-4xl font-bold mb-2">Premium Cuts. Delivered.</h2>
            <p className="text-lg opacity-90">Chemical-free seafood and meat delivered in 15 mins.</p> */}
            <img
              //
              src={`${API_BASE_URL}/static/images/banner1.jpg`}
              alt={""}
              className="w-full h-40 object-cover rounded-md"
              // This is a safety net: if the image path is wrong, it shows a generic one
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/400x300?text=Fresh+To+Home";
              }}
            />
          </div>

          <h3 className="text-2xl font-bold mb-6 text-gray-700">
            Shop by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-600 transition-all cursor-pointer text-center group"
              >
                <img
                  // This combines http://localhost:8000 + static/images/Chicken/filename.jpg
                  src={`${API_BASE_URL}/${cat.image_url}`}
                  alt={cat.name}
                  className="w-full h-48 object-cover rounded-md"
                  // This is a safety net: if the image path is wrong, it shows a generic one
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/400x300?text=Fresh+To+Home";
                  }}
                />
                <p className="font-bold text-gray-800">{cat.name}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* VIEW: CATALOG (Product List) */}
      {view === "catalog" && (
        <main className="max-w-6xl mx-auto p-8 animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setView("home")}
            className="text-green-700 font-bold mb-6 flex items-center gap-2"
          >
            ← All Categories
          </button>
          <h2 className="text-3xl font-bold mb-8">{selectedCategory?.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setViewedProduct(p);
                  setView("product-detail");
                }}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <img
                  // This combines http://localhost:8000 + static/images/Chicken/filename.jpg
                  src={`${API_BASE_URL}/${p.image_url}`}
                  alt={p.name}
                  className="w-full h-48 object-cover rounded-md"
                  // This is a safety net: if the image path is wrong, it shows a generic one
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/400x300?text=Fresh+To+Home";
                  }}
                />

                <div className="p-6 text-center">
                  <h4 className="font-bold text-xl mb-1">{p.name}</h4>
                  <p className="text-green-700 font-black text-2xl">
                    ₹{p.price}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{p.weight_unit}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* VIEW: PRODUCT DETAIL PAGE (PDP) */}
      {view === "product-detail" && viewedProduct && (
        <main className="max-w-4xl mx-auto p-8 animate-in zoom-in-95 duration-300">
          <button
            onClick={() => setView("catalog")}
            className="text-green-700 font-bold mb-6"
          >
            ← Back to List
          </button>
          <div className="bg-white rounded-3xl p-10 shadow-sm flex flex-col md:flex-row gap-12 border border-gray-100">
            {/* Image Section */}

            <img
              // This combines http://localhost:8000 + static/images/Chicken/filename.jpg
              src={`${API_BASE_URL}/${viewedProduct.image_url}`}
              alt={viewedProduct.name}
              className="w-full h-48 object-cover rounded-md"
              // This is a safety net: if the image path is wrong, it shows a generic one
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/400x300?text=Fresh+To+Home";
              }}
            />
            {/* Action Section */}
            <div className="flex-1">
              <h2 className="text-4xl font-black mb-3">{viewedProduct.name}</h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">
                {viewedProduct.description}
              </p>

              <div className="flex items-center gap-6 mb-10">
                {/* Quantity Selector */}
                <div className="flex items-center border-2 border-gray-100 rounded-2xl p-1 bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-2xl font-bold hover:bg-white rounded-xl transition"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xl font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-2xl font-bold hover:bg-white rounded-xl transition"
                  >
                    +
                  </button>
                </div>
                {/* Price Display */}
                <p className="text-4xl font-black text-green-700">
                  ₹{viewedProduct.price * quantity}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </main>
      )}

      {/* VIEW: DASHBOARD (Order History) */}
      {view === "dashboard" && (
        <main className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Order History</h2>
            <button
              onClick={() => {
                localStorage.removeItem("freshmeat_user");
                setUser(null);
                setView("home");
                localStorage.removeItem("freshmeat_cart"); // Force clean to be safe
              }}
              className="text-red-500 font-bold"
            >
              Logout
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-gray-100">
              <p className="text-gray-500 mb-4">
                You haven't placed any orders yet.
              </p>
              <button
                onClick={() => setView("home")}
                className="bg-green-700 text-white px-6 py-2 rounded-full"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 font-bold">Order Number</th>
                    <th className="p-4 font-bold">Date</th>
                    <th className="p-4 font-bold">Total</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-none hover:bg-gray-50"
                    >
                      <td className="p-4 text-sm font-mono text-gray-500">
                        #FTH-{order.id}
                      </td>
                      <td className="p-4">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold text-green-700">
                        ₹{order.total_price}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Pending"
                              ? "bg-orange-100 text-orange-700 animate-pulse"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      )}

      {/* VIEW: PROFILE (User Details & Address) */}
      {view === "profile" && (
        <main className="max-w-2xl mx-auto p-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Your Delivery Details
          </h2>
          <form
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5"
            onSubmit={handleSaveProfile}
          >
            <input
              placeholder="Full Name"
              className="w-full p-4 bg-gray-50 rounded-xl outline-green-600"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
            />
            <input
              placeholder="Email Address"
              type="email"
              className="w-full p-4 bg-gray-50 rounded-xl outline-green-600"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Complete Delivery Address"
              className="w-full p-4 bg-gray-50 rounded-xl outline-green-600 h-32"
              value={profileAddress}
              onChange={(e) => setProfileAddress(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-lg"
            >
              Save Profile
            </button>
          </form>
        </main>
      )}

      {/* VIEW: CART (CLEANED UP & UPDATED) */}
      {view === "cart" && (
        <main className="max-w-2xl mx-auto p-8">
          <h2 className="text-3xl font-bold mb-8">Your Basket</h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <p className="text-gray-400 mb-4">Your cart is empty.</p>
              <button
                onClick={() => setView("home")}
                className="bg-green-700 text-white px-6 py-2 rounded-full font-bold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl flex justify-between items-center border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={`${API_BASE_URL}/${item.image_url}`}
                      className="w-16 h-16 object-cover rounded-lg"
                      alt=""
                    />
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 bg-gray-100 rounded-full font-bold"
                        >
                          -
                        </button>
                        <span className="font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 bg-gray-100 rounded-full font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-bold text-green-700">
                      ₹{item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-8 mt-6 border-t">
                <div className="flex justify-between text-2xl font-black mb-8">
                  <span>Total</span>
                  <span>
                    ₹{cart.reduce((s, i) => s + i.price * i.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={() => handlePlaceOrder()}
                  className="w-full bg-orange-500 text-white py-5 rounded-2xl font-bold text-xl"
                >
                  Pay Cash on Delivery
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* --- ADD THE POPUP CODE RIGHT HERE --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 text-2xl"
            >
              ✕
            </button>

            {/* Content toggles based on authStep */}
            {authStep === "phone" ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">Enter Phone Number</h2>
                <input
                  type="tel"
                  className="w-full p-3 border rounded-xl mb-4"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <button
                  onClick={() => setAuthStep("otp")} // Simplified for testing
                  className="w-full bg-green-700 text-white py-3 rounded-xl"
                >
                  Send OTP
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
                <input
                  type="text"
                  placeholder="1234"
                  className="w-full p-3 border rounded-xl mb-4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `${API_BASE_URL}/auth/verify-otp`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            phone_number: phone,
                            otp: otp,
                          }),
                        }
                      );

                      const data = await res.json();

                      if (data.status === "success") {
                        // data.user now has the REAL id from  backend database
                        setUser(data.user);
                        localStorage.setItem(
                          "freshmeat_user",
                          JSON.stringify(data.user)
                        );
                        setShowAuthModal(false);
                      } else {
                        alert("Invalid OTP! Try 1234");
                      }
                    } catch (err) {
                      alert("Auth failed. Is the backend running?");
                    }
                  }}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl"
                >
                  Verify & Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* --- END OF POPUP CODE --- */}
    </div>
  );
}

// Helper component for Product Cards to avoid repetition
function ProductCard({ p, setViewedProduct, setView, API_BASE_URL }) {
  return (
    <div
      onClick={() => {
        setViewedProduct(p);
        setView("product-detail");
      }}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <img
        src={`${API_BASE_URL}/${p.image_url}`}
        alt={p.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.src = "https://placehold.co/400x300?text=Fresh+Meat";
        }}
      />
      <div className="p-6 text-center">
        <h4 className="font-bold text-xl mb-1">{p.name}</h4>
        <p className="text-green-700 font-black text-2xl">₹{p.price}</p>
      </div>
    </div>
  );
}

export default App;
