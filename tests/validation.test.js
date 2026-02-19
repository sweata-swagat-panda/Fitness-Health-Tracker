import { describe, it, expect } from 'vitest';
import { Validator } from '../js/validation.js';

describe('Validator Module', () => {
  const validator = new Validator();

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(validator.isPositiveNumber(5)).toBe(true);
      expect(validator.isPositiveNumber(0.1)).toBe(true);
      expect(validator.isPositiveNumber('10')).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(validator.isPositiveNumber(-5)).toBe(false);
      expect(validator.isPositiveNumber(-0.1)).toBe(false);
    });

    it('should return false for zero', () => {
      expect(validator.isPositiveNumber(0)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(validator.isPositiveNumber('abc')).toBe(false);
      expect(validator.isPositiveNumber(null)).toBe(false);
      expect(validator.isPositiveNumber(undefined)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should return true for values within range', () => {
      expect(validator.isInRange(5, 1, 10)).toBe(true);
      expect(validator.isInRange(1, 1, 10)).toBe(true);
      expect(validator.isInRange(10, 1, 10)).toBe(true);
    });

    it('should return false for values outside range', () => {
      expect(validator.isInRange(0, 1, 10)).toBe(false);
      expect(validator.isInRange(11, 1, 10)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(validator.isInRange('abc', 1, 10)).toBe(false);
    });
  });

  describe('isInteger', () => {
    it('should return true for integer values', () => {
      expect(validator.isInteger(5)).toBe(true);
      expect(validator.isInteger('10')).toBe(true);
      expect(validator.isInteger(0)).toBe(true);
    });

    it('should return false for decimal values', () => {
      expect(validator.isInteger(5.5)).toBe(false);
      expect(validator.isInteger('10.1')).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(validator.isInteger('abc')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('should return true for non-empty strings', () => {
      expect(validator.isNotEmpty('hello')).toBe(true);
      expect(validator.isNotEmpty('  test  ')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(validator.isNotEmpty('')).toBe(false);
      expect(validator.isNotEmpty('   ')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(validator.isNotEmpty(null)).toBe(false);
      expect(validator.isNotEmpty(undefined)).toBe(false);
      expect(validator.isNotEmpty(123)).toBe(false);
    });
  });

  describe('hasValidLength', () => {
    it('should return true for strings within length range', () => {
      expect(validator.hasValidLength('hello', 1, 10)).toBe(true);
      expect(validator.hasValidLength('a', 1, 10)).toBe(true);
      expect(validator.hasValidLength('1234567890', 1, 10)).toBe(true);
    });

    it('should return false for strings outside length range', () => {
      expect(validator.hasValidLength('', 1, 10)).toBe(false);
      expect(validator.hasValidLength('12345678901', 1, 10)).toBe(false);
    });

    it('should trim whitespace before checking length', () => {
      expect(validator.hasValidLength('  hello  ', 1, 10)).toBe(true);
    });

    it('should return false for non-string values', () => {
      expect(validator.hasValidLength(123, 1, 10)).toBe(false);
    });
  });

  describe('isValidAge', () => {
    it('should return true for valid ages', () => {
      expect(validator.isValidAge(25)).toBe(true);
      expect(validator.isValidAge(1)).toBe(true);
      expect(validator.isValidAge(150)).toBe(true);
    });

    it('should return false for invalid ages', () => {
      expect(validator.isValidAge(0)).toBe(false);
      expect(validator.isValidAge(-5)).toBe(false);
      expect(validator.isValidAge(151)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(validator.isValidAge('abc')).toBe(false);
    });
  });

  describe('isValidWeight', () => {
    it('should return true for valid weights', () => {
      expect(validator.isValidWeight(70)).toBe(true);
      expect(validator.isValidWeight(1)).toBe(true);
      expect(validator.isValidWeight(500)).toBe(true);
    });

    it('should return false for invalid weights', () => {
      expect(validator.isValidWeight(0)).toBe(false);
      expect(validator.isValidWeight(-10)).toBe(false);
      expect(validator.isValidWeight(501)).toBe(false);
    });
  });

  describe('isValidHeight', () => {
    it('should return true for valid heights', () => {
      expect(validator.isValidHeight(170)).toBe(true);
      expect(validator.isValidHeight(1)).toBe(true);
      expect(validator.isValidHeight(300)).toBe(true);
    });

    it('should return false for invalid heights', () => {
      expect(validator.isValidHeight(0)).toBe(false);
      expect(validator.isValidHeight(-10)).toBe(false);
      expect(validator.isValidHeight(301)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error messages for validation types', () => {
      expect(validator.getErrorMessage('empty', 'weight')).toBe('Please enter weight');
      expect(validator.getErrorMessage('negative', 'height')).toBe('height must be a positive number');
      expect(validator.getErrorMessage('nonNumeric', 'age')).toBe('Please enter a valid number for age');
      expect(validator.getErrorMessage('outOfRange', 'value')).toBe('value is out of valid range');
    });

    it('should return default message for unknown validation type', () => {
      expect(validator.getErrorMessage('unknown', 'field')).toBe('Invalid input');
    });
  });
});
