'use strict';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapEvent;
document.addEventListener('DOMContentLoaded', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];

        map = L.map('map').setView(coords, 16);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker(coords)
          .addTo(map)
          .bindPopup('📌Current Location.')
          .openPopup();

        map.on('click', e => {
          mapEvent = e;
          form.classList.remove('hidden');
          console.dir(form);
        });
      },
      () => alert('Could not get your location')
    );
  }
});
form.addEventListener('submit', e => {
  e.preventDefault();
  //clear input fields
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
  const { lat, lng } = mapEvent.latlng;
  const marker = L.marker([lat, lng]).addTo(map);
  marker
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent(
      `<p>Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}</p>`
    )
    .openPopup();
});
inputType.addEventListener('change', () => {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.value = inputElevation.value = '';
  inputDistance.focus();
});
