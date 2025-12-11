const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./src/config/db");
const authRoutes = require("./src/routes/authRoute");
const IsDistributorRoute = require("./src/routes/IsDistributorRoute")
const loginRoute = require("./src/routes/loginRoute")
const categoryRoute = require("./src/routes/categoryRoute")
const path = require("path");
const productRoute = require("./src/routes/productRoute");
const bannerRoute = require("./src/routes/bannerRoute");
const productVarientRoute = require("./src/routes/productVarientRoute");
const productDetailsRoute = require("./src/routes/productDetailsRoute");
const cartRoute = require("./src/routes/cartRoute");
const contactRoute = require("./src/routes/contactRoute");
const deliveryAddressRoute = require("./src/routes/AddressRoute");
const ordersRoute = require("./src/routes/orderRoute");
const adminOrderRoute = require("./src/routes/adminOrderRoute");
const pincodeRoute = require("./src/routes/pincodeRoute")


dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Routes
app.use( authRoutes);
app.use( IsDistributorRoute);
app.use( loginRoute);
app.use('/category', categoryRoute);
app.use("/product", productRoute);
app.use("/banner", bannerRoute);
app.use("/product", productVarientRoute);
app.use("/product",productDetailsRoute);
app.use("/cart", cartRoute);
// console.log(contactRoute, "contactRoute");
app.use("/api", contactRoute);
app.use("/api", deliveryAddressRoute);
app.use("/api", ordersRoute);
app.use( adminOrderRoute);
app.use( pincodeRoute);
//  Test DB connection once
(async () => {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log(" Database connected successfully");
  } catch (err) {
    console.error(" Database connection failed:", err.message);
  }
})();

//  Default route
app.get("/", (req, res) => {
  res.send("CropX backend is running ");
});

//  Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT,"0.0.0.0", () => console.log(` Server running on port ${PORT}`));
