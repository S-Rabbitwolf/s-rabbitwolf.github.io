

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

// DOM wait commands
