/**
 * Main Application Controller
 * Initializes all components and manages global state
 */

import { BMICalculator } from './bmi-calculator.js';
import { CalorieEstimator } from './calorie-estimator.js';
import { WorkoutPlanner } from './workout-planner.js';
import { ProgressTracker } from './progress-tracker.js';
import { Validator } from './validation.js';
import { Storage } from './storage.js';

// Initialize core modules
const storage = new Storage();
const validator = new Validator();

// Initialize components
let bmiCalculator;
let calorieEstimator;
let workoutPlanner;
let progressTracker;

// Global error handler (Requirement 10.7)
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Could display user-friendly error message here
});

// Check storage availability on startup
if (!storage.isAvailable()) {
  console.warn('localStorage is not available. Data will not persist.');
  // Display warning to user
  const warningBanner = document.createElement('div');
  warningBanner.className = 'fixed top-0 left-0 right-0 bg-yellow-900 text-yellow-200 p-3 text-center z-50';
  warningBanner.textContent = '⚠️ Local storage is not available. Your data will not be saved.';
  warningBanner.setAttribute('role', 'alert');
  document.body.prepend(warningBanner);
}

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');

  if (mobileMenuToggle && sidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      const isExpanded = !sidebar.classList.contains('-translate-x-full');
      mobileMenuToggle.setAttribute('aria-expanded', isExpanded.toString());
    });
  }

  // Close sidebar when clicking navigation links on mobile
  const navLinks = sidebar?.querySelectorAll('a');
  navLinks?.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        sidebar.classList.add('-translate-x-full');
        mobileMenuToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Keyboard navigation support (Requirement 10.3)
  // Enable Escape key to close mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && !sidebar.classList.contains('-translate-x-full')) {
      if (window.innerWidth < 1024) {
        sidebar.classList.add('-translate-x-full');
        mobileMenuToggle?.setAttribute('aria-expanded', 'false');
        mobileMenuToggle?.focus();
      }
    }
  });

  // Enable Enter and Space keys for mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        mobileMenuToggle.click();
      }
    });
  }

  // Initialize BMI Calculator
  bmiCalculator = new BMICalculator('bmi-calculator', storage, validator);
  bmiCalculator.initialize();

  // Initialize Calorie Estimator
  calorieEstimator = new CalorieEstimator('calorie-estimator', storage, validator);
  calorieEstimator.initialize();

  // Initialize Workout Planner
  workoutPlanner = new WorkoutPlanner('workout-grid', storage, validator);
  workoutPlanner.initialize();

  // Initialize Progress Tracker
  progressTracker = new ProgressTracker('progress-tracker', storage);
  progressTracker.initialize();

  // Setup workout form submission
  const workoutForm = document.getElementById('workout-form');
  const workoutError = document.getElementById('workout-error');
  const exerciseInput = document.getElementById('workout-exercise');
  const setsInput = document.getElementById('workout-sets');
  const repsInput = document.getElementById('workout-reps');

  // Real-time validation for exercise name (Requirement 6.1)
  if (exerciseInput) {
    exerciseInput.addEventListener('blur', () => {
      if (exerciseInput.value.trim() && !validator.isNotEmpty(exerciseInput.value)) {
        exerciseInput.classList.add('border-red-400');
        exerciseInput.setAttribute('aria-invalid', 'true');
      } else {
        exerciseInput.classList.remove('border-red-400');
        exerciseInput.setAttribute('aria-invalid', 'false');
      }
    });

    exerciseInput.addEventListener('input', () => {
      if (validator.isNotEmpty(exerciseInput.value)) {
        exerciseInput.classList.remove('border-red-400');
        exerciseInput.setAttribute('aria-invalid', 'false');
      }
    });
  }

  // Real-time validation for sets (Requirements 6.2, 6.3)
  if (setsInput) {
    setsInput.addEventListener('blur', () => {
      if (setsInput.value && !validator.isPositiveNumber(setsInput.value)) {
        setsInput.classList.add('border-red-400');
        setsInput.setAttribute('aria-invalid', 'true');
      } else {
        setsInput.classList.remove('border-red-400');
        setsInput.setAttribute('aria-invalid', 'false');
      }
    });

    setsInput.addEventListener('input', () => {
      if (validator.isPositiveNumber(setsInput.value)) {
        setsInput.classList.remove('border-red-400');
        setsInput.setAttribute('aria-invalid', 'false');
      }
    });
  }

  // Real-time validation for reps (Requirements 6.2, 6.3)
  if (repsInput) {
    repsInput.addEventListener('blur', () => {
      if (repsInput.value && !validator.isPositiveNumber(repsInput.value)) {
        repsInput.classList.add('border-red-400');
        repsInput.setAttribute('aria-invalid', 'true');
      } else {
        repsInput.classList.remove('border-red-400');
        repsInput.setAttribute('aria-invalid', 'false');
      }
    });

    repsInput.addEventListener('input', () => {
      if (validator.isPositiveNumber(repsInput.value)) {
        repsInput.classList.remove('border-red-400');
        repsInput.setAttribute('aria-invalid', 'false');
      }
    });
  }

  if (workoutForm) {
    workoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const exerciseName = exerciseInput.value;
      const sets = setsInput.value;
      const reps = repsInput.value;
      const day = document.getElementById('workout-day').value;

      const result = workoutPlanner.addExercise(day, exerciseName, sets, reps);

      if (result.success) {
        // Clear form
        workoutForm.reset();
        // Hide error and clear validation states
        workoutError.classList.add('hidden');
        exerciseInput.classList.remove('border-red-400');
        setsInput.classList.remove('border-red-400');
        repsInput.classList.remove('border-red-400');
        exerciseInput.setAttribute('aria-invalid', 'false');
        setsInput.setAttribute('aria-invalid', 'false');
        repsInput.setAttribute('aria-invalid', 'false');
      } else {
        // Show error
        workoutError.textContent = result.error;
        workoutError.classList.remove('hidden');
      }
    });
  }
});
