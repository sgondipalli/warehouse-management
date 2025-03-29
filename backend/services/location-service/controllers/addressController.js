const { AddressTable } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

exports.createAddress = async (req, res) => {
  try {
    const { Street, City, State, Region, Country, PostalCode } = req.body;

    const existing = await AddressTable.findOne({
      where: { Street, City, State, Region, Country, PostalCode },
    });

    if (existing) {
      return res.status(400).json({ message: "Address already exists", data: existing });
    }

    const newAddress = await AddressTable.create({
      Street,
      City,
      State,
      Region,
      Country,
      PostalCode,
    });

    logger.info("Address created:", newAddress.toJSON());
    res.status(201).json({ message: "Address created", data: newAddress });
  } catch (error) {
    logger.error("Create Address Error", error);
    res.status(500).json({ message: "Failed to create address", error: error.message });
  }
};
