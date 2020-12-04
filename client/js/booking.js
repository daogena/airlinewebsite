let connections; 
let passengers; 
let date; 
let fare_condition; 

let depart; 
let depart_time; 
let arrive; 
let arrive_time; 

let flight_id;
let flight_no;  

const API_BASE_URL = "http://localhost:3000/"; 

// When the page loads, get all these values from localstorage and execute displayTravelers() and displayPrice()
window.onload = function() {
    passengers = localStorage.getItem("passLocalStorage"); 
    passengers = Number(passengers); 

    date = localStorage.getItem("dateLocalStorage"); 

    fare_condition = localStorage.getItem("fareLocalStorage"); 

    depart = localStorage.getItem("departcityLocalStorage"); 

    depart_time = localStorage.getItem("departtimeLocalStorage"); 

    arrive = localStorage.getItem("arrivecityLocalStorage"); 

    arrive_time = localStorage.getItem("arrivetimeLocalStorage"); 

    flight_id = localStorage.getItem("flightidLocalStorage"); 

    connections = localStorage.getItem("connectLocalStorage"); 

    if (connections == "no") {
        farePrice(fare_condition); 
        displayTravelers(); 
        displayPrice(); 
    }
    else {
        flight_no = localStorage.getItem("flightnoLocalStorage"); 
        farePrice(fare_condition);
        displayTravelers(); 
        displayPrice(); 
        getFlightIds(); 
    }
}

let flight_id1; 
let flight_id2; 
async function getFlightIds() {
    let response; 
    const body = {
        flight_no: flight_no
    };
    const url = `${API_BASE_URL}connectingflight`;  
    try {
        response = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json();
        }); 
    } catch (err) {
        console.log(err.message); 
    } 
    flight_id1 = response[0]['flight_id']; 
    flight_id2 = response[1]['flight_id']; 
    localStorage.setItem("flightid1LocalStorage", flight_id1); 
    localStorage.setItem("flightid2LocalStorage", flight_id2);
}

// Show containers for each traveler, depending on the number of passengers the user chose
function displayTravelers() {
    let travelerContent = ""; 
    let pass_count = 1; 
    for (i = 0; i < passengers; i++) {
        travelerContent += `
            <div class="travel-info-title">Traveler ${pass_count}</div>
            <form>
                <input type="text" id="fullname" name="name${pass_count}" placeholder="Full name">
                <input type="text" id="phone" name="phone${pass_count}" placeholder="Phone number">
                <input type="text" id="email" name="email${pass_count}" placeholder="Email">
            </form>        
        `
        pass_count++;  
    }
    document.querySelector(".travel-info-container").innerHTML = travelerContent; 
}

let price; 
async function farePrice(fare_condition) {
    const body = {
        fare: fare_condition
    };
    const url = `${API_BASE_URL}fare`;  
    try {
        price = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            return response.json();
        }); 
    } catch (err) {
        console.log(err.message); 
    }
    localStorage.setItem("priceLocalStorage", price); 
    return price; 
}

// Display the total price at the bottom of the page depending on how many passengers there are
let total; 
let subtotal; 
let discount;
async function displayPrice() {
    let price = localStorage.getItem("priceLocalStorage"); 
    subtotal = passengers * price;
    discount;
    if (fare_condition == 'Business') {
        discount = 0.1; 
        total = subtotal - (subtotal * discount); 
    }
    else {
        discount = 0; 
        total = subtotal - (subtotal * discount); 
    }
    discount = (subtotal * discount); 
    let priceContent = "";
    priceContent += `
        <div class="subtotal-container">
            <div class="travel-info-title">Subtotal</div>
            <div class="subtotal">$${subtotal}</div>
        </div>
        <div class="discount-container">
            <div class="travel-info-titel">Discount</div>
            <div class="discount">-${discount}</div>
        </div>
        <div class="total-price-container">
            <div class="price-title">
                <div class="price-heading">Total price</div>
                <div class="price-subheading">with fare, taxes + fees</div>
            </div>
            <div class="total-price">$${total}</div>
        </div>
    `
    document.querySelector(".price-container").innerHTML = priceContent; 
    return discount; 
}

// Whenever the user changes the amount of checked bags, the price will also change
let total_amount; 
function calculatePrice() {
    let num_checked_bags = document.getElementById("checked-bags").value; 
    let sub_total = subtotal + num_checked_bags * 50; 
    total_amount = sub_total - discount; 
    let subtotalContent = "";
    let totalContent = ""; 
    subtotalContent += `
        <div class="travel-info-title">Subtotal</div>
        <div class="subtotal">$${sub_total}</div>
    `; 
    totalContent += `
        <div class="price-title">
            <div class="price-heading">Total price</div>
            <div class="price-subheading">with fare, taxes + fees</div>
        </div>
        <div class="total-price">$${total_amount}</div>        
    `; 
    document.querySelector(".subtotal-container").innerHTML = subtotalContent; 
    document.querySelector(".total-price-container").innerHTML = totalContent; 
    return total_amount;     
}

// When user clicks book
// Check if there are seats available and update bookings table
let response; 
async function checkSeats() { 
    let total_amount = calculatePrice(); 
    const body = {
        total: total_amount
    }; 
    const url = `${API_BASE_URL}booking`
    try {
        response = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            // If query is successful, execute confirmBooking()
            // Finish the booking post endpoint to account for adding on the waitlist
            return response.json(); 
        }); 
    } catch (err) {
        console.log(err.message); 
    }
    localStorage.setItem("bookrefLocalStorage", response.book_ref);  
    confirmBooking(); 
}


async function confirmBooking() {
    let name; 
    let phone; 
    let email; 
    let bags = document.getElementById('checked-bags').value; 
    let card_no = document.getElementById('card-no').value; 
    discount = discount / 100; 
    for(i = 1; i <= passengers; i++) {
        name = document.querySelector(`[name="name${i}"]`).value; 
        email = document.querySelector(`[name="email${i}"]`).value;
        phone = document.querySelector(`[name="phone${i}"]`).value;  
        if (bags == "") {
            bags = 0; 
        }
        if (connections == "yes") {
            let body = {
                flight_id: flight_id1, 
                name: name, 
                email: email, 
                phone: phone, 
                fare: fare_condition, 
                bags: bags, 
                card_no: card_no, 
                ticket_price: price,
                discount: discount, 
                connection: connections
            };   
            const url = `${API_BASE_URL}confirmbooking`
            try {
                response = await fetch(url, {
                    method: "POST", 
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify(body)
                }).then((response) => {
                    return response.json(); 
                }); 
            } catch (err) {
                console.log(err.message); 
            } 
            localStorage.setItem(`seatidfirstconnect${i}LocalStorage`, response['seat_available']);
            localStorage.setItem(`ticketnofirstconnect${i}LocalStorage`, response['ticket_number']);
            localStorage.setItem(`waitfirstconnect${i}LocalStorage`, response['wait']); 
            body = {
                flight_id: flight_id2, 
                name: name, 
                email: email, 
                phone: phone, 
                fare: fare_condition, 
                bags: bags, 
                card_no: card_no, 
                ticket_price: price,
                discount: discount
            };  
            try {
                response = await fetch(url, {
                    method: "POST", 
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify(body)
                }).then((response) => {
                    return response.json(); 
                }); 
            } catch (err) {
                console.log(err.message); 
            }
            localStorage.setItem(`name${i}LocalStorage`, name); 
            localStorage.setItem(`seatidsecondconnect${i}LocalStorage`, response['seat_available']);
            localStorage.setItem(`ticketnosecondconnect${i}LocalStorage`, response['ticket_number']);
            localStorage.setItem(`waitsecondconnect${i}LocalStorage`, response['wait']); 
        }
        else { 
            const body = {
                flight_id: flight_id, 
                name: name, 
                email: email, 
                phone: phone, 
                fare: fare_condition, 
                bags: bags, 
                card_no: card_no, 
                ticket_price: price,
                discount: discount, 
                connection: connections
            };   
            const url = `${API_BASE_URL}confirmbooking`
            try {
                response = await fetch(url, {
                    method: "POST", 
                    headers: { "Content-Type": "application/json"},
                    body: JSON.stringify(body)
                }).then((response) => {
                    return response.json(); 
                }); 
            } catch (err) {
                console.log(err.message); 
            }
            localStorage.setItem(`name${i}LocalStorage`, name); 
            localStorage.setItem(`seatid${i}LocalStorage`, response['seat_available']);
            localStorage.setItem(`ticketno${i}LocalStorage`, response['ticket_number']);
            localStorage.setItem(`wait${i}LocalStorage`, response['wait']); 
        }
    } 
    setVariables(); 
    window.location.href = 'ticket.html'; 
}

function setVariables() {
    localStorage.setItem("passengerLocalStorage",passengers); 
    localStorage.setItem("flightidLocalStorage", flight_id); 
    localStorage.setItem("fareLocalStorage", fare_condition);
    localStorage.setItem("connectLocalStorage", connections); 
}
