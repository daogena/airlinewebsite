// Reads HTML and translates to int
// function connection(connection_value) {
//     if (connection_value == "zero-connection") {
//         return 0; 
//     }
//     else {
//         return 1; 
//     }
// }

// Reads HTML and translates to int
function passenger(passenger_value) {
    if (passenger_value == "one-passenger") {
        return 1; 
    }
    else if (passenger_value == "two-passenger") {
        return 2; 
    }
    else if (passenger_value == "three-passenger") {
        return 3; 
    }
    else {
        return 4; 
    }
}

// Reads HTML city and translates to airport code
function city(city_value) {
    if (city_value == "houston") {
        return "IAH"; 
    }
    else if (city_value == "dallas") {
        return "DFW"; 
    }
    else if (city_value == "la") {
        return "LAX"; 
    }
    else if (city_value == "new-york") {
        return "JFK"; 
    }
    else if (city_value == "orlando") {
        return "MCO"; 
    }
    else {
        return "MDW"; 
    }
}

// TRIXIE - If you want to add connections to the page, go to airlineweb.html and uncomment the stuff I commented
// Also uncomment everything on this index.js that has to do with connections

// let connections; 
let passengers; 
let departure; 
let fare_condition; 

let from; 
let to; 


function submit() {
    // These statements gets values entered by user into page 
    // connections = connection(document.getElementById('connection').value); 
    passengers = passenger(document.getElementById('passenger').value);
    departure = document.querySelector('input[type=date]').value;
    fare_condition = document.getElementById('fare-condition').value; 

    from = city(document.getElementById('from').value); 
    to = city(document.getElementById('to').value); 

    // These statements store these values into the localstorage of the browser so we can access it from another HTML file
    // localStorage.setItem("connectLocalStorage", connections); 
    localStorage.setItem("passLocalStorage", passengers); 
    localStorage.setItem("departLocalStorage", departure); 
    localStorage.setItem("fareLocalStorage", fare_condition); 

    localStorage.setItem("fromLocalStorage", from); 
    localStorage.setItem("toLocalStorage", to); 

    // Redirect to this page 
    window.location.href = 'flights.html'; 

}
