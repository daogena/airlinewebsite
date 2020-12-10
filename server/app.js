const express = require('express'); 
const app = express(); 
const cors = require('cors'); 
const pool = require('./db'); 
const fs = require('fs'); 

let querysql = 'query.sql'; 
let transactionsql = 'transaction.sql'; 

app.use(cors()); 
app.use(express.json()); 

// Insert flights requested by user into temp table
app.post('/flights', async(req, res) => {
    let from = req.body.from; 
    let to = req.body.to; 
    let date = req.body.date;
    
    fs.writeFile(querysql, "", function (err) {
        if (err) throw err;
    });
    fs.writeFile(transactionsql, "", function (err) {
        if (err) throw err;
    });
    
    try {
        let queryData = ""; 
        
        let query = `DROP TABLE IF EXISTS search_flights\n\n`; 
        await pool.query(query); 
        queryData += query; 

        query = `DROP TABLE IF EXISTS connections\n\n`; 
        await pool.query(query); 
        queryData += query; 

        query = `SELECT f1.flight_no, f1.departure_airport, f2.departure_airport AS connection, f2.arrival_airport INTO TABLE connections\n FROM flights f1\n LEFT JOIN flights f2 ON f1.arrival_airport = f2.departure_airport\n WHERE f1.flight_no = f2.flight_no\n\n`; 
        await pool.query(query);
        queryData += query; 

        query = `SELECT * INTO TABLE search_flights\n FROM flights\n WHERE departure_airport='${from}' AND arrival_airport='${to}' AND DATE(scheduled_departure)='${date}'\n\n`; 
        await pool.query(query); 
        queryData += query; 

        query = `SELECT *\n FROM connections\n WHERE departure_airport='${from}' AND arrival_airport='${to}'\n\n`; 
        const flights = await pool.query(query); 
        queryData += query; 

        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        });
        res.json(flights.rows); 
    } catch(err) {
        console.log(err.message); 
    }
});

app.post('/connectingflights', async(req, res) => {
    let flight_no = req.body.flight_no; 
    let from = req.body.from; 
    try {
        let queryData = ""; 
        let query = `SELECT *\n FROM flights\n WHERE departure_airport='${from}' AND flight_no=${flight_no}\n\n`;
        const connect = await pool.query(query); 
        queryData += query; 

        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        });

        res.json(connect.rows); 
    } catch(err) {
        console.log(err.message); 
    }
}); 

app.post('/connectingflight', async(req, res) => {
    let flight_no = req.body.flight_no; 
    try {   
        let queryData = ""; 
        let query = `SELECT flight_id\n from flights\n WHERE flight_no=${flight_no}\n\n`; 
        const flight = await pool.query(query); 
        queryData += query;
        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        }); 
        res.json(flight.rows); 
    } catch(err) {
        console.log(err.message); 
    }
})

// Get individual flight by flight_id
app.post('/flight', async(req, res) => {
    let flight_id = req.body.flight_id; 
    try {
        let queryData = ""; 
        let query = `SELECT *\n FROM flights\n WHERE flight_id='${flight_id}'\n\n`; 
        const flight = await pool.query(query);
        queryData += query; 
        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        });  
        res.json(flight.rows); 
    } catch(err) {
        console.log(err.message); 
    }
});

// Get flights requested by user from temp table 
app.get('/flights', async(req, res) => {
    try {
        let queryData = ""; 
        let query = `SELECT *\n FROM search_flights\n\n`; 
        const flight = await pool.query(query); 
        queryData += query; 
        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        }); 
        res.json(flight.rows); 
    } catch (err) {
        console.log(err.message); 
    }
}); 

app.post('/seat', async(req, res) => {
    let seatid = req.body.seatid; 
    try {
        let queryData = ""; 
        let query = `SELECT seat_no\n FROM seats\n WHERE seat_id=${seatid}\n\n`; 
        const seat = await pool.query(query); 
        queryData += query; 
        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        }); 
        res.json(seat.rows); 
    } catch (err) {
        console.log(err.message); 
    }
});

app.post('/boarding', async(req, res) => {
    let fare_condition = req.body.fare; 
    try {
        let queryData = ""; 
        let query = `SELECT group_no\n FROM class\n WHERE fare_conditions='${fare_condition}'\n\n`; 
        const group = await pool.query(query);
        queryData += query; 
        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        });  
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
        let queryData = ""; 
        let query = `SELECT price\n FROM class\n WHERE fare_conditions='${fare_condition}'\n\n`; 
        const price = await pool.query(query);
        queryData += query;
        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        });  
        res.json(price.rows[0].price);
    } catch (err) {
        console.log(err.message); 
    }
});

// Get most recent booking
app.get('/booking', async(req, res) => {
    try {
        let queryData = ""; 
        let query = `SELECT *\n FROM bookings LIMIT 1\n\n`; 
        const flight = await pool.query(query); 
        queryData += query; 
        fs.appendFile(querysql, queryData, function (err) {
            if (err) throw err;
        }); 
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
    let queryData = ""; 
    let query; 
    try {
        try {
            query = 'BEGIN\n\n'; 
            await client.query(query); 
            queryData += query; 

            query = `SELECT *\n from bookings\n\n` 
            const bookings = await client.query(query); 
            queryData += query; 

            const current_bookings = bookings.rows; 
            // There is nothing in bookings - generate a new booking reference
            if (current_bookings == "") {
                book_ref = "AAA100"; 
                query = `INSERT INTO bookings VALUES ('${book_ref}', CURRENT_TIMESTAMP, ${total_amount})\n\n`; 
                client.query(query); 
                queryData += query; 
            }
            // Get the most recent book_ref and increment it to create a new, unique book_ref
            else {
                query = `SELECT book_ref\n FROM bookings\n ORDER BY book_date DESC LIMIT 1\n\n`; 
                const find_book_ref = await client.query(query); 
                queryData += query; 
                const last_book_ref = find_book_ref.rows[0].book_ref; 
                let increment_this = parseInt(last_book_ref.substring(3,6)); 
                increment_this++; 
                book_ref = "AAA" + increment_this; 
                query = `INSERT INTO bookings VALUES ('${book_ref}', CURRENT_TIMESTAMP, ${total_amount})\n\n`; 
                client.query(query); 
                queryData += query; 
            }
            query = 'COMMIT\n\n'; 
            client.query(query); 
            queryData += query; 
            let body = {
                book_ref: book_ref
            };
            res.json(body); 
        } catch (err) {
            query = 'ROLLBACK\n\n'; 
            client.query(query);
            queryData += query; 
        }
        fs.appendFile(transactionsql, queryData, function (err) {
            if (err) throw err;
        }); 
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
    let queryData = ""; 
    let query; 
    try {
        try {
            query = 'BEGIN\n\n'; 
            await client.query(query); 
            queryData += query; 

            query = `SELECT book_ref\n FROM bookings\n ORDER BY book_date DESC LIMIT 1\n\n`; 
            const find_book_ref = await client.query(query);
            queryData += query ;

            const last_book_ref = find_book_ref.rows[0].book_ref;  
            query = `SELECT seat_id\n FROM seats\n JOIN flights ON flights.flights_aircraft_code=seats.aircraft_code\n WHERE flights.flight_id='${flight_id}' AND seats.seat_fare_conditions='${fare_condition}' AND seats.seat_status='Available'\n\n`; 
            const seat = await client.query(query); 
            queryData += query; 

            const seat_available = seat.rows[0].seat_id;  
            query = `SELECT seat_no\n FROM seats\n WHERE seat_id='${seat_available}'\n\n`; 
            const seat_no_available = await client.query(query); 
            queryData += query; 

            seat_no = seat_no_available.rows[0].seat_no; 
            // Book seats
            if (seat_available != "") {
                query = `SELECT *\n FROM ticket\n\n`; 
                const ticket = await client.query(query); 
                queryData += query; 

                const current_ticket = ticket.rows; 
                if (current_ticket == "") {
                    ticket_number = 1000000000000;
                    let passenger_id = 1000000000; 
                    let check_bag_no = 200000000000000; 
                    let payment_no = 1; 
                    let boarding_no = 1; 
                    wait = "no"; 
                    query = `INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Booked', ${passenger_id}, ${check_bag_no})\n\n`; 
                    client.query(query);
                    queryData += query; 

                    query = `INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `UPDATE flights\n SET seat_available = seat_available - 1\n WHERE flight_id='${flight_id}'\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `UPDATE seats\n SET seat_status='Booked'\n WHERE seat_id='${seat_available}'\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `INSERT INTO payment VALUES (${payment_no}, ${ticket_number}, ${card_no}, ${ticket_price}, ${bags}, ${discount}, ${tax}, ${total})\n\n`; 
                    client.query(query);
                    queryData += query; 
                    
                    query = `INSERT INTO boarding_passes VALUES (${boarding_no}, ${ticket_number}, '${flight_id}',\n (SELECT seat_no\n FROM seats\n WHERE seat_id=${seat_available}),\n ((SELECT scheduled_departure\n FROM flights\n WHERE flight_id='${flight_id}') - INTERVAL '30 MIN'))\n\n`;
                    client.query(query); 
                    queryData += query; 
                }
                else if (connection == "yes") {
                    wait = "no"; 
                    query = `SELECT ticket_no\n FROM ticket\n ORDER BY ticket_no DESC LIMIT 1\n\n`; 
                    const find_ticket_number = await client.query(query); 
                    queryData += query; 

                    const last_ticket_number = parseInt(find_ticket_number.rows[0].ticket_no); 
                    ticket_number = last_ticket_number + 1;  
                    query = `SELECT passenger_id\n FROM passenger_info\n ORDER BY passenger_id DESC LIMIT 1\n\n`; 
                    const find_passenger_id = await client.query(query); 
                    queryData += query; 
                    const last_passenger_id = parseInt(find_passenger_id.rows[0].passenger_id); 
                    let passenger_id = last_passenger_id; 

                    query = `SELECT check_bag_no\n FROM check_bag\n ORDER BY check_bag_no DESC LIMIT 1\n\n`; 
                    const find_check_bag_no = await client.query(query); 
                    queryData += query; 

                    const last_check_bag_no = parseInt(find_check_bag_no.rows[0].check_bag_no); 
                    let check_bag_no = last_check_bag_no + 1; 

                    query = `SELECT boarding_no\n FROM boarding_passes\n ORDER BY boarding_no DESC LIMIT 1\n\n`; 
                    const find_boarding_no = await client.query(query); 
                    queryData += query; 

                    const last_boarding_no = parseInt(find_boarding_no.rows[0].boarding_no); 
                    let boarding_no = last_boarding_no + 1;  
                    query = `INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Booked', ${passenger_id}, ${check_bag_no})\n\n`; 
                    client.query(query);
                    queryData += query; 

                    query = `INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `UPDATE flights\n SET seat_available = seat_available - 1\n WHERE flight_id='${flight_id}'\n\n`; 
                    client.query(query);
                    queryData += query; 

                    query = `UPDATE seats\n SET seat_status='Booked'\n WHERE seat_id='${seat_available}'\n\n`; 
                    client.query(query);
                    queryData += query; 

                    query = `INSERT INTO boarding_passes VALUES (${boarding_no}, ${ticket_number}, '${flight_id}',\n (SELECT seat_no\n FROM seats\n WHERE seat_id=${seat_available}),\n ((SELECT scheduled_departure\n FROM flights\n WHERE flight_id='${flight_id}') - INTERVAL '30 MIN'))\n\n`; 
                    client.query(query); 
                    queryData += query; 
                }
                else {
                    wait = "no"; 
                    query = `SELECT ticket_no\n FROM ticket\n ORDER BY ticket_no DESC LIMIT 1\n\n`; 
                    const find_ticket_number = await client.query(query); 
                    queryData += query; 
                    const last_ticket_number = parseInt(find_ticket_number.rows[0].ticket_no); 
                    ticket_number = last_ticket_number + 1;  

                    query = `SELECT passenger_id\n FROM passenger_info\n ORDER BY passenger_id DESC LIMIT 1\n\n`; 
                    const find_passenger_id = await client.query(query); 
                    queryData += query; 
                    const last_passenger_id = parseInt(find_passenger_id.rows[0].passenger_id); 
                    let passenger_id = last_passenger_id + 1; 

                    query = `SELECT check_bag_no\n FROM check_bag\n ORDER BY check_bag_no DESC LIMIT 1\n\n`; 
                    const find_check_bag_no = await client.query(query);
                    queryData += query;  
                    const last_check_bag_no = parseInt(find_check_bag_no.rows[0].check_bag_no); 
                    let check_bag_no = last_check_bag_no + 1; 
                    query = `SELECT payment_no\n FROM payment\n ORDER BY payment_no DESC LIMIT 1\n\n`; 
                    const find_payment_no = await client.query(query); 
                    queryData += query; 

                    const last_payment_no = parseInt(find_payment_no.rows[0].payment_no); 
                    let payment_no = last_payment_no + 1;
                    query = `SELECT boarding_no\n FROM boarding_passes\n ORDER BY boarding_no DESC LIMIT 1\n\n`; 
                    const find_boarding_no = await client.query(query); 
                    queryData += query; 
                    const last_boarding_no = parseInt(find_boarding_no.rows[0].boarding_no); 
                    let boarding_no = last_boarding_no + 1;  

                    query = `INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')\n\n`; 
                    client.query(query); 
                    queryData += query;

                    query = `INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Booked', ${passenger_id}, ${check_bag_no})\n\n`; 
                    client.query(query);
                    queryData += query; 

                    query = `INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')\n\n`; 
                    client.query(query); 
                    queryData += query; 

                    query = `UPDATE flights\n SET seat_available = seat_available - 1\n WHERE flight_id='${flight_id}'\n\n`; 
                    client.query(query);
                    queryData += query; 

                    query = `UPDATE seats\n SET seat_status='Booked'\n WHERE seat_id='${seat_available}'\n\n`; 
                    client.query(query);
                    queryData += query; 

                    query = `INSERT INTO payment VALUES (${payment_no}, ${ticket_number}, ${card_no}, ${ticket_price}, ${bags}, ${discount}, ${tax}, ${total})\n\n`; 
                    client.query(query);
                    queryData += query; 
                    
                    query = `INSERT INTO boarding_passes VALUES (${boarding_no}, ${ticket_number}, '${flight_id}',\n (SELECT seat_no\n FROM seats\n WHERE seat_id=${seat_available}),\n ((SELECT scheduled_departure\n FROM flights\n WHERE flight_id='${flight_id}') - INTERVAL '30 MIN'))\n\n`;
                    client.query(query);   
                    queryData += query;                
                }
            }
            query = 'COMMIT\n\n';
            client.query(query); 
            queryData += query; 
            let body = {
                seat_available: seat_no, 
                ticket_number: ticket_number, 
                wait: wait
            };
            res.json(body); 
        } catch (err) {
            query = 'ROLLBACK\n\n';
            client.query(query);
            queryData += query; 
            
            console.log(err);
            query = 'BEGIN\n\n'; 
            await client.query(query); 
            queryData += query; 

            query = `SELECT book_ref\n FROM bookings\n ORDER BY book_date DESC LIMIT 1\n\n`; 
            const find_book_ref = await client.query(query);
            queryData += query ;

            const last_book_ref = find_book_ref.rows[0].book_ref; 

            query = `SELECT ticket_no\n FROM ticket\n ORDER BY ticket_no DESC LIMIT 1\n\n`;
            const find_ticket_number = await client.query(query); 
            queryData += query; 
            const last_ticket_number = parseInt(find_ticket_number.rows[0].ticket_no); 
            ticket_number = last_ticket_number + 1; 

            query = `SELECT passenger_id\n FROM passenger_info\n ORDER BY passenger_id DESC LIMIT 1\n\n`;
            const find_passenger_id = await client.query(query); 
            queryData += query; 
            const last_passenger_id = parseInt(find_passenger_id.rows[0].passenger_id); 
            let passenger_id = last_passenger_id + 1; 

            query = `SELECT check_bag_no\n FROM check_bag\n ORDER BY check_bag_no DESC LIMIT 1\n\n`;
            const find_check_bag_no = await client.query(query); 
            queryData += query; 

            const last_check_bag_no = parseInt(find_check_bag_no.rows[0].check_bag_no); 
            let check_bag_no = last_check_bag_no + 1; 
            query = `SELECT payment_no\n FROM payment\n ORDER BY payment_no DESC LIMIT 1\n\n`;
            const find_payment_no = await client.query(query); 
            queryData += query; 
            const last_payment_no = parseInt(find_payment_no.rows[0].payment_no); 
            let payment_no = last_payment_no + 1; 
            wait = "yes"; 

            query = `INSERT INTO passenger_info VALUES (${passenger_id}, '${name}', '${email}', '${phone}')\n\n`;
            client.query(query);
            queryData += query;  

            query = `INSERT INTO check_bag VALUES (${check_bag_no}, ${bags}, ${bag_price})\n\n`;
            client.query(query);
            queryData += query; 

            query = `INSERT INTO ticket VALUES (${ticket_number}, '${last_book_ref}', 'Waitlist', ${passenger_id}, ${check_bag_no})\n\n`;
            client.query(query);
            queryData += query; 

            query = `INSERT INTO ticket_flights VALUES (${ticket_number}, '${flight_id}', '${fare_condition}')\n\n`;
            client.query(query);  
            queryData += query; 

            query = `INSERT INTO payment VALUES (${payment_no}, ${ticket_number}, ${card_no}, ${ticket_price}, ${bags}, ${discount}, ${tax}, ${total})\n\n`;
            client.query(query);
            queryData += query; 
            let body = {
                ticket_number: ticket_number, 
                wait: wait
            };
            res.json(body);  
        }
        fs.appendFile(transactionsql, queryData, function (err) {
            if (err) throw err;
        });
    } finally {
        client.release(); 
    }
})


app.listen(3000, () => {
    console.log("Server listening");
});