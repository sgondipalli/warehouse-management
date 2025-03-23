const { isValidGTIN, calculateCheckDigit } = require("gtin-validator");

// Generate GTIN-14 with proper check digit calculation
function generateGTIN14(indicator, companyPrefix, productCode) {
    // Ensure inputs are correctly formatted
    indicator = indicator.toString().padStart(1, '0'); // Ensure 1-digit indicator
    companyPrefix = companyPrefix.toString().padStart(7, '0'); // Ensure 7-digit prefix
    productCode = productCode.toString().padStart(5, '0'); // Ensure 5-digit product code

    // Generate base GTIN-13 (without check digit)
    const baseGTIN = `${indicator}${companyPrefix}${productCode}`;

    // Calculate check digit
    try {
        const checkDigit = calculateCheckDigit(baseGTIN);
        return `${baseGTIN}${checkDigit}`;
    } catch (error) {
        console.error("GTIN-14 Check Digit Calculation Error:", error);
        throw new Error("Failed to generate a valid GTIN-14.");
    }
}

// Validate GTIN-14 using `gtin-validator`
function isValidGTIN14(gtinNumber) {
    if (!gtinNumber || gtinNumber.length !== 14) {
        return false; // GTIN-14 must be exactly 14 digits
    }
    return isValidGTIN(gtinNumber);
}

module.exports = { generateGTIN14, isValidGTIN14 };
