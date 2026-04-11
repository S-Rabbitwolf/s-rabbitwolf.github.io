
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
});


});

addEventListener("DOMContentLoaded")