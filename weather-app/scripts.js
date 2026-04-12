
// Weather API variables for implementation of said API
const weatherOptions = {
	method: 'GET',
	headers: {
		'x-rapidapi-key': '63b2ac205bmsh1930874e842fa48p19a56djsnf40c0674edcf',
		'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com',
		'Content-Type': 'application/json'
	}
};

function getWeather(city) {
const weatherUrl = `https://weatherapi-com.p.rapidapi.com/forecast.json?days=3&q=${city}`;

getData(weatherUrl, weatherOptions).then(function(weatherResult){
  updateWeather(weatherResult);
});
}


//Button functionality to change cities using the function above. preventDefault stops the page from doing a refresh when the button is submitted.

document.getElementById("search-form").addEventListener("submit", function(event) {
  event.preventDefault(); 

  const city = document.getElementById("cityInput").value;
  getWeather(city);
});


//Update weather on passed object via DOM
function updateWeather(weatherObject) {
  console.log(weatherObject);

  //name of city updated when name is changed
  document.getElementById("locationName").textContent =
    weatherObject.location.name + ", " + weatherObject.location.region;

    //Current temperature. This will continue for other measurable variables
  document.querySelector("#currentTemp").textContent =
    weatherObject.current.temp_f + "°F";

  document.querySelector("#currentIcon").src =
    "https:" + weatherObject.current.condition.icon;

  document.getElementById("#currentIcon").alt = 
      weatherObject.current.condition.text;

    // Forecast loop. The for (let) essentially tells the function to increment each day by the value indicated starting from 0, so i = 0.
    // Also, $ is an indicator for adding variables to DOM elements, in this case, i.
    for (let i = 0; i <3; i++) {
      const day = weatherObject.forecast.forecastday[i];

      document.getElementById(`forecastDay${i + 1}`).textContent =
      day.date;

      document.getElementById(`forecastDay${i + 1}Condition`).textContent =
      day.day.condition.text;

      document.getElementById(`forecastDay${i + 1}Temp`).textContent =
      day.day.mintemp_f + "°F - " + day.day.maxtemp_f + "°F";

      document.getElementById(`forecastDay${i + 1}Wind`).textContent =
      "Wind: " + day.day.maxwind_mph + " mph";

      document.getElementById(`forecastDay${i + 1}Icon`).src =
      "https:" + day.day.condition.icon;

      document.getElementById(`forecastDay${i + 1}Icon`).alt =
      day.day.condition.text;
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


//Default city on the page load
getWeather("London");