let connections; 
let passengers; 
let departure; 
let fare_condition; 

let from; 
let to; 

// TRIXIE - If you're going to add connections to this page, you can copy & paste the connection function from index.js to here
// And also uncomment everything on this flights.js page and flights.html page about connections 

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

// Reads HTML city value and translates to airport code
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

// This is the API base url where we are accessing the endpoint on the server 
const API_BASE_URL = "http://localhost:3000/"; 

// When page loads, get all these values from localstorage and execute searchFlights(); 
window.onload = function() {
    // connections = localStorage.getItem("connectionLocalStorage"); 
    // connections = Number(connections); 

    passengers = localStorage.getItem("passLocalStorage"); 
    passengers = Number(passengers); 

    departure = localStorage.getItem("departLocalStorage"); 

    fare_condition = localStorage.getItem("fareLocalStorage");
    
    from = localStorage.getItem("fromLocalStorage"); 
    to = localStorage.getItem("toLocalStorage"); 
    searchFlights(); 
}; 

// TRIXIE - I haven't gotten this to work yet
// This is for the sidebar
function submit() {
    // connections = connection(document.getElementById('connection').value); 
    passengers = passenger(document.getElementById('passenger').value);
    departure = document.querySelector('input[type=date]').value;
    fare_condition = document.getElementById('fare-condition').value; 

    from = city(document.getElementById('from').value); 
    to = city(document.getElementById('to').value);  
    console.log(passengers);  
    searchFlights(); 
}

// This refers to app.js - app.post('/flights' ... )
async function searchFlights() { 
    const body = {
        from: from, 
        to: to, 
        date: departure
    }; 
    
    const url = `${API_BASE_URL}flights`
    try {
        const response = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            // If the query to db is successful, execute getFlights()
            if (response.status == 200) {
                getFlights(); 
            }
        }); 
    } catch (err) {
        console.log(err.message); 
    }
}

let date; 
let depart; 
let depart_time; 
let arrive; 
let arrive_time; 

let flight_id; 

// Displays flights containers 
async function getFlights() {
    const url = `${API_BASE_URL}flights`; 
    let jsonData;
    let flightContent = ""; 
    try {
        const response = await fetch(url)
        jsonData = await response.json(); 
    } catch (err) {
        console.log(err.message); 
    }
    date = (jsonData[0].scheduled_departure).toString();
    let showDate = date.substring(0, 10); 

    depart = jsonData[0].departure_airport; 
    depart_time = (jsonData[0].scheduled_departure).toString();
    let showDepart_time = depart_time.substring(11, 16); 

    arrive = jsonData[0].arrival_airport; 
    arrive_time = (jsonData[0].scheduled_arrival).toString();
    let showArrive_time = arrive_time.substring(11, 16); 

    flight_id = jsonData[0].flight_id; 

    for (flight in jsonData) {
        flightContent += `
        <div class="flight-container">
            <div class="departure-date-container">
                <div class="departure-date">${showDate}</div>
            </div>
            <div class="from-to-container">
                <div class="from-city-container">
                    <div class="from-city">${depart}</div>
                    <div class="from-time">${showDepart_time}</div>
                </div>
                <i class="fas fa-plane"></i>
                <div class="to-city-container">
                    <div class="to-city">${arrive}</div>
                    <div class="to-time">${showArrive_time}</div>
                </div>
            </div>
            <div class="book-button-container">
                <div class="book-button" onClick="book()">Book</div>
            </div>
        </div>        
        `
    }
    document.querySelector(".available-flights").innerHTML = flightContent; 
}

// When user clicks book, store all of these values to use on the next HTML page
function book() {
    localStorage.setItem("passLocalStorage", passengers); 
    localStorage.setItem("dateLocalStorage", date); 
    localStorage.setItem("fareLocalStorage", fare_condition); 
    localStorage.setItem("departcityLocalStorage", depart); 
    localStorage.setItem("departtimeLocalStorage", depart_time); 
    localStorage.setItem("arrivecityLocalStorage", arrive); 
    localStorage.setItem("arrivetimeLocalStorage", arrive_time);
    
    localStorage.setItem("flightidLocalStorage", flight_id); 

    // Redirect to this page
    window.location.href = 'booking.html'; 
}