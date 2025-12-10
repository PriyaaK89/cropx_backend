const Address = require("../models/addressModel");

exports.saveAddress = async (req, res) => {
  try {
    const data = req.body;

    if (!/^\+[0-9]{1,3}$/.test(data.country_code)) {
      return res.status(400).json({
        message: "Invalid country code. Example: +91",
      });
    }

    if (!/^[0-9]{10}$/.test(data.phone_number)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    const result = await Address.userAddress(data);

    res.status(200).json({
      message: "Your Address saved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving Address",
      error,
    });
  }
};

exports.getAddressByuser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await Address.getAddressByUser(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in fetching Address", error });
  }
};

exports.UpdateUserAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!/^\+[0-9]{1,3}$/.test(data.country_code)) {
      return res.status(400).json({
        message: "Invalid country code. Example: +91",
      });
    }

    if (!/^[0-9]{10}$/.test(data.phone_number)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    const result = await Address.updateAddress(id, data);

    res.status(200).json({
      message: "Delivery Address Updated Successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in updating user address!",
      error,
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const result = Address.deleteAddress(id);

    res.status(200).json({
      message: "Delivery address deleted successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in deleteing Address",
      error,
    });
  }
};
