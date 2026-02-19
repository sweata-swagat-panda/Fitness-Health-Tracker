/**
 * BMI Calculator Module
 * Calculates Body Mass Index and determines health category
 * 
 * BMI Formula: BMI = weight(kg) / height(m)²
 * 
 * BMI Categories:
 * - Underweight: BMI < 18.5
 * - Normal: 18.5 ≤ BMI < 25.0
 * - Overweight: 25.0 ≤ BMI < 30.0
 * - Obese: BMI ≥ 30.0
 */

import { poundsToKilograms, feetInchesToCentimeters, centimetersToMeters } from './unit-converter.js';

export class BMICalculator {
  /**
   * Initialize BMI Calculator
   * @param {string} containerId - DOM container ID for the calculator
   * @param {Storage} storage - Storage module instance
   * @param {Validator} validator - Validator module instance
   */
  constructor(containerId, storage, validator) {
    this.containerId = containerId;
    this.storage = storage;
    this.validator = validator;
    this.container = null;
  }

  /**
   * Initialize the BMI calculator component
   * Sets up DOM references and event listeners
   */
  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }

    // Set up form submission handler
    const form = this.container.querySelector('#bmi-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleCalculate();
      });
    }

    // Set up real-time validation on input fields
    const weightInput = this.container.querySelector('#bmi-weight');
    const heightInput = this.container.querySelector('#bmi-height');
    
    if (weightInput) {
      weightInput.addEventListener('input', () => {
        this._clearError();
        this._validateFieldRealtime(weightInput, 'weight');
      });
      weightInput.addEventListener('blur', () => {
        this._validateFieldRealtime(weightInput, 'weight');
      });
    }
    
    if (heightInput) {
      heightInput.addEventListener('input', () => {
        this._clearError();
        this._validateFieldRealtime(heightInput, 'height');
      });
      heightInput.addEventListener('blur', () => {
        this._validateFieldRealtime(heightInput, 'height');
      });
    }

    // Handle height unit change to show/hide inches input
    const heightUnitSelect = this.container.querySelector('#bmi-height-unit');
    if (heightUnitSelect) {
      heightUnitSelect.addEventListener('change', (e) => {
        this._handleHeightUnitChange(e.target.value);
      });
    }
  }

  /**
   * Calculate BMI from weight and height
   * 
   * The BMI formula is: BMI = weight(kg) / height(m)²
   * 
   * This method:
   * 1. Converts weight to kilograms if needed
   * 2. Converts height to meters if needed
   * 3. Applies the BMI formula
   * 4. Returns the calculated BMI value
   * 
   * @param {number} weight - Weight value
   * @param {string} weightUnit - Unit for weight ('kg' or 'lbs')
   * @param {number} height - Height value (or feet if using imperial)
   * @param {string} heightUnit - Unit for height ('cm', 'ft', or 'm')
   * @param {number} heightInches - Additional inches (only for imperial)
   * @returns {Object} Object containing BMI value and category
   */
  calculateBMI(weight, weightUnit, height, heightUnit, heightInches = 0) {
    // Convert weight to kilograms
    // Formula: If weight is in pounds, multiply by 0.453592 to get kilograms
    let weightKg = weight;
    if (weightUnit === 'lbs') {
      weightKg = poundsToKilograms(weight);
    }

    // Convert height to meters
    // Formula: If height is in feet/inches, convert to cm first, then to meters
    // If height is in cm, divide by 100 to get meters
    let heightM = height;
    if (heightUnit === 'ft') {
      const heightCm = feetInchesToCentimeters(height, heightInches);
      heightM = centimetersToMeters(heightCm);
    } else if (heightUnit === 'cm') {
      heightM = centimetersToMeters(height);
    }

    // Calculate BMI using the standard formula
    // BMI = weight(kg) / height(m)²
    // Example: 70kg / (1.75m)² = 70 / 3.0625 = 22.86
    const bmi = weightKg / (heightM * heightM);

    // Determine the BMI category based on calculated value
    const category = this._determineBMICategory(bmi);

    return {
      bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
      category,
      weightKg,
      heightM
    };
  }

  /**
   * Determine BMI category based on BMI value
   * 
   * Categories follow WHO standards:
   * - Underweight: BMI < 18.5
   * - Normal weight: 18.5 ≤ BMI < 25.0
   * - Overweight: 25.0 ≤ BMI < 30.0
   * - Obese: BMI ≥ 30.0
   * 
   * @param {number} bmi - Calculated BMI value
   * @returns {string} BMI category
   * @private
   */
  _determineBMICategory(bmi) {
    if (bmi < 18.5) {
      return 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25.0) {
      return 'Normal';
    } else if (bmi >= 25.0 && bmi < 30.0) {
      return 'Overweight';
    } else {
      return 'Obese';
    }
  }

  /**
   * Get color coding for BMI category
   * 
   * Color mappings for visual feedback:
   * - Underweight: Yellow (#FCD34D) - Warning
   * - Normal: Green (#10B981) - Healthy
   * - Overweight: Orange (#F59E0B) - Caution
   * - Obese: Red (#EF4444) - Alert
   * 
   * @param {string} category - BMI category
   * @returns {string} Hex color code
   * @private
   */
  _getCategoryColor(category) {
    const colors = {
      'Underweight': '#FCD34D',
      'Normal': '#10B981',
      'Overweight': '#F59E0B',
      'Obese': '#EF4444'
    };
    return colors[category] || '#6B7280'; // Default gray if category not found
  }

  /**
   * Display BMI calculation result in the UI
   * Updates the DOM with BMI value, category, and color-coded alert
   * 
   * @param {number} bmi - Calculated BMI value
   * @param {string} category - BMI category
   */
  displayResult(bmi, category) {
    if (!this.container) {
      console.error('Container not initialized');
      return;
    }

    // Find result display elements
    const bmiValueElement = this.container.querySelector('[data-test-id="bmi-value"]');
    const bmiCategoryElement = this.container.querySelector('[data-test-id="bmi-category"]');
    const resultContainer = this.container.querySelector('[data-test-id="bmi-result"]');

    if (bmiValueElement) {
      bmiValueElement.textContent = bmi.toFixed(1);
    }

    if (bmiCategoryElement) {
      bmiCategoryElement.textContent = category;
      
      // Remove all category classes first
      bmiCategoryElement.className = 'inline-block px-6 py-3 rounded-lg font-semibold text-sm';
      
      // Apply color-coded styling based on category
      // Underweight: Yellow background with dark text
      // Normal: Green background with dark text
      // Overweight: Orange background with dark text
      // Obese: Red background with white text
      switch (category) {
        case 'Underweight':
          bmiCategoryElement.classList.add('bg-yellow-400', 'text-gray-900');
          break;
        case 'Normal':
          bmiCategoryElement.classList.add('bg-green-500', 'text-white');
          break;
        case 'Overweight':
          bmiCategoryElement.classList.add('bg-orange-500', 'text-white');
          break;
        case 'Obese':
          bmiCategoryElement.classList.add('bg-red-500', 'text-white');
          break;
        default:
          bmiCategoryElement.classList.add('bg-gray-500', 'text-white');
      }
    }

    if (resultContainer) {
      resultContainer.classList.remove('hidden');
    }
  }

  /**
   * Save BMI calculation to history
   * Stores the calculation with timestamp for progress tracking
   * 
   * @param {number} bmi - Calculated BMI value
   * @param {string} category - BMI category
   * @param {Object} inputs - Original input values
   * @private
   */
  _saveToHistory(bmi, category, inputs) {
    const historyEntry = {
      bmi,
      category,
      weight: inputs.weight,
      height: inputs.height,
      timestamp: new Date().toISOString()
    };

    this.storage.saveBMIHistory(historyEntry);
  }

  /**
   * Handle BMI calculation from form inputs
   * Validates inputs, performs calculation, and displays results
   * @private
   */
  _handleCalculate() {
    // Get input values
    const weightInput = this.container.querySelector('#bmi-weight');
    const weightUnitSelect = this.container.querySelector('#bmi-weight-unit');
    const heightInput = this.container.querySelector('#bmi-height');
    const heightUnitSelect = this.container.querySelector('#bmi-height-unit');
    const heightInchesInput = this.container.querySelector('#bmi-height-inches');

    const weight = weightInput?.value;
    const weightUnit = weightUnitSelect?.value || 'kg';
    const height = heightInput?.value;
    const heightUnit = heightUnitSelect?.value || 'cm';
    const heightInches = heightInchesInput?.value || 0;

    // Validate main inputs (weight and height)
    const validation = this._validateInputs(weight, height);
    if (!validation.isValid) {
      this._showError(validation.error);
      return;
    }

    // Additional validation for inches when using imperial units
    if (heightUnit === 'ft' && heightInches) {
      const inchesNum = parseFloat(heightInches);
      if (!isNaN(inchesNum) && inchesNum >= 12) {
        this._showError('Inches must be less than 12 (use feet for values 12 and above)');
        return;
      }
      if (!isNaN(inchesNum) && inchesNum < 0) {
        this._showError('Inches must be a positive number');
        return;
      }
    }

    // Calculate BMI
    const result = this.calculateBMI(
      parseFloat(weight),
      weightUnit,
      parseFloat(height),
      heightUnit,
      parseFloat(heightInches)
    );

    // Display result
    this.displayResult(result.bmi, result.category);

    // Save to history
    this._saveToHistory(result.bmi, result.category, {
      weight: { value: parseFloat(weight), unit: weightUnit },
      height: { value: parseFloat(height), unit: heightUnit, inches: parseFloat(heightInches) }
    });
  }

  /**
   * Validate a single field in real-time
   * Provides immediate feedback as user types
   * @param {HTMLElement} input - Input element to validate
   * @param {string} fieldName - Name of the field (weight or height)
   * @private
   */
  _validateFieldRealtime(input, fieldName) {
    const value = input?.value;
    
    // Don't show errors for empty fields during typing (only on blur)
    if (!value || value.trim() === '') {
      return;
    }

    // Check for non-numeric input
    if (isNaN(parseFloat(value))) {
      this._showError(this.validator.getErrorMessage('nonNumeric', fieldName));
      return;
    }

    // Check for negative values
    if (!this.validator.isPositiveNumber(value)) {
      this._showError(this.validator.getErrorMessage('negative', fieldName.charAt(0).toUpperCase() + fieldName.slice(1)));
      return;
    }

    // Check for valid ranges
    const numValue = parseFloat(value);
    if (fieldName === 'weight' && !this.validator.isValidWeight(numValue)) {
      this._showError(this.validator.getErrorMessage('outOfRange', 'Weight'));
      return;
    }

    if (fieldName === 'height' && !this.validator.isValidHeight(numValue)) {
      this._showError(this.validator.getErrorMessage('outOfRange', 'Height'));
      return;
    }
  }

  /**
   * Validate BMI calculator inputs
   * Checks for empty values, negative numbers, and non-numeric input
   * 
   * @param {string} weight - Weight input value
   * @param {string} height - Height input value
   * @returns {Object} Validation result with isValid flag and error message
   * @private
   */
  _validateInputs(weight, height) {
    // Check for empty inputs - handle edge cases
    // Empty string, null, undefined, or whitespace-only strings are invalid
    if (!weight || weight.trim() === '') {
      return {
        isValid: false,
        error: 'Please enter both weight and height values'
      };
    }

    if (!height || height.trim() === '') {
      return {
        isValid: false,
        error: 'Please enter both weight and height values'
      };
    }

    // Check for non-numeric input
    // parseFloat will return NaN for invalid numeric strings
    if (isNaN(parseFloat(weight))) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('nonNumeric', 'weight')
      };
    }

    if (isNaN(parseFloat(height))) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('nonNumeric', 'height')
      };
    }

    // Check for negative values
    // Use validator module for consistent validation logic
    if (!this.validator.isPositiveNumber(weight)) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('negative', 'Weight')
      };
    }

    if (!this.validator.isPositiveNumber(height)) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('negative', 'Height')
      };
    }

    // Check for valid ranges
    // Ensure values are within reasonable bounds for weight and height
    if (!this.validator.isValidWeight(parseFloat(weight))) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('outOfRange', 'Weight')
      };
    }

    if (!this.validator.isValidHeight(parseFloat(height))) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('outOfRange', 'Height')
      };
    }

    return { isValid: true };
  }

  /**
   * Display error message in the UI
   * @param {string} message - Error message to display
   * @private
   */
  _showError(message) {
    const errorElement = this.container.querySelector('#bmi-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
    }

    // Hide result if showing
    const resultContainer = this.container.querySelector('#bmi-result');
    if (resultContainer) {
      resultContainer.classList.add('hidden');
    }
  }

  /**
   * Clear error message
   * @private
   */
  _clearError() {
    const errorElement = this.container.querySelector('#bmi-error');
    if (errorElement) {
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
    }
  }

  /**
   * Handle height unit change to show/hide inches input
   * @param {string} unit - Selected height unit
   * @private
   */
  _handleHeightUnitChange(unit) {
    let inchesInput = this.container.querySelector('#bmi-height-inches');
    
    if (unit === 'ft') {
      // Create inches input if it doesn't exist
      if (!inchesInput) {
        const heightDiv = this.container.querySelector('#bmi-height').parentElement;
        const inchesContainer = document.createElement('div');
        inchesContainer.className = 'mt-2';
        inchesContainer.id = 'bmi-height-inches-container';
        inchesContainer.innerHTML = `
          <label for="bmi-height-inches" class="block text-sm font-medium mb-2">Inches</label>
          <input 
            type="number" 
            id="bmi-height-inches" 
            data-test-id="bmi-height-inches-input"
            class="w-full" 
            placeholder="Additional inches"
            aria-label="Additional inches"
            step="0.1"
            min="0"
            max="11.9"
            value="0"
          >
        `;
        heightDiv.parentElement.appendChild(inchesContainer);
        inchesInput = this.container.querySelector('#bmi-height-inches');
        
        // Add input listeners for real-time validation
        if (inchesInput) {
          inchesInput.addEventListener('input', () => {
            this._clearError();
            this._validateInchesRealtime(inchesInput);
          });
          inchesInput.addEventListener('blur', () => {
            this._validateInchesRealtime(inchesInput);
          });
        }
      } else {
        const inchesContainer = this.container.querySelector('#bmi-height-inches-container');
        if (inchesContainer) {
          inchesContainer.classList.remove('hidden');
        }
      }
    } else {
      // Hide inches input for metric units
      const inchesContainer = this.container.querySelector('#bmi-height-inches-container');
      if (inchesContainer) {
        inchesContainer.classList.add('hidden');
      }
    }
  }

  /**
   * Validate inches input in real-time
   * @param {HTMLElement} input - Inches input element
   * @private
   */
  _validateInchesRealtime(input) {
    const value = input?.value;
    
    // Empty is okay (defaults to 0)
    if (!value || value.trim() === '') {
      return;
    }

    // Check for non-numeric input
    if (isNaN(parseFloat(value))) {
      this._showError('Please enter a valid number for inches');
      return;
    }

    const numValue = parseFloat(value);

    // Check for negative values
    if (numValue < 0) {
      this._showError('Inches must be a positive number');
      return;
    }

    // Check for valid range (0-11.9 inches)
    if (numValue >= 12) {
      this._showError('Inches must be less than 12 (use feet for values 12 and above)');
      return;
    }
  }

  /**
   * Clear all input fields
   */
  clearInputs() {
    const weightInput = this.container.querySelector('#bmi-weight');
    const heightInput = this.container.querySelector('#bmi-height');
    const heightInchesInput = this.container.querySelector('#bmi-height-inches');
    
    if (weightInput) weightInput.value = '';
    if (heightInput) heightInput.value = '';
    if (heightInchesInput) heightInchesInput.value = '0';
    
    this._clearError();
    
    const resultContainer = this.container.querySelector('#bmi-result');
    if (resultContainer) {
      resultContainer.classList.add('hidden');
    }
  }
}
