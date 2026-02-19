/**
 * BMI Calculator Integration Tests
 * Tests the integration of Validator and UnitConverter with BMI Calculator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BMICalculator } from '../js/bmi-calculator.js';
import { Validator } from '../js/validation.js';
import { Storage } from '../js/storage.js';

describe('BMI Calculator Integration', () => {
  let bmiCalculator;
  let validator;
  let storage;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="bmi-calculator">
        <form id="bmi-form">
          <input type="number" id="bmi-weight" />
          <select id="bmi-weight-unit">
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
          <input type="number" id="bmi-height" />
          <select id="bmi-height-unit">
            <option value="cm">cm</option>
            <option value="ft">ft</option>
          </select>
          <button type="submit">Calculate</button>
        </form>
        <div id="bmi-result" class="hidden">
          <p id="bmi-value" data-test-id="bmi-value"></p>
          <div id="bmi-category" data-test-id="bmi-category"></div>
        </div>
        <div id="bmi-error" class="hidden"></div>
      </div>
    `;

    // Initialize modules
    storage = new Storage();
    validator = new Validator();
    bmiCalculator = new BMICalculator('bmi-calculator', storage, validator);
    bmiCalculator.initialize();
  });

  describe('Validation Integration', () => {
    it('should reject empty weight input', () => {
      const weightInput = document.getElementById('bmi-weight');
      const heightInput = document.getElementById('bmi-height');
      
      weightInput.value = '';
      heightInput.value = '170';

      const validation = bmiCalculator._validateInputs('', '170');
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('weight');
    });

    it('should reject empty height input', () => {
      const validation = bmiCalculator._validateInputs('70', '');
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('height');
    });

    it('should reject negative weight', () => {
      const validation = bmiCalculator._validateInputs('-70', '170');
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('positive');
    });

    it('should reject negative height', () => {
      const validation = bmiCalculator._validateInputs('70', '-170');
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('positive');
    });

    it('should reject non-numeric weight', () => {
      const validation = bmiCalculator._validateInputs('abc', '170');
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('number');
    });

    it('should accept valid inputs', () => {
      const validation = bmiCalculator._validateInputs('70', '170');
      
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Unit Conversion Integration', () => {
    it('should convert pounds to kilograms for BMI calculation', () => {
      const result = bmiCalculator.calculateBMI(154.3, 'lbs', 170, 'cm');
      
      // 154.3 lbs = 70 kg, 170 cm = 1.7 m
      // BMI = 70 / (1.7 * 1.7) = 24.2
      expect(result.bmi).toBeCloseTo(24.2, 1);
    });

    it('should convert feet/inches to meters for BMI calculation', () => {
      const result = bmiCalculator.calculateBMI(70, 'kg', 5, 'ft', 7);
      
      // 5 feet 7 inches = 170.18 cm = 1.7018 m
      // BMI = 70 / (1.7018 * 1.7018) = 24.2
      expect(result.bmi).toBeCloseTo(24.2, 1);
    });

    it('should handle metric units correctly', () => {
      const result = bmiCalculator.calculateBMI(70, 'kg', 170, 'cm');
      
      // BMI = 70 / (1.7 * 1.7) = 24.2
      expect(result.bmi).toBeCloseTo(24.2, 1);
      expect(result.category).toBe('Normal');
    });
  });

  describe('Real-time Validation Feedback', () => {
    it('should clear error when user types in weight field', () => {
      const weightInput = document.getElementById('bmi-weight');
      const errorElement = document.getElementById('bmi-error');
      
      // Show error first
      errorElement.classList.remove('hidden');
      errorElement.textContent = 'Test error';
      
      // Simulate input event
      weightInput.dispatchEvent(new Event('input'));
      
      expect(errorElement.classList.contains('hidden')).toBe(true);
    });

    it('should clear error when user types in height field', () => {
      const heightInput = document.getElementById('bmi-height');
      const errorElement = document.getElementById('bmi-error');
      
      // Show error first
      errorElement.classList.remove('hidden');
      errorElement.textContent = 'Test error';
      
      // Simulate input event
      heightInput.dispatchEvent(new Event('input'));
      
      expect(errorElement.classList.contains('hidden')).toBe(true);
    });
  });

  describe('BMI Category Classification', () => {
    it('should classify underweight correctly', () => {
      const result = bmiCalculator.calculateBMI(50, 'kg', 170, 'cm');
      expect(result.category).toBe('Underweight');
    });

    it('should classify normal weight correctly', () => {
      const result = bmiCalculator.calculateBMI(70, 'kg', 170, 'cm');
      expect(result.category).toBe('Normal');
    });

    it('should classify overweight correctly', () => {
      const result = bmiCalculator.calculateBMI(80, 'kg', 170, 'cm');
      expect(result.category).toBe('Overweight');
    });

    it('should classify obese correctly', () => {
      const result = bmiCalculator.calculateBMI(95, 'kg', 170, 'cm');
      expect(result.category).toBe('Obese');
    });
  });
});
