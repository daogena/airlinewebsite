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
        await pool.query(`DELETE FROM connections`); 
        await pool.query(`INSERT INTO connections SELECT f1.flight_no, f1.departure_airport, f2.departure_airport AS connection, f2.arrival_airport FROM flights f1 LEFT JOIN flights f2 ON f1.arrival_airport = f2.departure_airport WHERE f1.flight_no = f2.flight_no`);
        await pool.query(`INSERT INTO search_flights SELECT * FROM flights WHERE departure_airport='${from}' AND arrival_airport='${to}' AND DATE(scheduled_departure)='${date}'`); 
        const flights = await pool.query(`SELECT * FROM connections WHERE departure_airport='${from}' AND arrival_airport='${to}'`); 
        res.json(flights.rows); 
    } catch(err) {
        console.log(err.message); 
    }
});

app.post('/connectingflights', async(req, res) => {
    let flight_no = req.body.flight_no; 
    let from = req.body.from; 
    try {
        const connect = await pool.query(`SELECT * FROM flights WHERE departure_airport='${from}' AND flight_no=${flight_no}`); 
        res.json(connect.rows); 
    } catch(err) {
        console.log(err.message); 
    }
}); 

app.post('/connectingflight', async(req, res) => {
    let flight_no = req.body.flight_no; 
    try {   
        const flight = await pool.query(`SELECT flight_id from flights WHERE flight_no=${flight_no}`); 
        res.json(flight.rows); 
    } catch(err) {
        console.log(err.message); 
    }
})

// Get individual flight by flight_id
app.post('/flight', async(req, res) => {
    let flight_id = req.body.flight_id; 
    try {
        const flight = await pool.query(`SELECT * FROM flights WHERE flight_id='${flight_id}'`); 
        res.json(flight.rows); 
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

app.post('/seat', async(req, res) => {
    let seatid = req.body.seatid; 
    try {
        const seat = await pool.query(`SELECT seat_no FROM seats WHERE seat_id=${seatid}`); 
        res.json(seat.rows); 
    } catch (err) {
        console.log(err.message); 
    }
});

app.post('/boarding', async(req, res) => {
    let fare_condition = req.body.fare; 
    try {
        const group = await pool.query(`SELECT group_no FROM class WHERE fare_conditions='${fare_condition}'`); 
        res.json(group.rows); 
    } catch (err) {
        console.log(err.message); 
    }
})

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
});

// Get most recent booking
app.get('/booking', async(req, res) => {
    try {
        const flight = await pool.query(`SELECT * FROM bookings LIMIT 1`); 
        res.json(flight.rows); 
    } catch (err) {
        console.log(err.message); 
    }
}); 

// Update bookings table
app.post('/booking', async(req, res) => {
    let total_amount = req.body.total; 
    let book_ref; 
    const client = await pool.connect(); 
    try {
        try {
            await client.query('BEGIN'); 
            const bookings = await client.query(`SELECT * from bookings`); 
            const current_bookings = bookings.rows; 
            // There is nothing in bookings - generate a new booking reference
            if (current_bookings == "") {
                book_ref = "AAA100"; 
                client.query(`INSERT INTO bookings VALUES ('${book_ref}', CURRENT_TIMESTAMP, ${total_amount})`); 
            }
            // Get the most recent book_ref and increment it to create a new, unique book_ref
            else {
                const find_book_ref = await client.query(`SELECT book_ref FROM bookings ORDER BY book_date DESC LIMIT 1`); 
                const last_book_ref = find_book_ref.rows[0].book_ref; 
                let increment_this = parseInt(last_book_ref.substring(3,6)); 
                increment_this++; 
                book_ref = "AAA" + increment_this; 
                client.query(`INSERT INTO bookings VALUES ('${book_ref}', CURRENT_TIMESTAMP, ${total_amount})`); 
            }
            client.query('COMMIT'); 
            let body = {
                book_ref: book_ref
            };
            res.json(body); 
        } catch (err) {
            client.query('ROLLBACK');
        }
    } finally {
        client.release(); 
    }
});

// Insert a new record in ticket table and ticket_flights table
app.post('/confirmbooking', async(req, res) => {
    let flight_id = req.body.flight_id; 
    let name = req.body.name; 
    let email = req.body.email; 
    let phone = req.body.phone; 
    let fare_condition = req.body.fare; 
    let bags = req.body.bags; 
    let card_no = req.body.card_no; 
    let ticket_price = req.body.ticket_price; 
    let discount = req.body.discount; 
    let tax = 0.8; 
    let total = ticket_price; 
    let bag_price = bags * 50; 
    let connection = req.body.connection; 

    let ticket_number; 
    let seat_no; 
    let wait; 
    const client = await pool.connect();  
    try {
        try {
            await client.query('BEGIN'); 
            const find_book_ref = await client.query(`SELECT book_ref FROM bookings ORDER BY book_date DESC LIMIT 1`);
            const last_book_ref = find_book_ref.rows[0].book_ref;  
            const seat = await client.query(`SELECT seat_id FROM seats JOIN flights ON flights.flights_aircraft_code=seats.aircraft_code WHERE flights.flight_id='${flight_id}' AND seats.seat_fare_conditions='${fare_condition}' and seats.seat_status='Available'`); 
            const seat_available = seat.rows[0].seat_id;  
            const seat_no_available = await client.query(`SELECT seat_no FROM seats WHERE seat_id='${seat_available}'`); 
            seat_no = seat_no_available.rows[0].seat_no; 
            // Book seats
            if (seat_available != "") {
                const ticket = await client.query(`SELECT * FROM ticket`); 
                const current_ticket = ticket.rows; 
                if (current_ticket == "") {
                    ticket_number = 1000000000000;
                    let passenger_id = 1000000000; 
                    let check_bag_no = 200000000000000; 
                    let payment_no = 1; 
                    let boarding_no = 1; 
                    wait = "no"; 
                    client.query(`INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')`); 
                    client.query(`INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})`); 
                    client.query(`INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Booked', ${passenger_id}, ${check_bag_no})`);
                    client.query(`INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')`); 
                    client.query(`UPDATE flights SET seat_available = seat_available - 1 WHERE flight_id='${flight_id}'`); 
                    client.query(`UPDATE seats SET seat_status='Booked' WHERE seat_id='${seat_available}'`); 
                    client.query(`INSERT INTO payment VALUES (${payment_no}, ${ticket_number}, ${card_no}, ${ticket_price}, ${bags}, ${discount}, ${tax}, ${total})`); 
                    client.query(`INSERT INTO boarding_passes VALUES (${boarding_no}, ${ticket_number}, '${flight_id}', (SELECT seat_no FROM seats WHERE seat_id=${seat_available}), ((SELECT scheduled_departure FROM flights WHERE flight_id='${flight_id}') - INTERVAL '30 MIN'))`); 
                }
                else if (connection == "yes") {
                    wait = "no"; 
                    const find_ticket_number = await client.query(`SELECT ticket_no FROM ticket ORDER BY ticket_no DESC LIMIT 1`); 
                    const last_ticket_number = parseInt(find_ticket_number.rows[0].ticket_no); 
                    ticket_number = last_ticket_number + 1;  
                    const find_passenger_id = await client.query(`SELECT passenger_id FROM passenger_info ORDER BY passenger_id DESC LIMIT 1`); 
                    const last_passenger_id = parseInt(find_passenger_id.rows[0].passenger_id); 
                    let passenger_id = last_passenger_id; 

                    const find_check_bag_no = await client.query(`SELECT check_bag_no FROM check_bag ORDER BY check_bag_no DESC LIMIT 1`); 
                    const last_check_bag_no = parseInt(find_check_bag_no.rows[0].check_bag_no); 
                    let check_bag_no = last_check_bag_no + 1; 
                    const find_boarding_no = await client.query(`SELECT boarding_no FROM boarding_passes ORDER BY boarding_no DESC LIMIT 1`); 
                    const last_boarding_no = parseInt(find_boarding_no.rows[0].boarding_no); 
                    let boarding_no = last_boarding_no + 1;  
                    client.query(`INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})`); 
                    client.query(`INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Booked', ${passenger_id}, ${check_bag_no})`);
                    client.query(`INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')`); 
                    client.query(`UPDATE flights SET seat_available = seat_available - 1 WHERE flight_id='${flight_id}'`);
                    client.query(`UPDATE seats SET seat_status='Booked' WHERE seat_id='${seat_available}'`);
                    client.query(`INSERT INTO boarding_passes VALUES (${boarding_no}, ${ticket_number}, '${flight_id}', (SELECT seat_no FROM seats WHERE seat_id=${seat_available}), ((SELECT scheduled_departure FROM flights WHERE flight_id='${flight_id}') - INTERVAL '30 MIN'))`); 
                }
                else {
                    const find_ticket_number = await client.query(`SELECT ticket_no FROM ticket ORDER BY ticket_no DESC LIMIT 1`); 
                    const last_ticket_number = parseInt(find_ticket_number.rows[0].ticket_no); 
                    ticket_number = last_ticket_number + 1;  
                    const find_passenger_id = await client.query(`SELECT passenger_id FROM passenger_info ORDER BY passenger_id DESC LIMIT 1`); 
                    const last_passenger_id = parseInt(find_passenger_id.rows[0].passenger_id); 
                    let passenger_id = last_passenger_id + 1; 

                    const find_check_bag_no = await client.query(`SELECT check_bag_no FROM check_bag ORDER BY check_bag_no DESC LIMIT 1`); 
                    const last_check_bag_no = parseInt(find_check_bag_no.rows[0].check_bag_no); 
                    let check_bag_no = last_check_bag_no + 1; 
                    const find_payment_no = await client.query(`SELECT payment_no FROM payment ORDER BY payment_no DESC LIMIT 1`); 
                    const last_payment_no = parseInt(find_payment_no.rows[0].payment_no); 
                    let payment_no = last_payment_no + 1;
                    const find_boarding_no = await client.query(`SELECT boarding_no FROM boarding_passes ORDER BY boarding_no DESC LIMIT 1`); 
                    const last_boarding_no = parseInt(find_boarding_no.rows[0].boarding_no); 
                    let boarding_no = last_boarding_no + 1;  
                    client.query(`INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')`); 
                    client.query(`INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})`); 
                    client.query(`INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Booked', ${passenger_id}, ${check_bag_no})`);
                    client.query(`INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')`); 
                    client.query(`UPDATE flights SET seat_available = seat_available - 1 WHERE flight_id='${flight_id}'`);
                    client.query(`UPDATE seats SET seat_status='Booked' WHERE seat_id='${seat_available}'`);
                    client.query(`INSERT INTO payment VALUES (${payment_no}, ${ticket_number}, ${card_no}, ${ticket_price}, ${bags}, ${discount}, ${tax}, ${total})`); 
                    client.query(`INSERT INTO boarding_passes VALUES (${boarding_no}, ${ticket_number}, '${flight_id}', (SELECT seat_no FROM seats WHERE seat_id=${seat_available}), ((SELECT scheduled_departure FROM flights WHERE flight_id='${flight_id}') - INTERVAL '30 MIN'))`);                  
                }
            }
            // Add seats to waitlist
            else {
                const find_ticket_number = await client.query(`SELECT ticket_no FROM ticket ORDER BY ticket_no DESC LIMIT 1`); 
                const last_ticket_number = parseInt(find_ticket_number.rows[0].ticket_no); 
                ticket_number = last_ticket_number + 1; 
                const find_passenger_id = await client.query(`SELECT passenger_id FROM passenger_info ORDER BY passenger_id DESC LIMIT 1`); 
                const last_passenger_id = parseInt(find_passenger_id.rows[0].passenger_id); 
                let passenger_id = last_passenger_id + 1; 
                const find_check_bag_no = await client.query(`SELECT check_bag_no FROM check_bag ORDER BY check_bag_no DESC LIMIT 1`); 
                const last_check_bag_no = parseInt(find_check_bag_no.rows[0].check_bag_no); 
                let check_bag_no = last_check_bag_no + 1; 
                const find_payment_no = await client.query(`SELECT payment_no FROM payment ORDER BY payment_no DESC LIMIT 1`); 
                const last_payment_no = parseInt(find_payment_no.rows[0].payment_no); 
                let payment_no = last_payment_no + 1; 
                wait = "yes"; 
                client.query(`INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')`); 
                client.query(`INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})`); 
                client.query(`INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Waitlist', ${passenger_id}, ${check_bag_no})`);
                client.query(`INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')`);  
                client.query(`INSERT INTO payment VALUES (${payment_no}, ${ticket_number}, ${card_no}, ${ticket_price}, ${bags}, ${discount}, ${tax}, ${total})`);
            }
            client.query('COMMIT'); 
            let body = {
                seat_available: seat_no, 
                ticket_number: ticket_number, 
                wait: wait
            };
            res.json(body); 
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