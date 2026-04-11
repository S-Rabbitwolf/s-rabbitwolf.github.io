
// Weather API variables for implementation of said API

const weatherUrl = 'https://weatherapi-com.p.rapidapi.com/forecast.json?days=3&q=London';
const weatherOptions = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '63b2ac205bmsh1930874e842fa48p19a56djsnf40c0674edcf',
		'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
		'Content-Type': 'application/json'
	}
};


//Update weather on passed object via DOM
function updateWeather(weatherObject) {
  console.log(weatherObject);
  document.querySelector("#currentTemp").textContent =
    weatherObject.current.temp_f + "°F";

    // Forecast loop. The for (let) essentially tells the function to increment each day by the value indicated starting from 0, so i = 0.
    // Also, $ is an indicator for adding variables to DOM elements, in this cast i.
    for (let i = 0; i <3; i++) {
      const day = weatherObject.forecast.forecastday[i];

      document.getElementById(`forecastDay${i + 1}`).textContent =
      day.date;

      document.getElementById(`forecastDay${i + 1}Condition`).textContent =
      day.day.condition.text;

      document.getElementById(`forecastDay${i + 1}Temp`).textContent =
      day.day.mintemp_f + "°F - " + day.day.maxtemp_f + "°F"

      document.getElementById(`forecastDay${i + 1}Wind`).textContent =
      "Wind: " + day.day.maxwind_mph + " mph";
    }
}

// core function for JSON retrieval

async function getData(url, options) {
  try {
    const response = await fetch(url, options);

    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw(response.status);
    }

  } catch (error) {
    console.error(error);
  }
}

// IP lookup variable and whatnot

let ipLookupURL = "https://api.ipify.org/?format=json";
let ipLookupOptions = {}; // empty for now


getData(ipLookupURL, ipLookupOptions).then(function(result) {
  

getData(weatherUrl, weatherOptions).then(function(weatherResult){
  console.log(weatherResult);
  updateWeather(weatherResult);
});


});

addEventListener("DOMContentLoaded")