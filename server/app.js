const express = require('express'); 
const app = express(); 
const cors = require('cors'); 
const pool = require('./db'); 
// const book = require('./db'); 

app.use(cors()); 
app.use(express.json()); 

// Insert flights requested by user into temp table
app.post('/flights', async(req, res) => {
    let from = req.body.from; 
    let to = req.body.to; 
    let date = req.body.date; 
    try {
        await pool.query(`DELETE FROM search_flights`); 
        const flights = await pool.query(`INSERT INTO search_flights SELECT * FROM flights WHERE departure_airport='${from}' AND arrival_airport='${to}' AND DATE(scheduled_departure)='${date}'`); 
        res.json(flights); 
    } catch(err) {
        console.log(err.message); 
    }
}); 

// Get flights requested by user from temp table 
app.get('/flights', async(req, res) => {
    try {
        const flight = await pool.query(`SELECT * FROM search_flights`); 
        res.json(flight.rows); 
    } catch (err) {
        console.log(err.message); 
    }
}); 

// Get price from fare condition 
// Retrieve fare condition from front end
// Use fare condition to query database and get the price 
app.post('/fare', async(req, res) => {
    let fare_condition = req.body.fare; 
    try {
        const price = await pool.query(`SELECT price FROM class WHERE fare_conditions='${fare_condition}'`);
        res.json(price.rows[0].price);
    } catch (err) {
        console.log(err.message); 
    }
})

// Get most recent booking
app.get('/booking', async(req, res) => {
    try {
        const flight = await pool.query(`SELECT * FROM bookings LIMIT 1`); 
        res.json(flight.rows); 
    } catch (err) {
        console.log(err.message); 
    }
}); 

// global.ticket_number = 1000000000000; 
// // 4 or 3 letters in the front for book ref
// global.book_ref = 100000; 
// global.passenger_id = 1000000000; 

// Check if there are seats available on flight and update bookings table
app.post('/booking', async(req, res) => {
    let total_amount = req.body.total; 
    const client = await pool.connect(); 
    try {
        try {
            await client.query('BEGIN'); 

            const bookings = await client.query(`SELECT * from bookings`); 
            const current_bookings = bookings.rows; 
            // There is nothing in bookings - generate a new booking reference
            if (current_bookings == "") {
                let book_ref = "AAA100"; 
                client.query(`INSERT INTO bookings VALUES ('${book_ref}', CURRENT_TIMESTAMP, ${total_amount})`); 
            }
            // Get the most recent book_ref and increment it to create a new, unique book_ref
            else {
                const find_book_ref = await client.query(`SELECT book_ref FROM bookings ORDER BY book_date DESC LIMIT 1`); 
                const last_book_ref = find_book_ref.rows[0].book_ref; 
                let increment_this = parseInt(last_book_ref.substring(3,6)); 
                increment_this++; 
                let book_ref = "AAA" + increment_this; 
                client.query(`INSERT INTO bookings VALUES ('${book_ref}', CURRENT_TIMESTAMP, ${total_amount})`); 
            }
            client.query('COMMIT'); 
            res.json("Success"); 
        } catch (err) {
            client.query('ROLLBACK');
        }
    } finally {
        client.release(); 
    }
});

// TRIXIE - this function doesn't work because we don't have ticket_status to insert into the ticket table
// Insert a new record in ticket table and ticket_flights table
app.post('/confirmbooking', async(req, res) => {
    let flight_id = req.body.flight_id; 
    let name = req.body.name; 
    let email = req.body.email; 
    let phone = req.body.phone; 
    let fare_condition = req.body.fare; 
    let bags = req.body.bags; 
    let bag_price = bags * 50; 
    const client = await pool.connect();  
    try {
        try {
            await client.query('BEGIN'); 
            const find_book_ref = await client.query(`SELECT book_ref FROM bookings ORDER BY book_date DESC LIMIT 1`);
            const last_book_ref = find_book_ref.rows[0].book_ref;  
            const seats = await client.query(`SELECT seat_available FROM flights WHERE flight_id='${flight_id}'`);
            const seats_available = seats.rows[0].seat_available; 
            // Book seats
            if (seats_available > 0) {
                const ticket = await client.query(`SELECT * FROM ticket`); 
                const current_ticket = ticket.rows; 
                if (current_ticket == "") {
                    let ticket_number = 1000000000000;
                    let passenger_id = 1000000000; 
                    let check_bag_no = 200000000000000; 
                    client.query(`INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')`); 
                    client.query(`INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})`); 
                    client.query(`INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Booked', ${passenger_id}, ${check_bag_no})`);
                    client.query(`INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')`); 
                    client.query(`UPDATE flights SET seat_available = seat_available - 1 WHERE flight_id='${flight_id}'`); 
                }
                else {
                    const find_ticket_number = await client.query(`SELECT ticket_no FROM ticket ORDER BY ticket_no DESC LIMIT 1`); 
                    const last_ticket_number = parseInt(find_ticket_number.rows[0].ticket_no); 
                    let ticket_number = last_ticket_number + 1; 
                    const find_passenger_id = await client.query(`SELECT passenger_id FROM passenger_info ORDER BY passenger_id DESC LIMIT 1`); 
                    const last_passenger_id = parseInt(find_passenger_id.rows[0].passenger_id); 
                    let passenger_id = last_passenger_id + 1; 
                    const find_check_bag_no = await client.query(`SELECT check_bag_no FROM check_bag ORDER BY check_bag_no DESC LIMIT 1`); 
                    const last_check_bag_no = parseInt(find_check_bag_no.rows[0].check_bag_no); 
                    let check_bag_no = last_check_bag_no + 1; 
                    client.query(`INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')`); 
                    client.query(`INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})`); 
                    client.query(`INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Booked', ${passenger_id}, ${check_bag_no})`);
                    client.query(`INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')`); 
                    client.query(`UPDATE flights SET seat_available = seat_available - 1 WHERE flight_id='${flight_id}'`);                     
                }
            }
            // Add seats to waitlist
            else {
                const find_ticket_number = await client.query(`SELECT ticket_no FROM ticket ORDER BY ticket_no DESC LIMIT 1`); 
                const last_ticket_number = parseInt(find_ticket_number.rows[0].ticket_no); 
                let ticket_number = last_ticket_number + 1; 
                const find_passenger_id = await client.query(`SELECT passenger_id FROM passenger_info ORDER BY passenger_id DESC LIMIT 1`); 
                const last_passenger_id = parseInt(find_passenger_id.rows[0].passenger_id); 
                let passenger_id = last_passenger_id + 1; 
                const find_check_bag_no = await client.query(`SELECT check_bag_no FROM check_bag ORDER BY check_bag_no DESC LIMIT 1`); 
                const last_check_bag_no = parseInt(find_check_bag_no.rows[0].check_bag_no); 
                let check_bag_no = last_check_bag_no + 1; 
                client.query(`INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')`); 
                client.query(`INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})`); 
                client.query(`INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Waitlist', ${passenger_id}, ${check_bag_no})`);
                client.query(`INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')`); 
                client.query(`UPDATE flights SET seat_available = seat_available - 1 WHERE flight_id='${flight_id}'`);  
            }
            client.query('COMMIT'); 
            res.json("Success"); 
        } catch (err) {
            client.query('ROLLBACK');
        }
    } finally {
        client.release(); 
    }
})


app.listen(3000, () => {
    console.log("Server listening");
});