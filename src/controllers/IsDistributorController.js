const { createDistributorRequest } = require("../models/IsDistributorModel");

const submitDistributorDetails = async (req, res) => {
  try {
    const { userId, gst_number, seed_license, fertilizer_license, pesticide_license } = req.body;

    if (!gst_number) {
      return res.status(400).json({ message: "GST number is required." });
    }

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gst_number)) {
      return res.status(400).json({ message: "Invalid GST number format." });
    }

    if (!seed_license && !fertilizer_license && !pesticide_license) {
      return res.status(400).json({
        message: "At least one license (seed, fertilizer, or pesticide) is required.",
      });
    }

    const requestId = await createDistributorRequest(
      userId,
      gst_number,
      seed_license,
      fertilizer_license,
      pesticide_license
    );

    res.status(201).json({
      message: "Distributor request has been sent successfully!",
      distributor_request: {
        requestId,
        userId,
        gst_number,
        seed_license,
        fertilizer_license,
        pesticide_license,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Distributor Request Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { submitDistributorDetails };
