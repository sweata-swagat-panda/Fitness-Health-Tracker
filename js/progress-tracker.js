/**
 * Progress Tracker Module
 * Displays fitness progress visualizations over time
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

export class ProgressTracker {
  /**
   * Initialize Progress Tracker
   * @param {string} containerId - DOM container ID
   * @param {Storage} storage - Storage module instance
   */
  constructor(containerId, storage) {
    this.containerId = containerId;
    this.storage = storage;
    this.container = null;
  }

  /**
   * Initialize the progress tracker component
   */
  initialize() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`Container with id "${this.containerId}" not found`);
      return;
    }

    // Load and display initial data
    this.updateWeightChart();
    this.updateWorkoutStats();
  }

  /**
   * Update weight chart visualization
   * @param {Array} weightData - Optional weight data array
   */
  updateWeightChart(weightData = null) {
    const data = weightData || this._getWeightHistory();
    const chartContainer = document.getElementById('weight-chart-container');
    
    if (!chartContainer) {
      console.error('Weight chart container not found');
      return;
    }

    // Check if Chart.js is available
    if (typeof Chart !== 'undefined') {
      this._renderChartJsWeightChart(data);
    } else {
      // Fallback to CSS-based visualization
      this._renderWeightChart(data);
    }
  }

  /**
   * Update workout statistics display
   * @param {Object} workoutData - Optional workout data object
   */
  updateWorkoutStats(workoutData = null) {
    const data = workoutData || this._getWorkoutHistory();
    const statsContainer = document.getElementById('workout-stats-container');
    
    if (!statsContainer) {
      console.error('Workout stats container not found');
      return;
    }

    // Calculate statistics
    const totalWorkouts = data.totalWorkouts || 0;
    const currentWeekWorkouts = data.currentWeekWorkouts || 0;
    const completionRate = data.completionRate || 0;
    const lastWorkoutDate = data.lastWorkoutDate || 'N/A';

    // Update DOM
    statsContainer.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Total Workouts:</span>
          <span class="text-2xl font-bold text-emerald-400">${totalWorkouts}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">This Week:</span>
          <span class="text-2xl font-bold text-blue-400">${currentWeekWorkouts}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Completion Rate:</span>
          <span class="text-2xl font-bold text-purple-400">${(completionRate * 100).toFixed(0)}%</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Last Workout:</span>
          <span class="text-sm font-medium text-gray-300">${lastWorkoutDate}</span>
        </div>
      </div>
    `;
  }

  /**
   * Render weight chart using CSS-based visualization (fallback)
   * @private
   * @param {Array} data - Weight history data
   */
  _renderWeightChart(data) {
    const chartContainer = document.getElementById('weight-chart-container');
    
    if (data.length === 0) {
      chartContainer.innerHTML = `
        <div class="flex items-center justify-center h-64 text-gray-500">
          <p>No weight data available. Start tracking your weight to see progress!</p>
        </div>
      `;
      return;
    }

    // Find min and max for scaling
    const weights = data.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight || 1; // Avoid division by zero

    // Create CSS-based bar chart
    const bars = data.map((entry, index) => {
      const height = ((entry.weight - minWeight) / range) * 100;
      const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return `
        <div class="flex flex-col items-center flex-1 min-w-0">
          <div class="w-full flex items-end justify-center h-48 mb-2">
            <div class="w-8 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all hover:opacity-80" 
                 style="height: ${height}%"
                 title="${entry.weight} ${entry.unit}">
            </div>
          </div>
          <span class="text-xs text-gray-400">${date}</span>
          <span class="text-xs font-medium text-emerald-400">${entry.weight}</span>
        </div>
      `;
    }).join('');

    chartContainer.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-200">Weight Over Time</h3>
          <span class="text-sm text-gray-400">${data[0]?.unit || 'kg'}</span>
        </div>
        <div class="flex gap-2 items-end justify-around overflow-x-auto pb-2">
          ${bars}
        </div>
      </div>
    `;
  }

  /**
   * Render weight chart using Chart.js
   * @private
   * @param {Array} data - Weight history data
   */
  _renderChartJsWeightChart(data) {
    const canvas = document.getElementById('weight-chart-canvas');
    
    if (!canvas) {
      // Fallback to CSS if canvas not found
      this._renderWeightChart(data);
      return;
    }

    if (data.length === 0) {
      const chartContainer = document.getElementById('weight-chart-container');
      chartContainer.innerHTML = `
        <div class="flex items-center justify-center h-64 text-gray-500">
          <p>No weight data available. Start tracking your weight to see progress!</p>
        </div>
      `;
      return;
    }

    // Prepare data for Chart.js
    const labels = data.map(entry => {
      const date = new Date(entry.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const weights = data.map(entry => entry.weight);
    const unit = data[0]?.unit || 'kg';

    // Destroy existing chart if it exists
    if (this.weightChart) {
      this.weightChart.destroy();
    }

    // Create new chart
    const ctx = canvas.getContext('2d');
    this.weightChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Weight (${unit})`,
          data: weights,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#9CA3AF'
            }
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F3F4F6',
            bodyColor: '#D1D5DB',
            borderColor: '#374151',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: '#374151'
            },
            ticks: {
              color: '#9CA3AF'
            }
          },
          y: {
            grid: {
              color: '#374151'
            },
            ticks: {
              color: '#9CA3AF'
            }
          }
        }
      }
    });
  }

  /**
   * Get weight history from storage
   * @private
   * @returns {Array} Weight history data
   */
  _getWeightHistory() {
    return this.storage.loadWeightHistory();
  }

  /**
   * Get workout history from storage
   * @private
   * @returns {Object} Workout statistics
   */
  _getWorkoutHistory() {
    const workoutPlan = this.storage.loadWorkoutPlan();
    
    // Calculate statistics from workout plan
    let totalWorkouts = 0;
    let completedWorkouts = 0;
    let currentWeekWorkouts = 0;
    let lastWorkoutDate = null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const exercises = workoutPlan.weeklyPlan[day] || [];
      exercises.forEach(exercise => {
        totalWorkouts++;
        if (exercise.completed) {
          completedWorkouts++;
          currentWeekWorkouts++;
          
          // Track last workout date (if available)
          if (exercise.completedAt) {
            const completedDate = new Date(exercise.completedAt);
            if (!lastWorkoutDate || completedDate > lastWorkoutDate) {
              lastWorkoutDate = completedDate;
            }
          }
        }
      });
    });

    const completionRate = totalWorkouts > 0 ? completedWorkouts / totalWorkouts : 0;
    const lastWorkoutDateStr = lastWorkoutDate 
      ? lastWorkoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A';

    return {
      totalWorkouts,
      currentWeekWorkouts,
      completionRate,
      lastWorkoutDate: lastWorkoutDateStr
    };
  }
}
