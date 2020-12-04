let connections; 
let passengers; 
let date; 
let fare_condition; 

let depart; 
let arrive;

let flight_id; 
let book_ref; 
let flight_id1; 
let flight_id2; 

let connect; 

let gate; 

const API_BASE_URL = "http://localhost:3000/"; 

window.onload = function()  {
    passengers = localStorage.getItem("passLocalStorage"); 
    passengers = Number(passengers); 

    date = localStorage.getItem("dateLocalStorage"); 
    date = date.substring(0, 10); 
    fare_condition = localStorage.getItem("fareLocalStorage"); 

    depart = localStorage.getItem("departcityLocalStorage"); 
    arrive = localStorage.getItem("arrivecityLocalStorage"); 

    book_ref = localStorage.getItem("bookrefLocalStorage"); 
    connections = localStorage.getItem("connectLocalStorage"); 
    connect = localStorage.getItem("connectcityLocalStorage"); 

    let date_string = dateToString(date); 

    for(i = 1; i <= passengers; i++) {
        let name = localStorage.getItem(`name${i}LocalStorage`);
        name = name.toUpperCase();  
        let ticket_number = localStorage.getItem(`ticketno${i}LocalStorage`); 
        let seatid = localStorage.getItem(`seatid${i}LocalStorage`);
        let wait = localStorage.getItem(`wait${i}LocalStorage`); 
        if (connections == "yes") {
            let ticket_number1 = localStorage.getItem(`ticketnofirstconnect${i}LocalStorage`); 
            let ticket_number2 = localStorage.getItem(`ticketnosecondconnect${i}LocalStorage`); 
            let wait1 = localStorage.getItem(`waitfirstconnect${i}LocalStorage`); 
            let wait2 = localStorage.getItem(`waitsecondconnect${i}LocalStorage`); 
            let seatid1 = localStorage.getItem(`seatidfirstconnect${i}LocalStorage`); 
            let seatid2 = localStorage.getItem(`seatidsecondconnect${i}LocalStorage`); 
            displayFirstTicket(date_string, ticket_number1, seatid1, wait1);
            displaySecondTicket(date_string, ticket_number2, seatid2, wait2);  
        }  
        else {
            displayTicket(date_string, ticket_number, seatid, name, wait); 
        }
    }
}

async function displayTicket(date_string, ticket_number, seatid, name, wait) {
    if (wait == "yes") {
        document.getElementById("wait-container").style.opacity = 1; 
    }
    else {
        document.getElementById("success-book").style.opacity = 1; 
    }
    let response; 
    let ticketContent = "";
    flight_id = localStorage.getItem("flightidLocalStorage");
    console.log(flight_id);  
    let body = {
        flight_id: flight_id
    }
    let url = `${API_BASE_URL}flight`; 
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
    let gate = response[0]['departure_gate']; 
    let board; 
    body = {
        fare: fare_condition
    }
    url = `${API_BASE_URL}boarding`; 
    try {
        board = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json(); 
        }); 
    } catch(err) {
        console.log(err.message); 
    }
    let boarding_time = getBoardingTime(response[0]['scheduled_departure']); 
    let departure_time = getDepartTime(response[0]['scheduled_departure']); 
    let group_no = board[0]['group_no'];
    ticketContent += `
    <div class="ticket-container">
        <div class="boarding-pass-container">
            <div class="ticket-heading-container">
                <div class="flight-id">FLIGHT ${flight_id}</div>
                <div class="flight-path">${depart} - ${arrive}</div>
                <div class="date">${date_string}</div>
                <div class="name">${name}</div>
            </div>
            <div class="ticket">
                <div class="boarding-info">
                    <div class="departure-container" id="departure-container">
                        <div class="boarding-title">DEPARTURE GATE</div>
                        <div class="gate">${gate}</div>
                    </div>
                    <div class="boarding-time-container">
                        <div class="boarding-title">BOARDS AT</div>
                        <div class="boarding-time">${boarding_time}</div>
                    </div>
                    <div class="zone-container">
                        <div class="boarding-title">BOARDING ZONE</div>
                        <div class="zone">${group_no}</div>
                    </div>
                </div>
                <div class="ticket-info">
                    <div class="connection-container">
                        
                    </div>
                    <div class="terminal-container">
                        <div class="boarding-title">TERMINAL</div>
                        <div class="terminal">${response[0]['departure_terminal']}</div>
                    </div>
                    <div class="ticket-no-container">
                        <div class="boarding-title">TICKET NO.</div>
                        <div class="ticket-no">${ticket_number}</div>
                    </div>
                    <div class="flight-no-container">
                        <div class="boarding-title">FLIGHT NO.</div>
                        <div class="flight-no">${response[0]['flight_no']}</div>
                    </div>
                    <div class="book-ref-container">
                        <div class="boarding-title">BOOK REF.</div>
                        <div class="book-ref">${book_ref}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="seat-pass-container">
            <div class="ticket-heading-container">
                <div class="flight-id">FLIGHT ${flight_id}</div> 
            </div>
            <div class="ticket">
                <div class="seat-info">
                    <div class="seat-no-container">
                        <div class="boarding-title">SEAT NO.</div>
                        <div class="seat-no">${seatid}</div>
                    </div>
                    <div class="fare-condition-container">
                        <div class="fare-condition">${fare_condition}</div>
                    </div>
                    <div class="flight-path-container">
                        <div class="flight-path">${depart} - ${arrive}</div>
                    </div>
                    <div class="depart-time-container">
                        <div class="boarding-title">DEPART TIME</div>
                        <div class="depart-time">${departure_time}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
    document.querySelector('.tickets-container').innerHTML = ticketContent;
}

async function displayFirstTicket(date_string, ticket_number, seatid, wait1) {
    if (wait1 == "yes") {
        document.getElementById("wait-container").style.opacity = 1; 
    }
    else {
        document.getElementById("success-book").style.opacity = 1; 
    }
    let response; 
    let ticketContent = "";
    flight_id1 = localStorage.getItem("flightid1LocalStorage"); 
    flight_id2 = localStorage.getItem("flightid2LocalStorage");
    let body = {
        flight_id: flight_id
    }
    let url = `${API_BASE_URL}flight`; 
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
    let gate = response[0]['departure_gate']; 
    let board; 
    body = {
        fare: fare_condition
    }
    url = `${API_BASE_URL}boarding`; 
    try {
        board = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json(); 
        }); 
    } catch(err) {
        console.log(err.message); 
    }
    let boarding_time = getBoardingTime(response[0]['scheduled_departure']); 
    let departure_time = getDepartTime(response[0]['scheduled_departure']); 
    let group_no = board[0]['group_no'];
    ticketContent += `
    <div class="ticket-container">
        <div class="boarding-pass-container">
            <div class="ticket-heading-container">
                <div class="flight-id">FLIGHT ${flight_id1}</div>
                <div class="flight-path">${depart} - ${connect}</div>
                <div class="date">${date_string}</div>
                <div class="name">${name}</div>
            </div>
            <div class="ticket">
                <div class="boarding-info">
                    <div class="departure-container" id="departure-container">
                        <div class="boarding-title">DEPARTURE GATE</div>
                        <div class="gate">${gate}</div>
                    </div>
                    <div class="boarding-time-container">
                        <div class="boarding-title">BOARDS AT</div>
                        <div class="boarding-time">${boarding_time}</div>
                    </div>
                    <div class="zone-container">
                        <div class="boarding-title">BOARDING ZONE</div>
                        <div class="zone">${group_no}</div>
                    </div>
                </div>
                <div class="ticket-info">
                    <div class="connection-container">
                        <div class="connect">TRANSFER AT ${connect}</div>
                    </div>
                    <div class="terminal-container">
                        <div class="boarding-title">TERMINAL</div>
                        <div class="terminal">${response[0]['departure_terminal']}</div>
                    </div>
                    <div class="ticket-no-container">
                        <div class="boarding-title">TICKET NO.</div>
                        <div class="ticket-no">${ticket_number}</div>
                    </div>
                    <div class="flight-no-container">
                        <div class="boarding-title">FLIGHT NO.</div>
                        <div class="flight-no">${response[0]['flight_no']}</div>
                    </div>
                    <div class="book-ref-container">
                        <div class="boarding-title">BOOK REF.</div>
                        <div class="book-ref">${book_ref}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="seat-pass-container">
            <div class="ticket-heading-container">
                <div class="flight-id">FLIGHT ${flight_id1}</div> 
            </div>
            <div class="ticket">
                <div class="seat-info">
                    <div class="seat-no-container">
                        <div class="boarding-title">SEAT NO.</div>
                        <div class="seat-no">${seatid}</div>
                    </div>
                    <div class="fare-condition-container">
                        <div class="fare-condition">${fare_condition}</div>
                    </div>
                    <div class="flight-path-container">
                        <div class="flight-path">${depart} - ${connect}</div>
                    </div>
                    <div class="depart-time-container">
                        <div class="boarding-title">DEPART TIME</div>
                        <div class="depart-time">${departure_time}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
    document.querySelector('.tickets-container').innerHTML = ticketContent;
}

async function displaySecondTicket(date_string, ticket_number, seatid, wait2) {
    if (wait2 == "yes") {
        document.getElementById("wait-container").style.opacity = 1; 
    }
    else {
        document.getElementById("success-book").style.opacity = 1; 
    }
    let response; 
    let ticketContent = "";
    flight_id2 = localStorage.getItem("flightid2LocalStorage");
    let body = {
        flight_id: flight_id2
    }
    let url = `${API_BASE_URL}flight`; 
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
    let gate = response[0]['departure_gate']; 
    let board; 
    body = {
        fare: fare_condition
    }
    url = `${API_BASE_URL}boarding`; 
    try {
        board = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json(); 
        }); 
    } catch(err) {
        console.log(err.message); 
    }
    let boarding_time = getBoardingTime(response[0]['scheduled_departure']); 
    let departure_time = getDepartTime(response[0]['scheduled_departure']); 
    let group_no = board[0]['group_no'];
    ticketContent = `
    <div class="ticket-container">
        <div class="boarding-pass-container">
            <div class="ticket-heading-container">
                <div class="flight-id">FLIGHT ${flight_id2}</div>
                <div class="flight-path">${connect} - ${arrive}</div>
                <div class="date">${date_string}</div>
                <div class="name">${name}</div>
            </div>
            <div class="ticket">
                <div class="boarding-info">
                    <div class="departure-container" id="departure-container">
                        <div class="boarding-title">DEPARTURE GATE</div>
                        <div class="gate">${gate}</div>
                    </div>
                    <div class="boarding-time-container">
                        <div class="boarding-title">BOARDS AT</div>
                        <div class="boarding-time">${boarding_time}</div>
                    </div>
                    <div class="zone-container">
                        <div class="boarding-title">BOARDING ZONE</div>
                        <div class="zone">${group_no}</div>
                    </div>
                </div>
                <div class="ticket-info">
                    <div class="connection-container">
                        <div class="connect">TRANSFER AT ${connect}</div>
                    </div>
                    <div class="terminal-container">
                        <div class="boarding-title">TERMINAL</div>
                        <div class="terminal">${response[0]['departure_terminal']}</div>
                    </div>
                    <div class="ticket-no-container">
                        <div class="boarding-title">TICKET NO.</div>
                        <div class="ticket-no">${ticket_number}</div>
                    </div>
                    <div class="flight-no-container">
                        <div class="boarding-title">FLIGHT NO.</div>
                        <div class="flight-no">${response[0]['flight_no']}</div>
                    </div>
                    <div class="book-ref-container">
                        <div class="boarding-title">BOOK REF.</div>
                        <div class="book-ref">${book_ref}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="seat-pass-container">
            <div class="ticket-heading-container">
                <div class="flight-id">FLIGHT ${flight_id2}</div> 
            </div>
            <div class="ticket">
                <div class="seat-info">
                    <div class="seat-no-container">
                        <div class="boarding-title">SEAT NO.</div>
                        <div class="seat-no">${seatid}</div>
                    </div>
                    <div class="fare-condition-container">
                        <div class="fare-condition">${fare_condition}</div>
                    </div>
                    <div class="flight-path-container">
                        <div class="flight-path">${connect} - ${arrive}</div>
                    </div>
                    <div class="depart-time-container">
                        <div class="boarding-title">DEPART TIME</div>
                        <div class="depart-time">${departure_time}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
    document.querySelector('.tickets-container').innerHTML += ticketContent;
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

// let response; 
// async function displayBody() {
//     const body = {
//         flight_id: flight_id
//     }
//     const url = `${API_BASE_URL}flight`; 
//     try {
//         response = await fetch(url, {
//             method: "POST", 
//             headers: { "Content-Type": "application/json"},
//             body: JSON.stringify(body)
//         }).then((response) => {
//             return response.json(); 
//         }); 
//     } catch(err) {
//         console.log(err.message); 
//     }
//     // Departure gate
//     let gateContent = ""; 
//     gateContent = `
//         <div class="boarding-title">DEPARTURE GATE</div>
//         <div class="gate">${response[0]['departure_gate']}</div>
//     `
//     // Boarding time
//     let boarding_time = getBoardingTime(response[0]['scheduled_departure']);
//     let boardingContent = ""; 
//     boardingContent = `
//         <div class="boarding-title">BOARDS AT</div>
//         <div class="boarding-time">${boarding_time}</div>
//     `
//     // Terminal
//     let terminalContent = ""; 
//     terminalContent += `
//         <div class="boarding-title">TERMINAL</div>
//         <div class="terminal">${response[0]['departure_terminal']}</div>
//     `
//     // Departure time
//     let depart_timeContent = ""; 
//     let departure_time = getDepartTime(response[0]['scheduled_departure']); 
//     depart_timeContent += `
//         <div class="boarding-title">DEPART TIME</div>
//         <div class="depart-time">${departure_time}</div>
//     `
//     // Flight no
//     let flight_noContent = ""; 
//     flight_noContent += `
//         <div class="boarding-title">FLIGHT NO.</div>
//         <div class="flight-no">${response[0]['flight_no']}</div>
//     `
//     let gates = document.querySelectorAll('.departure-container'); 
//     let board = document.querySelectorAll('.boarding-time-container'); 
//     let terminal = document.querySelectorAll('.terminal-container'); 
//     let departTime = document.querySelectorAll('.depart-time-container');
//     let flightNo = document.querySelectorAll('.flight-no-container');  
//     for (var i = 0; i < gates.length; i++) {
//         gates[i].innerHTML = gateContent; 
//         board[i].innerHTML = boardingContent; 
//         terminal[i].innerHTML = terminalContent;
//         departTime[i].innerHTML = depart_timeContent;
//         flightNo[i].innerHTML = flight_noContent;
//     }
// }

// async function displayBoarding() {
//     const body = {
//         fare: fare_condition
//     }; 
//     const url = `${API_BASE_URL}boarding`; 
//     try {
//         response = await fetch(url, {
//             method: "POST", 
//             headers: { "Content-Type": "application/json"},
//             body: JSON.stringify(body)
//         }).then((response) => {
//             return response.json(); 
//         }); 
//     } catch(err) {
//         console.log(err.message); 
//     }
//     let group_no = response[0]['group_no']; 
//     let boardingContent = "";
//     boardingContent += `
//         <div class="boarding-title">BOARDING ZONE</div>
//         <div class="zone">${group_no}</div>
//     `
//     let board = document.querySelectorAll('.zone-container'); 
//     for (var i = 0; i < board.length; i++) {
//         board[i].innerHTML = boardingContent; 
//     }
// }

function bookAnother() {
    window.location.href = "airlineweb.html"; 
} 