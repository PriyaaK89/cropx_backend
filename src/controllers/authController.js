const { createUser, findUserByEmail } = require("../models/registerUserModel");

const signup = async (req, res) => {
  try {
    const { name, email, password, isDistributor } = req.body;

    if (!name || !email || !password) {
      return res.status(500).json({ message: "Please fill the required fields" });
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const distributor_status = isDistributor ? "pending" : null;

    const userId = await createUser(name, email, password, distributor_status);

    res.status(201).json({
      message: isDistributor
        ? "You have to follow some steps for being a distributor."
        : "You have registered successfully!",
      user: {
        id: userId,
        name,
        email,
        password,
        distributor_status,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signup };
