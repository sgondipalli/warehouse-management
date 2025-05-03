const { CountryMaster, UnitOfMeasureMaster, SerializationTypeMaster, TradeItemCategoryMaster } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

// Get Country List
exports.getCountries = async (req, res) => {
  try {
    const countries = await CountryMaster.findAll({ order: [['CountryName', 'ASC']] });
    logger.info("Fetched country list", { count: countries.length });
    // console.log("Fetched countries:", countries);
    res.json(countries);
  } catch (error) {
    logger.error("Error fetching countries", { error });
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Failed to load countries" });
  }
};

// Get Unit of Measure List
exports.getUnits = async (req, res) => {
  try {
    const units = await UnitOfMeasureMaster.findAll({ order: [['UOMCode', 'ASC']] });
    logger.info("Fetched unit of measure list", { count: units.length });
    // console.log("Fetched units:", units);
    res.json(units);
  } catch (error) {
    logger.error("Error fetching units", { error });
    console.error("Error fetching units:", error);
    res.status(500).json({ message: "Failed to load units" });
  }
};

// Get Serialization Types
exports.getSerializationTypes = async (req, res) => {
  try {
    const types = await SerializationTypeMaster.findAll({ order: [['TypeCode', 'ASC']] });
    logger.info("Fetched serialization types", { count: types.length });
    // console.log("Fetched serialization types:", types);
    res.json(types);
  } catch (error) {
    logger.error("Error fetching serialization types", { error });
    console.error("Error fetching serialization types:", error);
    res.status(500).json({ message: "Failed to load serialization types" });
  }
};

// Get Trade Item Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await TradeItemCategoryMaster.findAll({ order: [['CategoryCode', 'ASC']] });
    logger.info("Fetched trade item categories", { count: categories.length });
    // console.log("Fetched categories:", categories);
    res.json(categories);
  } catch (error) {
    logger.error("Error fetching categories", { error });
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to load trade item categories" });
  }
};
