// server.js
const express = require("express");
const cors = require("cors");
const db = require("./src/config/db");
require("dotenv").config();
// Routes
const authRoutes = require("./src/routes/authRoute");
const IsDistributorRoute = require("./src/routes/IsDistributorRoute");
const loginRoute = require("./src/routes/loginRoute");
const categoryRoute = require("./src/routes/categoryRoute");
const productRoute = require("./src/routes/productRoute");
const bannerRoute = require("./src/routes/bannerRoute");
const productVarientRoute = require("./src/routes/productVarientRoute");
const productDetailsRoute = require("./src/routes/productDetailsRoute");
const cartRoute = require("./src/routes/cartRoute");
const contactRoute = require("./src/routes/contactRoute");
const deliveryAddressRoute = require("./src/routes/AddressRoute");
const ordersRoute = require("./src/routes/orderRoute");
const adminOrderRoute = require("./src/routes/adminOrderRoute");
const pincodeRoute = require("./src/routes/pincodeRoute");
const searchRoute = require("./src/routes/searchRoute");
const menuRoute = require("./src/routes/menuRoute");
const rateRoute = require("./src/routes/ratingRoute");
const subCategoryRoute = require("./src/routes/subCategoryRoute");
const collectionRoute = require("./src/routes/collectionRoute");
const homeRoute = require("./src/routes/homeRoute");
const productSlugRoute = require("./src/routes/productSlugRoute");
const productsByType = require("./src/routes/productsByType");



const app = express();

// Middleware
app.use(cors({ origin: "*" }));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use(authRoutes);
app.use(IsDistributorRoute);
app.use(loginRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/banner", bannerRoute);
app.use("/product", productVarientRoute);
app.use("/product", productDetailsRoute);
app.use("/cart", cartRoute);
app.use("/api", contactRoute);
app.use("/api", deliveryAddressRoute);
app.use("/api", ordersRoute);
app.use(adminOrderRoute);
app.use(pincodeRoute);
app.use("/api", searchRoute);
app.use(menuRoute);
app.use(rateRoute);
app.use(subCategoryRoute);
app.use(collectionRoute);
app.use(homeRoute);
app.use(productSlugRoute);
app.use(productsByType);

// Test DB connection once
(async () => {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log(" Database connected successfully");
  } catch (err) {
    console.error(" Database connection failed:", err.message);
  }
})();

// Default route
app.get("/", (req, res) => {
  res.send("CropX backend is running");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
