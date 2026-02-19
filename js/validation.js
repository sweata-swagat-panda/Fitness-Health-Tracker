/**
 * Validation Module
 * Provides reusable validation functions for form inputs
 */

export class Validator {
  /**
   * Check if value is a positive number
   * @param {*} value - Value to validate
   * @returns {boolean}
   */
  isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }

  /**
   * Check if value is within a range
   * @param {number} value - Value to check
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {boolean}
   */
  isInRange(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Check if value is an integer
   * @param {*} value - Value to validate
   * @returns {boolean}
   */
  isInteger(value) {
    const num = parseFloat(value);
    return !isNaN(num) && Number.isInteger(num);
  }

  /**
   * Check if string is not empty
   * @param {string} value - String to validate
   * @returns {boolean}
   */
  isNotEmpty(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Check if string has valid length
   * @param {string} value - String to validate
   * @param {number} minLength - Minimum length
   * @param {number} maxLength - Maximum length
   * @returns {boolean}
   */
  hasValidLength(value, minLength, maxLength) {
    if (typeof value !== 'string') return false;
    const length = value.trim().length;
    return length >= minLength && length <= maxLength;
  }

  /**
   * Validate age value
   * @param {*} age - Age to validate
   * @returns {boolean}
   */
  isValidAge(age) {
    return this.isPositiveNumber(age) && this.isInRange(age, 1, 150);
  }

  /**
   * Validate weight value
   * @param {*} weight - Weight to validate
   * @returns {boolean}
   */
  isValidWeight(weight) {
    return this.isPositiveNumber(weight) && this.isInRange(weight, 1, 500);
  }

  /**
   * Validate height value
   * @param {*} height - Height to validate
   * @returns {boolean}
   */
  isValidHeight(height) {
    return this.isPositiveNumber(height) && this.isInRange(height, 1, 300);
  }

  /**
   * Get error message for validation type
   * @param {string} validationType - Type of validation
   * @param {string} fieldName - Name of the field
   * @returns {string}
   */
  getErrorMessage(validationType, fieldName) {
    const messages = {
      empty: `Please enter ${fieldName}`,
      negative: `${fieldName} must be a positive number`,
      nonNumeric: `Please enter a valid number for ${fieldName}`,
      outOfRange: `${fieldName} is out of valid range`
    };
    return messages[validationType] || 'Invalid input';
  }
}
