/**
 * Storage Module
 * Abstracts localStorage operations with error handling
 */

export class Storage {
  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save data to localStorage
   * @param {string} key - Storage key
   * @param {*} data - Data to save
   * @returns {boolean} Success status
   */
  save(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
      }
      return false;
    }
  }

  /**
   * Load data from localStorage
   * @param {string} key - Storage key
   * @returns {*} Parsed data or null
   */
  load(key) {
    try {
      const serialized = localStorage.getItem(key);
      return serialized ? JSON.parse(serialized) : null;
    } catch (e) {
      console.error('Error loading data:', e);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data:', e);
    }
  }

  /**
   * Clear all localStorage data
   */
  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }

  /**
   * Save BMI history
   * @param {Object} bmiData - BMI calculation data
   */
  saveBMIHistory(bmiData) {
    const history = this.load('bmi_history') || [];
    history.push(bmiData);
    this.save('bmi_history', history);
  }

  /**
   * Load BMI history
   * @returns {Array} BMI history array
   */
  loadBMIHistory() {
    return this.load('bmi_history') || [];
  }

  /**
   * Save workout plan
   * @param {Object} planData - Workout plan data
   */
  saveWorkoutPlan(planData) {
    this.save('workout_plan', planData);
  }

  /**
   * Load workout plan
   * @returns {Object} Workout plan data
   */
  loadWorkoutPlan() {
    return this.load('workout_plan') || {
      weeklyPlan: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    };
  }

  /**
   * Save weight history
   * @param {Array} weightData - Weight history data
   */
  saveWeightHistory(weightData) {
    this.save('weight_history', weightData);
  }

  /**
   * Load weight history
   * @returns {Array} Weight history array
   */
  loadWeightHistory() {
    return this.load('weight_history') || [];
  }

  /**
   * Get approximate storage size
   * @returns {number} Size in bytes
   */
  getStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
}
