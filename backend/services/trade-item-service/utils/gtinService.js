const { isValidGTIN, calculateCheckDigitForGTIN } = require("gtin-validator");

// ✅ Generate GTIN-14
function generateGTIN14(indicator, companyPrefix, productCode) {
    indicator = indicator.toString().padStart(1, '0');  // Ensure 1-digit indicator
    companyPrefix = companyPrefix.toString().padStart(7, '0');  // Ensure 7-digit prefix
    productCode = productCode.toString().padStart(5, '0');  // Ensure 5-digit product code

    // ✅ Generate base GTIN-13 (without check digit)
    const baseGTIN = `${indicator}${companyPrefix}${productCode}`;

    // ✅ Use `gtin-validator` to calculate check digit
    const checkDigit = calculateCheckDigitForGTIN(baseGTIN);

    return `${baseGTIN}${checkDigit}`;
}

// ✅ Validate GTIN-14 using `gtin-validator`
function isValidGTIN14(gtinNumber) {
    return isValidGTIN(gtinNumber);
}

module.exports = { generateGTIN14, isValidGTIN14 };
