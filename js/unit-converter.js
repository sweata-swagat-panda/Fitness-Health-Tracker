/**
 * UnitConverter Module
 * Provides utility functions for converting between imperial and metric units
 * Used by BMI Calculator and Calorie Estimator components
 */

/**
 * Conversion Constants
 * These constants are based on internationally accepted conversion factors
 */

// Weight conversion: 1 pound = 0.453592 kilograms
const LBS_TO_KG = 0.453592;

// Height conversion: 1 inch = 2.54 centimeters
const INCHES_TO_CM = 2.54;

// Height conversion: 1 centimeter = 0.393701 inches
const CM_TO_INCHES = 0.393701;

// Height conversion: 1 meter = 100 centimeters
const CM_TO_METERS = 100;

/**
 * Weight Conversions
 */

/**
 * Convert pounds to kilograms
 * Formula: kg = lbs × 0.453592
 * @param {number} pounds - Weight in pounds
 * @returns {number} Weight in kilograms
 */
export function poundsToKilograms(pounds) {
  return pounds * LBS_TO_KG;
}

/**
 * Convert kilograms to pounds
 * Formula: lbs = kg ÷ 0.453592
 * @param {number} kilograms - Weight in kilograms
 * @returns {number} Weight in pounds
 */
export function kilogramsToPounds(kilograms) {
  return kilograms / LBS_TO_KG;
}

/**
 * Height Conversions
 */

/**
 * Convert feet and inches to centimeters
 * Formula: cm = (feet × 12 + inches) × 2.54
 * @param {number} feet - Height in feet
 * @param {number} inches - Additional inches
 * @returns {number} Height in centimeters
 */
export function feetInchesToCentimeters(feet, inches) {
  const totalInches = feet * 12 + inches;
  return totalInches * INCHES_TO_CM;
}

/**
 * Convert centimeters to feet and inches
 * Formula: 
 *   total_inches = cm × 0.393701
 *   feet = floor(total_inches ÷ 12)
 *   inches = total_inches % 12
 * @param {number} centimeters - Height in centimeters
 * @returns {object} Object with feet and inches properties
 */
export function centimetersToFeetInches(centimeters) {
  const totalInches = centimeters * CM_TO_INCHES;
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  
  return {
    feet,
    inches
  };
}

/**
 * Convert centimeters to meters
 * Formula: m = cm ÷ 100
 * @param {number} centimeters - Height in centimeters
 * @returns {number} Height in meters
 */
export function centimetersToMeters(centimeters) {
  return centimeters / CM_TO_METERS;
}

/**
 * Export conversion constants for use in other modules
 */
export const CONVERSION_CONSTANTS = {
  LBS_TO_KG,
  INCHES_TO_CM,
  CM_TO_INCHES,
  CM_TO_METERS
};
