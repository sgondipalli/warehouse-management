const { CountryMaster, UnitOfMeasureMaster, SerializationTypeMaster, TradeItemCategoryMaster } = require("../../../common/db/models");

// Get Country List
exports.getCountries = async (req, res) => {
  try {
    const countries = await CountryMaster.findAll({ order: [['CountryName', 'ASC']] });
    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Failed to load countries" });
  }
};

// Get Unit of Measure List
exports.getUnits = async (req, res) => {
  try {
    const units = await UnitOfMeasureMaster.findAll({ order: [['UOMCode', 'ASC']] });
    res.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    res.status(500).json({ message: "Failed to load units" });
  }
};

// Get Serialization Types
exports.getSerializationTypes = async (req, res) => {
  try {
    const types = await SerializationTypeMaster.findAll({ order: [['TypeCode', 'ASC']] });
    res.json(types);
  } catch (error) {
    console.error("Error fetching serialization types:", error);
    res.status(500).json({ message: "Failed to load serialization types" });
  }
};

// Get Trade Item Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await TradeItemCategoryMaster.findAll({ order: [['CategoryCode', 'ASC']] });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to load trade item categories" });
  }
};
