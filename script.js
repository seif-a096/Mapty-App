'use strict';

// const months = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date());
  id = (Date.now().toString() + '').slice(-6);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

let Runner = new Running([51.505, -0.09], 5, 24, 178);
let Cyclist = new Cycling([51.505, -0.09], 20, 60, 500);
console.log(Runner);
console.log(Cyclist);

class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Could not get your location')
      );
    }
  }
  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup('📌Current Location.')
      .openPopup();

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(e) {
    this.#mapEvent = e;
    //clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.classList.remove('hidden');
  }
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.value = inputElevation.value = '';
    inputDistance.focus();
  }
  _newWorkout(e) {
    e.preventDefault();
    //get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // workout type
    if (inputType.value === 'running') {
      const cadence = +inputCadence.value;
      if (!this._validateInputs(distance, duration, cadence)) return;
      const coords = this.#mapEvent.latlng;
      workout = new Running(coords, distance, duration, cadence);
      this.#workouts.push(workout);
      this.renderWorkouts(workout);
      //   console.log(workout);
    } else if (inputType.value === 'cycling') {
      const elevation = +inputElevation.value;
      if (!this._validateInputs(distance, duration, elevation)) return;
      const coords = this.#mapEvent.latlng;
      workout = new Cycling(coords, distance, duration, elevation);
      this.#workouts.push(workout);
      this.renderWorkouts(workout);
      //   console.log(workout);
    }

    const { lat, lng } = this.#mapEvent.latlng;
    const marker = L.marker([lat, lng]).addTo(this.#map);
    marker
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.type} on ${
          workout.date
        }`
      )
      .openPopup();
    form.classList.add('hidden');
    console.log(this.#workouts);
  }
  // validate inputs
  _validateInputs(distance, duration, extra) {
    if (
      !Number.isFinite(distance) ||
      !Number.isFinite(duration) ||
      (extra && !Number.isFinite(extra)) ||
      distance <= 0 ||
      duration <= 0 ||
      (extra && extra < 0)
    ) {
      alert('Inputs have to be positive/valid numbers!');
      return false;
    }
    return true;
  }
  //render workouts
  renderWorkouts(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${
            workout.type.slice(0, 1).toUpperCase() + workout.type.slice(1)
          } on ${workout.date}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;
    if (workout.type === 'running') {
      html += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.pace.toFixed(1)}</span>
              <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">🦶🏼</span>
              <span class="workout__value">${workout.cadence}</span>
              <span class="workout__unit">spm</span>
            </div>
            </li>`;
    }
    if (workout.type === 'cycling') {
      html += `
            <div class="workout__details">
              <span class="workout__icon">⚡️</span>
              <span class="workout__value">${workout.speed.toFixed(1)}</span>
              <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⛰</span>
              <span class="workout__value">${workout.elevationGain}</span>
              <span class="workout__unit">m</span>
            </div>
            </li>`;
    }
    form.insertAdjacentHTML('afterend', html);
  }
}
const app = new App();
