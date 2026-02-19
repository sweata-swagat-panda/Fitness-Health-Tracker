/**
 * Calorie Estimator Module
 * Calculates daily caloric needs using the Mifflin-St Jeor Equation
 * 
 * Mifflin-St Jeor Equation:
 * For Men:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 * For Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 * 
 * Maintenance Calories = BMR × Activity Multiplier
 * 
 * Activity Multipliers:
 * - Sedentary (little/no exercise): 1.2
 * - Lightly Active (1-3 days/week): 1.375
 * - Moderately Active (3-5 days/week): 1.55
 * - Very Active (6-7 days/week): 1.725
 * - Extra Active (physical job + exercise): 1.9
 * 
 * Weight Loss Target = Maintenance - 500 calories
 * Weight Gain Target = Maintenance + 500 calories
 */

import { poundsToKilograms, feetInchesToCentimeters } from './unit-converter.js';

export class CalorieEstimator {
  /**
   * Initialize Calorie Estimator
   * @param {string} containerId - DOM container ID for the estimator
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
   * Initialize the calorie estimator component
   * Sets up DOM references and event listeners
   */
  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }

    // Set up form submission handler
    const form = this.container.querySelector('#calorie-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleCalculate();
      });
    }

    // Set up real-time validation on input fields
    const ageInput = this.container.querySelector('#calorie-age');
    const weightInput = this.container.querySelector('#calorie-weight');
    const heightInput = this.container.querySelector('#calorie-height');
    
    if (ageInput) {
      ageInput.addEventListener('input', () => {
        this._clearError();
      });
    }
    
    if (weightInput) {
      weightInput.addEventListener('input', () => {
        this._clearError();
      });
    }
    
    if (heightInput) {
      heightInput.addEventListener('input', () => {
        this._clearError();
      });
    }

    // Handle height unit change to show/hide inches input
    const heightUnitSelect = this.container.querySelector('#calorie-height-unit');
    if (heightUnitSelect) {
      heightUnitSelect.addEventListener('change', (e) => {
        this._handleHeightUnitChange(e.target.value);
      });
    }
  }

  /**
   * Calculate daily caloric needs
   * 
   * This method:
   * 1. Converts weight to kilograms if needed
   * 2. Converts height to centimeters if needed
   * 3. Calculates BMR using Mifflin-St Jeor Equation
   * 4. Calculates maintenance calories using activity multiplier
   * 5. Calculates weight loss and weight gain targets
   * 
   * @param {number} age - Age in years
   * @param {string} gender - Gender ('male' or 'female')
   * @param {number} weight - Weight value
   * @param {string} weightUnit - Unit for weight ('kg' or 'lbs')
   * @param {number} height - Height value (or feet if using imperial)
   * @param {string} heightUnit - Unit for height ('cm' or 'ft')
   * @param {string} activityLevel - Activity level identifier
   * @param {number} heightInches - Additional inches (only for imperial)
   * @returns {Object} Object containing BMR and calorie targets
   */
  calculateCalories(age, gender, weight, weightUnit, height, heightUnit, activityLevel, heightInches = 0) {
    // Convert weight to kilograms
    // Formula: If weight is in pounds, multiply by 0.453592 to get kilograms
    let weightKg = weight;
    if (weightUnit === 'lbs') {
      weightKg = poundsToKilograms(weight);
    }

    // Convert height to centimeters
    // Formula: If height is in feet/inches, convert to cm
    let heightCm = height;
    if (heightUnit === 'ft') {
      heightCm = feetInchesToCentimeters(height, heightInches);
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = this._calculateBMR(age, gender, weightKg, heightCm);

    // Get activity multiplier based on activity level
    const activityMultiplier = this._getActivityMultiplier(activityLevel);

    // Calculate calorie targets
    const targets = this._calculateTargets(bmr, activityMultiplier);

    return {
      bmr: Math.round(bmr),
      maintenance: Math.round(targets.maintenance),
      weightLoss: Math.round(targets.weightLoss),
      weightGain: Math.round(targets.weightGain)
    };
  }

  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
   * 
   * The Mifflin-St Jeor Equation is one of the most accurate formulas for calculating BMR.
   * It was developed in 1990 and is widely used by nutritionists and fitness professionals.
   * 
   * For Men:
   * BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
   * 
   * For Women:
   * BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
   * 
   * The formula accounts for:
   * - Weight: More body mass requires more energy to maintain
   * - Height: Taller individuals have more body surface area
   * - Age: Metabolism slows with age
   * - Gender: Men typically have higher muscle mass and lower body fat percentage
   * 
   * Example for a 30-year-old male, 70kg, 170cm:
   * BMR = (10 × 70) + (6.25 × 170) - (5 × 30) + 5
   * BMR = 700 + 1062.5 - 150 + 5 = 1617.5 calories/day
   * 
   * @param {number} age - Age in years
   * @param {string} gender - Gender ('male' or 'female')
   * @param {number} weightKg - Weight in kilograms
   * @param {number} heightCm - Height in centimeters
   * @returns {number} Basal Metabolic Rate in calories per day
   * @private
   */
  _calculateBMR(age, gender, weightKg, heightCm) {
    // Base calculation: (10 × weight) + (6.25 × height) - (5 × age)
    const baseCalc = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    
    // Add gender-specific adjustment
    // Men: +5 calories (higher muscle mass)
    // Women: -161 calories (lower muscle mass, higher body fat percentage)
    if (gender === 'male') {
      return baseCalc + 5;
    } else {
      return baseCalc - 161;
    }
  }

  /**
   * Get activity multiplier based on activity level
   * 
   * Activity multipliers are used to estimate Total Daily Energy Expenditure (TDEE)
   * by multiplying BMR by a factor that accounts for physical activity.
   * 
   * Activity Levels:
   * - Sedentary: Little or no exercise, desk job (1.2)
   * - Lightly Active: Light exercise 1-3 days/week (1.375)
   * - Moderately Active: Moderate exercise 3-5 days/week (1.55)
   * - Very Active: Hard exercise 6-7 days/week (1.725)
   * - Extra Active: Very hard exercise, physical job, or training twice per day (1.9)
   * 
   * @param {string} activityLevel - Activity level identifier
   * @returns {number} Activity multiplier
   * @private
   */
  _getActivityMultiplier(activityLevel) {
    const multipliers = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725,
      'extra_active': 1.9
    };
    
    return multipliers[activityLevel] || 1.2; // Default to sedentary if not found
  }

  /**
   * Calculate calorie targets for different goals
   * 
   * Maintenance Calories: The number of calories needed to maintain current weight
   * Formula: BMR × Activity Multiplier
   * 
   * Weight Loss Target: A 500-calorie deficit per day results in approximately 1 lb (0.45 kg) weight loss per week
   * Formula: Maintenance - 500 calories
   * 
   * Weight Gain Target: A 500-calorie surplus per day results in approximately 1 lb (0.45 kg) weight gain per week
   * Formula: Maintenance + 500 calories
   * 
   * @param {number} bmr - Basal Metabolic Rate
   * @param {number} activityMultiplier - Activity level multiplier
   * @returns {Object} Object containing maintenance, weight loss, and weight gain targets
   * @private
   */
  _calculateTargets(bmr, activityMultiplier) {
    // Calculate maintenance calories (TDEE)
    const maintenance = bmr * activityMultiplier;
    
    // Calculate weight loss target (500 calorie deficit)
    const weightLoss = maintenance - 500;
    
    // Calculate weight gain target (500 calorie surplus)
    const weightGain = maintenance + 500;
    
    return {
      maintenance,
      weightLoss,
      weightGain
    };
  }

  /**
   * Display calorie calculation results in the UI
   * Updates the DOM with maintenance, weight loss, and weight gain targets
   * 
   * @param {number} maintenance - Maintenance calories
   * @param {number} weightLoss - Weight loss target calories
   * @param {number} weightGain - Weight gain target calories
   */
  displayResults(maintenance, weightLoss, weightGain) {
    if (!this.container) {
      console.error('Container not initialized');
      return;
    }

    // Find result display elements
    const maintenanceElement = this.container.querySelector('[data-test-id="calorie-maintenance"]');
    const weightLossElement = this.container.querySelector('[data-test-id="calorie-weight-loss"]');
    const weightGainElement = this.container.querySelector('[data-test-id="calorie-weight-gain"]');
    const resultContainer = this.container.querySelector('[data-test-id="calorie-result"]');

    if (maintenanceElement) {
      maintenanceElement.textContent = maintenance;
    }

    if (weightLossElement) {
      weightLossElement.textContent = weightLoss;
    }

    if (weightGainElement) {
      weightGainElement.textContent = weightGain;
    }

    if (resultContainer) {
      resultContainer.classList.remove('hidden');
    }
  }

  /**
   * Handle calorie calculation from form inputs
   * Validates inputs, performs calculation, and displays results
   * @private
   */
  _handleCalculate() {
    // Get input values
    const ageInput = this.container.querySelector('#calorie-age');
    const genderSelect = this.container.querySelector('#calorie-gender');
    const weightInput = this.container.querySelector('#calorie-weight');
    const weightUnitSelect = this.container.querySelector('#calorie-weight-unit');
    const heightInput = this.container.querySelector('#calorie-height');
    const heightUnitSelect = this.container.querySelector('#calorie-height-unit');
    const heightInchesInput = this.container.querySelector('#calorie-height-inches');
    const activityLevelSelect = this.container.querySelector('#calorie-activity-level');

    const age = ageInput?.value;
    const gender = genderSelect?.value;
    const weight = weightInput?.value;
    const weightUnit = weightUnitSelect?.value || 'kg';
    const height = heightInput?.value;
    const heightUnit = heightUnitSelect?.value || 'cm';
    const heightInches = heightInchesInput?.value || 0;
    const activityLevel = activityLevelSelect?.value;

    // Validate inputs
    const validation = this._validateInputs(age, gender, weight, height, activityLevel);
    if (!validation.isValid) {
      this._showError(validation.error);
      return;
    }

    // Check for age boundary warning
    const ageNum = parseFloat(age);
    if (ageNum < 15 || ageNum > 120) {
      this._showWarning('⚠️ Results may be less accurate for ages outside 15-120 range');
    }

    // Calculate calories
    const result = this.calculateCalories(
      ageNum,
      gender,
      parseFloat(weight),
      weightUnit,
      parseFloat(height),
      heightUnit,
      activityLevel,
      parseFloat(heightInches)
    );

    // Display results
    this.displayResults(result.maintenance, result.weightLoss, result.weightGain);

    // Save to history
    this._saveToHistory(result, {
      age: ageNum,
      gender,
      weight: { value: parseFloat(weight), unit: weightUnit },
      height: { value: parseFloat(height), unit: heightUnit, inches: parseFloat(heightInches) },
      activityLevel
    });
  }

  /**
   * Validate calorie estimator inputs
   * Checks for empty values, negative numbers, and missing required fields
   * 
   * @param {string} age - Age input value
   * @param {string} gender - Gender selection
   * @param {string} weight - Weight input value
   * @param {string} height - Height input value
   * @param {string} activityLevel - Activity level selection
   * @returns {Object} Validation result with isValid flag and error message
   * @private
   */
  _validateInputs(age, gender, weight, height, activityLevel) {
    // Check for missing required fields
    if (!age || age.trim() === '' || !gender || !weight || weight.trim() === '' || 
        !height || height.trim() === '' || !activityLevel) {
      return {
        isValid: false,
        error: 'Please fill in all required fields: age, gender, weight, height, and activity level'
      };
    }

    // Check for non-numeric input using validator
    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(ageNum)) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('nonNumeric', 'age')
      };
    }

    if (isNaN(weightNum)) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('nonNumeric', 'weight')
      };
    }

    if (isNaN(heightNum)) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('nonNumeric', 'height')
      };
    }

    // Check for negative values using validator
    if (!this.validator.isPositiveNumber(ageNum)) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('negative', 'Age')
      };
    }

    if (!this.validator.isPositiveNumber(weightNum)) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('negative', 'Weight')
      };
    }

    if (!this.validator.isPositiveNumber(heightNum)) {
      return {
        isValid: false,
        error: this.validator.getErrorMessage('negative', 'Height')
      };
    }

    return { isValid: true };
  }

  /**
   * Save calorie calculation to history
   * @param {Object} result - Calculation results
   * @param {Object} inputs - Original input values
   * @private
   */
  _saveToHistory(result, inputs) {
    const historyEntry = {
      bmr: result.bmr,
      maintenance: result.maintenance,
      weightLoss: result.weightLoss,
      weightGain: result.weightGain,
      inputs,
      timestamp: new Date().toISOString()
    };

    // Save to storage
    const history = this.storage.load('calorie_history') || [];
    history.push(historyEntry);
    this.storage.save('calorie_history', history);
  }

  /**
   * Display error message in the UI
   * @param {string} message - Error message to display
   * @private
   */
  _showError(message) {
    const errorElement = this.container.querySelector('#calorie-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
      errorElement.classList.remove('bg-yellow-900', 'text-yellow-200');
      errorElement.classList.add('bg-red-900', 'text-red-200');
    }

    // Hide result if showing
    const resultContainer = this.container.querySelector('#calorie-result');
    if (resultContainer) {
      resultContainer.classList.add('hidden');
    }
  }

  /**
   * Display warning message in the UI
   * @param {string} message - Warning message to display
   * @private
   */
  _showWarning(message) {
    const errorElement = this.container.querySelector('#calorie-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
      errorElement.classList.remove('bg-red-900', 'text-red-200');
      errorElement.classList.add('bg-yellow-900', 'text-yellow-200');
    }
  }

  /**
   * Clear error/warning message
   * @private
   */
  _clearError() {
    const errorElement = this.container.querySelector('#calorie-error');
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
    let inchesInput = this.container.querySelector('#calorie-height-inches');
    
    if (unit === 'ft') {
      // Create inches input if it doesn't exist
      if (!inchesInput) {
        const heightDiv = this.container.querySelector('#calorie-height').parentElement;
        const inchesContainer = document.createElement('div');
        inchesContainer.className = 'mt-2';
        inchesContainer.id = 'calorie-height-inches-container';
        inchesContainer.innerHTML = `
          <label for="calorie-height-inches" class="block text-sm font-medium mb-2">Inches</label>
          <input 
            type="number" 
            id="calorie-height-inches" 
            data-test-id="calorie-height-inches-input"
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
      } else {
        const inchesContainer = this.container.querySelector('#calorie-height-inches-container');
        if (inchesContainer) {
          inchesContainer.classList.remove('hidden');
        }
      }
    } else {
      // Hide inches input for metric units
      const inchesContainer = this.container.querySelector('#calorie-height-inches-container');
      if (inchesContainer) {
        inchesContainer.classList.add('hidden');
      }
    }
  }

  /**
   * Clear all input fields
   */
  clearInputs() {
    const ageInput = this.container.querySelector('#calorie-age');
    const genderSelect = this.container.querySelector('#calorie-gender');
    const weightInput = this.container.querySelector('#calorie-weight');
    const heightInput = this.container.querySelector('#calorie-height');
    const heightInchesInput = this.container.querySelector('#calorie-height-inches');
    const activityLevelSelect = this.container.querySelector('#calorie-activity-level');
    
    if (ageInput) ageInput.value = '';
    if (genderSelect) genderSelect.value = '';
    if (weightInput) weightInput.value = '';
    if (heightInput) heightInput.value = '';
    if (heightInchesInput) heightInchesInput.value = '0';
    if (activityLevelSelect) activityLevelSelect.value = '';
    
    this._clearError();
    
    const resultContainer = this.container.querySelector('#calorie-result');
    if (resultContainer) {
      resultContainer.classList.add('hidden');
    }
  }
}
