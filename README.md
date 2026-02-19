# Fitness & Health Dashboard

A modern, responsive web application for tracking fitness and health metrics. Built with HTML5, CSS3 (Tailwind CSS), and Vanilla JavaScript.

![Dark Mode Dashboard](https://img.shields.io/badge/Theme-Dark%20Mode-blue)
![Responsive](https://img.shields.io/badge/Design-Responsive-green)
![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%20AA-brightgreen)

## Features

### 🧮 BMI Calculator
- Calculate Body Mass Index with real-time results
- Support for both metric (kg/cm) and imperial (lbs/ft/in) units
- Color-coded BMI categories (Underweight, Normal, Overweight, Obese)
- Input validation with helpful error messages

### 🍎 Calorie Estimator
- Calculate daily caloric needs using the Mifflin-St Jeor Equation
- Personalized results based on age, gender, weight, height, and activity level
- Shows maintenance, weight loss, and weight gain calorie targets
- Age boundary warnings for accuracy

### 💪 Workout Planner
- 7-day weekly workout schedule
- Add exercises with sets and reps
- Track completion status with checkboxes
- Persistent storage of workout plans

### 📊 Progress Tracker
- Visual weight trend tracking
- Workout completion statistics
- Chart.js integration with CSS fallback
- Real-time progress updates

## Tech Stack

- **HTML5** - Semantic markup with accessibility attributes
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Vanilla JavaScript (ES6+)** - Modular architecture with no framework dependencies
- **Vite** - Fast build tool and dev server
- **localStorage API** - Client-side data persistence
- **Chart.js** (optional) - Data visualization

## Design Highlights

- 🌙 **Dark Mode Theme** - Easy on the eyes with neon blue and emerald green accents
- 📱 **Mobile-First Responsive** - Works seamlessly on all devices
- ♿ **Accessibility Compliant** - ARIA labels, keyboard navigation, focus indicators
- 🎨 **Modern UI** - Card-based layouts with smooth transitions
- 💾 **Data Persistence** - All your data is saved locally

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fitness-health-dashboard.git
cd fitness-health-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Project Structure

```
fitness-health-dashboard/
├── js/
│   ├── app.js                  # Main application controller
│   ├── bmi-calculator.js       # BMI calculation logic
│   ├── calorie-estimator.js    # Calorie estimation logic
│   ├── workout-planner.js      # Workout planning logic
│   ├── progress-tracker.js     # Progress visualization
│   ├── validation.js           # Input validation utilities
│   ├── unit-converter.js       # Unit conversion utilities
│   └── storage.js              # localStorage abstraction
├── css/
│   └── styles.css              # Custom styles and Tailwind imports
├── tests/
│   └── *.test.js               # Test files
├── index.html                  # Main HTML file
├── tailwind.config.js          # Tailwind configuration
├── vite.config.js              # Vite configuration
└── package.json                # Project dependencies

```

## Formulas Used

### BMI Calculation
```
BMI = weight(kg) / height(m)²
```

### Mifflin-St Jeor Equation (BMR)
```
For Men:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
For Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

### Calorie Targets
```
Maintenance Calories = BMR × Activity Multiplier
Weight Loss Target = Maintenance - 500 calories
Weight Gain Target = Maintenance + 500 calories
```

## Accessibility Features

- ✅ Keyboard navigation (Tab, Enter, Space, Escape)
- ✅ ARIA labels on all interactive elements
- ✅ Focus indicators with proper contrast
- ✅ Screen reader support
- ✅ Semantic HTML structure
- ✅ Color contrast compliance (WCAG AA)

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- BMI categories based on WHO standards
- Mifflin-St Jeor Equation for calorie calculations
- Tailwind CSS for styling framework
- Chart.js for data visualization

---

Built with ❤️ for fitness enthusiasts
