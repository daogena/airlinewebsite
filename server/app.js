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

// Get most recent booking
app.get('/booking', async(req, res) => {
    try {
        const flight = await pool.query(`SELECT * FROM bookings LIMIT 1`); 
        res.json(flight.rows); 
    } catch (err) {
        console.log(err.message); 
    }
}); 

global.ticket_number = 1000000000000; 
global.book_ref = 100000; 
global.passenger_id = 1000000000; 

// Check if there are seats available on flight and update bookings table
app.post('/booking', async(req, res) => {
    let flight_id = req.body.flight_id;  
    let total_amount = req.body.total; 
    const client = await pool.connect(); 
    try {
        try {
            await client.query('BEGIN'); 
            const seats = await client.query(`SELECT seat_available FROM flights WHERE flight_id='${flight_id}'`);
            const seats_available = seats.rows[0].seat_available; 
            if (seats_available > 0) {
                client.query(`INSERT INTO bookings VALUES (${book_ref}, CURRENT_TIMESTAMP, ${total_amount})`); 
            }
            // ELSE ADD TO WAITLIST 
            client.query('COMMIT'); 
            res.json("Success"); 
        } catch (err) {
            client.query('ROLLBACK');
        }
    } finally {
        client.release(); 
    }

    book_ref++;  
});

// TRIXIE - this function doesn't work because we don't have ticket_status to insert into the ticket table
// Insert a new record in ticket table and ticket_flights table
app.post('/confirmbooking', async(req, res) => {
    let flight_id = req.body.flight_id; 
    let fare_condition = req.body.fare;  
    let status = req.body.status; 
    oldbook_ref = book_ref - 1;
    const client = await pool.connect();  
    try {
        try {
            await client.query('BEGIN'); 
            client.query(`INSERT INTO ticket VALUES (${ticket_number}, ${oldbook_ref}, ${status}, ${passenger_id})`);
            client.query(`INSERT INTO ticket_flights VALUES (${ticket_number}, ${flight_id}, '${fare_condition}')`); 
            client.query(`UPDATE flights SET seats_available = seats_available - 1 WHERE flight_id=${flight_id}`); 
            client.query('COMMIT'); 
            res.json("Success"); 
        } catch (err) {
            client.query('ROLLBACK');
        }
    } finally {
        client.release(); 
    }
    ticket_number++; 
    passenger_id++; 
})


app.listen(3000, () => {
    console.log("Server listening");
});