let passengers; 
let date; 
let fare_condition; 

let depart; 
let arrive;

let flight_id; 
let book_ref; 

const API_BASE_URL = "http://localhost:3000/"; 

window.onload = function()  {
    passengers = localStorage.getItem("passLocalStorage"); 
    passengers = Number(passengers); 

    date = localStorage.getItem("dateLocalStorage"); 
    date = date.substring(0, 10); 
    fare_condition = localStorage.getItem("fareLocalStorage"); 

    depart = localStorage.getItem("departcityLocalStorage"); 
    arrive = localStorage.getItem("arrivecityLocalStorage"); 

    flight_id = localStorage.getItem("flightidLocalStorage"); 
    book_ref = localStorage.getItem("bookrefLocalStorage"); 
    
    for(i = 1; i <= passengers; i++) {
        let name = localStorage.getItem(`name${i}LocalStorage`); 
        let ticket_number = localStorage.getItem(`ticketno${i}LocalStorage`); 
        let seatid = localStorage.getItem(`seatid${i}LocalStorage`); 
        displayHeader(name); 
        displayTicket(ticket_number, book_ref); 
        displaySeatInfo(seatid); 
        displayBoarding(fare_condition); 
    }
}

function dateToString(date) {
    let month = date.substring(5,7); 
    let month_string; 
    switch(month) {
        case 12: 
            month_string = "DEC"; 
            break;
        case 01: 
            month_string = "JAN"; 
            break;
        case 02: 
            month_string = "FEB"; 
            break; 
        default: 
            month_string = "DEC"; 
            break; 
    }
    let year = date.substring(0,4); 
    let day = date.substring(8,10); 
    let date_string = month_string + " " +  day + " " + year; 
    return date_string; 
}

function displayHeader(name) {
    let date_string = dateToString(date); 
    name = name.toUpperCase(); 
    let headerContent = ""; 
    headerContent += `
        <div class="flight-id">FLIGHT ${flight_id}</div>
        <div class="flight-path">${depart} - ${arrive}</div>
        <div class="date">${date_string}</div>
        <div class="name">${name}</div>
    `
    let seatHeaderContent = "";
    seatHeaderContent += `
        <div class="flight-id">FLIGHT ${flight_id}</div> 
    `
    document.querySelector('.ticket-heading-container').innerHTML = headerContent; 
    document.querySelector('.seat-pass-container .ticket-heading-container').innerHTML = seatHeaderContent; 
}

let response; 
async function displayTicket(ticket_number, book_ref) {
    const body = {
        flight_id: flight_id
    }
    const url = `${API_BASE_URL}flight`; 
    try {
        response = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json(); 
        }); 
    } catch(err) {
        console.log(err.message); 
    }
    // Departure gate
    let gateContent = ""; 
    gateContent = `
        <div class="boarding-title">DEPARTURE GATE</div>
        <div class="gate">${response[0]['departure_gate']}</div>
    `
    // Boarding time
    let boarding_time = getBoardingTime(response[0]['scheduled_departure']);
    let boardingContent = ""; 
    boardingContent = `
        <div class="boarding-title">BOARDS AT</div>
        <div class="boarding-time">${boarding_time}</div>
    `
    // Terminal
    let terminalContent = ""; 
    terminalContent += `
        <div class="boarding-title">TERMINAL</div>
        <div class="terminal">${response[0]['departure_terminal']}</div>
    `
    // Departure time
    let depart_timeContent = ""; 
    let departure_time = getDepartTime(response[0]['scheduled_departure']); 
    depart_timeContent += `
        <div class="boarding-title">DEPART TIME</div>
        <div class="depart-time">${departure_time}</div>
    `
    // Flight no
    let flight_noContent = ""; 
    flight_noContent += `
        <div class="boarding-title">FLIGHT NO.</div>
        <div class="flight-no">${response[0]['flight_no']}</div>
    `
    // Ticket no
    let ticket_noContent = ""; 
    ticket_noContent += `
        <div class="boarding-title">TICKET NO.</div>
        <div class="ticket-no">${ticket_number}</div>
    `
    // Book ref
    let book_refContent = ""; 
    book_refContent += `
        <div class="boarding-title">BOOK REF.</div>
        <div class="book-ref">${book_ref}</div
    `
    document.querySelector('.departure-container').innerHTML = gateContent; 
    document.querySelector('.boarding-time-container').innerHTML = boardingContent; 
    document.querySelector('.terminal-container').innerHTML = terminalContent; 
    document.querySelector('.depart-time-container').innerHTML = depart_timeContent;
    document.querySelector('.flight-no-container').innerHTML = flight_noContent;  
    document.querySelector('.ticket-no-container').innerHTML = ticket_noContent; 
    document.querySelector('.book-ref-container').innerHTML = book_refContent; 
}

async function displaySeatInfo(seatid) {
    const body = {
        seatid: seatid
    }
    const url = `${API_BASE_URL}seat`; 
    try {
        response = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json(); 
        }); 
    } catch(err) {
        console.log(err.message); 
    }
    let seat_noContent = ""; 
    seat_noContent += `
        <div class="boarding-title">SEAT NO.</div>
        <div class="seat-no">${response[0]['seat_no']}</div>
    `
    let fareContent = "";
    fareContent += `
        <div class="fare-condition">${fare_condition}</div>
    `
    let pathContent = ""; 
    pathContent += `
        <div class="flight-path">${depart} - ${arrive}</div
    `
    document.querySelector('.fare-condition-container').innerHTML = fareContent; 
    document.querySelector('.flight-path-container').innerHTML = pathContent; 
    document.querySelector('.seat-no-container').innerHTML = seat_noContent; 
}

async function displayBoarding(fare_condition) {
    const body = {
        fare: fare_condition
    }; 
    const url = `${API_BASE_URL}boarding`; 
    try {
        response = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json(); 
        }); 
    } catch(err) {
        console.log(err.message); 
    }
    let group_no = response[0]['group_no']; 
    let boardingContent = "";
    boardingContent += `
        <div class="boarding-title">BOARDING ZONE</div>
        <div class="zone">${group_no}</div>
    `
    document.querySelector('.zone-container').innerHTML = boardingContent; 
}

function getBoardingTime(departure_time) {
    let time = new Date(departure_time); 
    let min = 30; 
    time.setMinutes(time.getMinutes() - min);
    let str_time = time.toString(); 
    return str_time.substring(16,21); 
}

function getDepartTime(departure_time) {
    let time = new Date(departure_time);
    let str_time = time.toString();  
    return str_time.substring(16,21); 
}

function bookAnother() {
    window.location.href = "airlineweb.html"; 
} 