/**
 * Workout Planner Module
 * Manages weekly workout schedules with exercise tracking
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6
 */

export class WorkoutPlanner {
  /**
   * Initialize Workout Planner
   * @param {string} containerId - ID of the container element
   * @param {Storage} storage - Storage module instance
   * @param {Validator} validator - Validator module instance
   */
  constructor(containerId, storage, validator) {
    this.containerId = containerId;
    this.storage = storage;
    this.validator = validator;
    this.weeklyPlan = null;
    this.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  }

  /**
   * Initialize the workout planner
   * Loads saved data and renders the weekly grid
   */
  initialize() {
    this._loadFromStorage();
    this._renderWeeklyGrid();
  }

  /**
   * Add an exercise to a specific day
   * @param {string} day - Day of the week
   * @param {string} exerciseName - Name of the exercise
   * @param {number} sets - Number of sets
   * @param {number} reps - Number of reps
   * @returns {Object} Result object with success status and message
   */
  addExercise(day, exerciseName, sets, reps) {
    // Validate inputs
    const validation = this._validateExerciseInput(exerciseName, sets, reps);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Validate day
    if (!this.days.includes(day.toLowerCase())) {
      return { success: false, error: 'Please select a valid day of the week' };
    }

    // Create exercise object
    const exercise = {
      id: this._generateExerciseId(),
      name: exerciseName.trim(),
      sets: parseInt(sets),
      reps: parseInt(reps),
      completed: false,
      addedAt: new Date().toISOString()
    };

    // Add to weekly plan
    this.weeklyPlan.weeklyPlan[day.toLowerCase()].push(exercise);
    this.weeklyPlan.lastModified = new Date().toISOString();

    // Save and render
    this._saveToStorage();
    this._renderDay(day.toLowerCase());

    return { success: true, exercise };
  }

  /**
   * Remove an exercise from a specific day
   * @param {string} day - Day of the week
   * @param {string} exerciseId - Unique exercise ID
   * @returns {boolean} Success status
   */
  removeExercise(day, exerciseId) {
    const dayLower = day.toLowerCase();
    if (!this.days.includes(dayLower)) {
      return false;
    }

    const exercises = this.weeklyPlan.weeklyPlan[dayLower];
    const index = exercises.findIndex(ex => ex.id === exerciseId);

    if (index === -1) {
      return false;
    }

    // Remove exercise
    exercises.splice(index, 1);
    this.weeklyPlan.lastModified = new Date().toISOString();

    // Save and render
    this._saveToStorage();
    this._renderDay(dayLower);

    return true;
  }

  /**
   * Toggle exercise completion status
   * @param {string} day - Day of the week
   * @param {string} exerciseId - Unique exercise ID
   * @returns {boolean} Success status
   */
  toggleExerciseCompletion(day, exerciseId) {
    const dayLower = day.toLowerCase();
    if (!this.days.includes(dayLower)) {
      return false;
    }

    const exercises = this.weeklyPlan.weeklyPlan[dayLower];
    const exercise = exercises.find(ex => ex.id === exerciseId);

    if (!exercise) {
      return false;
    }

    // Toggle completion
    exercise.completed = !exercise.completed;
    this.weeklyPlan.lastModified = new Date().toISOString();

    // Save and render
    this._saveToStorage();
    this._renderDay(dayLower);

    return true;
  }

  /**
   * Get the complete weekly plan
   * @returns {Object} Weekly plan data
   */
  getWeeklyPlan() {
    return this.weeklyPlan;
  }

  /**
   * Clear all exercises for a specific day
   * @param {string} day - Day of the week
   * @returns {boolean} Success status
   */
  clearDay(day) {
    const dayLower = day.toLowerCase();
    if (!this.days.includes(dayLower)) {
      return false;
    }

    this.weeklyPlan.weeklyPlan[dayLower] = [];
    this.weeklyPlan.lastModified = new Date().toISOString();

    this._saveToStorage();
    this._renderDay(dayLower);

    return true;
  }

  /**
   * Validate exercise input
   * Requirements: 6.1, 6.2, 6.3
   * @private
   * @param {string} exerciseName - Exercise name
   * @param {*} sets - Number of sets
   * @param {*} reps - Number of reps
   * @returns {Object} Validation result
   */
  _validateExerciseInput(exerciseName, sets, reps) {
    // Requirement 6.1: Validate exercise name is not empty
    if (!this.validator.isNotEmpty(exerciseName)) {
      return {
        isValid: false,
        error: 'Please enter an exercise name'
      };
    }

    // Requirement 6.2: Validate sets is positive (rejects negative values)
    // Requirement 6.3: Validate sets is numeric (rejects non-numeric characters)
    if (!this.validator.isPositiveNumber(sets)) {
      return {
        isValid: false,
        error: 'Sets must be a positive number'
      };
    }

    // Requirement 6.2: Validate reps is positive (rejects negative values)
    // Requirement 6.3: Validate reps is numeric (rejects non-numeric characters)
    if (!this.validator.isPositiveNumber(reps)) {
      return {
        isValid: false,
        error: 'Reps must be a positive number'
      };
    }

    return { isValid: true };
  }

  /**
   * Render the weekly grid structure
   * @private
   */
  _renderWeeklyGrid() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = '';

    this.days.forEach(day => {
      const dayColumn = document.createElement('div');
      dayColumn.className = 'bg-darker-bg rounded-md p-4';
      dayColumn.id = `workout-day-${day}`;
      dayColumn.setAttribute('data-test-id', `workout-day-${day}`);

      const dayTitle = document.createElement('h4');
      dayTitle.className = 'text-sm font-semibold text-neon-green mb-3 capitalize';
      dayTitle.textContent = day;

      const exerciseList = document.createElement('div');
      exerciseList.className = 'space-y-2';
      exerciseList.id = `workout-list-${day}`;
      exerciseList.setAttribute('role', 'list');
      exerciseList.setAttribute('aria-label', `${day} exercises`);

      dayColumn.appendChild(dayTitle);
      dayColumn.appendChild(exerciseList);
      container.appendChild(dayColumn);
    });

    // Render exercises for each day
    this.days.forEach(day => this._renderDay(day));
  }

  /**
   * Render exercises for a specific day
   * @private
   * @param {string} day - Day of the week
   */
  _renderDay(day) {
    const listContainer = document.getElementById(`workout-list-${day}`);
    if (!listContainer) return;

    const exercises = this.weeklyPlan.weeklyPlan[day] || [];
    listContainer.innerHTML = '';

    if (exercises.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'text-gray-500 text-xs italic';
      emptyMessage.textContent = 'No exercises';
      listContainer.appendChild(emptyMessage);
      return;
    }

    exercises.forEach(exercise => {
      const exerciseItem = document.createElement('div');
      exerciseItem.className = `flex items-start gap-2 p-2 rounded-md bg-dark-bg ${exercise.completed ? 'opacity-60' : ''}`;
      exerciseItem.setAttribute('role', 'listitem');
      exerciseItem.setAttribute('data-test-id', `exercise-${exercise.id}`);

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = exercise.completed;
      checkbox.className = 'mt-1 cursor-pointer focus-visible-ring';
      checkbox.id = `checkbox-${exercise.id}`;
      checkbox.setAttribute('data-test-id', `checkbox-${exercise.id}`);
      checkbox.setAttribute('aria-label', `Mark ${exercise.name} as ${exercise.completed ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => {
        this.toggleExerciseCompletion(day, exercise.id);
      });
      // Keyboard support for Space key (Requirement 10.3)
      checkbox.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          this.toggleExerciseCompletion(day, exercise.id);
        }
      });

      // Exercise details
      const detailsContainer = document.createElement('div');
      detailsContainer.className = 'flex-1 min-w-0';

      const exerciseName = document.createElement('p');
      exerciseName.className = `text-sm font-medium ${exercise.completed ? 'line-through text-gray-500' : 'text-white'}`;
      exerciseName.textContent = exercise.name;

      const exerciseInfo = document.createElement('p');
      exerciseInfo.className = 'text-xs text-gray-400';
      exerciseInfo.textContent = `${exercise.sets} sets × ${exercise.reps} reps`;

      detailsContainer.appendChild(exerciseName);
      detailsContainer.appendChild(exerciseInfo);

      // Remove button
      const removeBtn = document.createElement('button');
      removeBtn.className = 'text-red-400 hover:text-red-300 text-xs p-1 focus-visible-ring';
      removeBtn.textContent = '×';
      removeBtn.setAttribute('data-test-id', `remove-${exercise.id}`);
      removeBtn.setAttribute('aria-label', `Remove ${exercise.name}`);
      removeBtn.addEventListener('click', () => {
        this.removeExercise(day, exercise.id);
      });
      // Keyboard support for Enter key (Requirement 10.3)
      removeBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.removeExercise(day, exercise.id);
        }
      });

      exerciseItem.appendChild(checkbox);
      exerciseItem.appendChild(detailsContainer);
      exerciseItem.appendChild(removeBtn);

      listContainer.appendChild(exerciseItem);
    });
  }

  /**
   * Generate unique exercise ID
   * @private
   * @returns {string} Unique ID
   */
  _generateExerciseId() {
    return `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save workout plan to storage
   * @private
   */
  _saveToStorage() {
    this.storage.saveWorkoutPlan(this.weeklyPlan);
  }

  /**
   * Load workout plan from storage
   * @private
   */
  _loadFromStorage() {
    this.weeklyPlan = this.storage.loadWorkoutPlan();
  }
}
