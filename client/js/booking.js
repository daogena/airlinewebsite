let passengers; 
let date; 
let fare_condition; 

let depart; 
let depart_time; 
let arrive; 
let arrive_time; 

let flight_id; 

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

    displayTravelers(); 
    displayPrice(); 
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

// TRIXIE - This is a function I used before you determined the price for each class. I don't think we're going to end up using this because we're going to query the db
// You can create another endpoint in app.js to query the price depending on class 
// Something like app.get('/class ...)
function farePrice(fare_condition) {
    if (fare_condition == "Economy") {
        return 100; 
    } 
    else if (fare_condition == "Business") {
        return 600; 
    }
    else {
        return 2000; 
    }
}

// async function farePrice(fare_condition) {
//     const body = {
//         fare: fare_condition
//     };
//     const url = `${API_BASE_URL}fare`; 
//     try {
//         const response = await fetch(url, {
//             method: "POST", 
//             headers: { "Content-Type": "application/json"},
//             body: JSON.stringify(body)
//         }).then((response) => {
//             return response.json();
//         }).then((data) => {
//             console.log(data); 
//             return data; 
//         });         
//     } catch (err) {
//         console.log(err.message); 
//     }
// }

// Display the total price at the bottom of the page depending on how many passengers there are
let price; 
async function displayPrice() {
    price = passengers * farePrice(fare_condition); 
    let priceContent = "";
    priceContent += `
        <div class="price-title">
            <div class="price-heading">Total price</div>
            <div class="price-subheading">with fare, taxes + fees</div>
        </div>
        <div class="total-price">$${price}</div>
    `
    document.querySelector(".price-container").innerHTML = priceContent; 
}

// Whenever the user changes the amount of checked bags, the price will also change
let total_amount; 
function calculatePrice() {
    let num_checked_bags = document.getElementById("checked-bags").value; 
    total_amount = price + num_checked_bags * 50; 
    let priceContent = "";
    priceContent += `
        <div class="price-title">
            <div class="price-heading">Total price</div>
            <div class="price-subheading">with fare, taxes + fees</div>
        </div>
        <div class="total-price">$${total_amount}</div>
    `
    document.querySelector(".price-container").innerHTML = priceContent; 
    return total_amount;     
}

// When user clicks book
// Check if there are seats available and update bookings table
async function checkSeats() { 
    let total_amount = calculatePrice(); 
    const body = {
        total: total_amount
    }; 
    const url = `${API_BASE_URL}booking`
    try {
        const response = await fetch(url, {
            method: "POST", 
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(body)
        }).then((response) => {
            // If query is successful, execute confirmBooking()
            // Finish the booking post endpoint to account for adding on the waitlist
            if (response.status == 200) {
                confirmBooking(); 
            }
        }); 
    } catch (err) {
        console.log(err.message); 
    }
    // window.location.href = "ticket.html"
}

// TRIXIE - this doesn't fully work yet because I am missing the ticket status 
// We need to finish the booking post endpoint to account for adding on the waitlist
async function confirmBooking() {
    let name; 
    let phone; 
    let email; 
    let bags = document.getElementById('checked-bags').value; 
    for(i = 1; i <= passengers; i++) {
        name = document.querySelector(`[name="name${i}"]`).value; 
        email = document.querySelector(`[name="email${i}"]`).value;
        phone = document.querySelector(`[name="phone${i}"]`).value;  
        if (bags == "") {
            bags = 0; 
        }
        const body = {
            flight_id: flight_id, 
            name: name, 
            email: email, 
            phone: phone, 
            fare: fare_condition, 
            bags: bags
        };   
        const url = `${API_BASE_URL}confirmbooking`
        try {
            const response = await fetch(url, {
                method: "POST", 
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify(body)
            }).then((response) => {
                console.log(response.status)
            }); 
        } catch (err) {
            console.log(err.message); 
        }
    }
}