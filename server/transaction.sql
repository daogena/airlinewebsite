BEGIN

SELECT *
 from bookings

SELECT book_ref
 FROM bookings
 ORDER BY book_date DESC LIMIT 1

INSERT INTO bookings VALUES ('AAA116', CURRENT_TIMESTAMP, 1200)

COMMIT

BEGIN

SELECT book_ref
 FROM bookings
 ORDER BY book_date DESC LIMIT 1

SELECT seat_id
 FROM seats
 JOIN flights ON flights.flights_aircraft_code=seats.aircraft_code
 WHERE flights.flight_id='TG0020' AND seats.seat_fare_conditions='First Class' AND seats.seat_status='Available'

ROLLBACK

BEGIN

SELECT book_ref
 FROM bookings
 ORDER BY book_date DESC LIMIT 1

SELECT ticket_no
 FROM ticket
 ORDER BY ticket_no DESC LIMIT 1

SELECT passenger_id
 FROM passenger_info
 ORDER BY passenger_id DESC LIMIT 1

SELECT check_bag_no
 FROM check_bag
 ORDER BY check_bag_no DESC LIMIT 1

SELECT payment_no
 FROM payment
 ORDER BY payment_no DESC LIMIT 1

INSERT INTO passenger_info VALUES (1000000015, 'Trixie Nguyen', 'odagnea@gmail.com', '6094323435')

INSERT INTO check_bag VALUES (200000000000024, 0, 0)

INSERT INTO ticket VALUES (1000000000024, 'AAA116', 'Waitlist', 1000000015, 200000000000024)

INSERT INTO ticket_flights VALUES (1000000000024, 'TG0020', 'First Class')

INSERT INTO payment VALUES (15, 1000000000024, 4556211790394467, 1200.00, 0, 0, 0.8, 1200.00)

BEGIN

SELECT book_ref
 FROM bookings
 ORDER BY book_date DESC LIMIT 1

SELECT seat_id
 FROM seats
 JOIN flights ON flights.flights_aircraft_code=seats.aircraft_code
 WHERE flights.flight_id='TG0010' AND seats.seat_fare_conditions='First Class' AND seats.seat_status='Available'

ROLLBACK

BEGIN

SELECT book_ref
 FROM bookings
 ORDER BY book_date DESC LIMIT 1

SELECT ticket_no
 FROM ticket
 ORDER BY ticket_no DESC LIMIT 1

SELECT passenger_id
 FROM passenger_info
 ORDER BY passenger_id DESC LIMIT 1

SELECT check_bag_no
 FROM check_bag
 ORDER BY check_bag_no DESC LIMIT 1

SELECT payment_no
 FROM payment
 ORDER BY payment_no DESC LIMIT 1

INSERT INTO passenger_info VALUES (1000000015, 'Trixie Nguyen', 'odagnea@gmail.com', '6094323435')

INSERT INTO check_bag VALUES (200000000000024, 0, 0)

INSERT INTO ticket VALUES (1000000000024, 'AAA116', 'Waitlist', 1000000015, 200000000000024)

INSERT INTO ticket_flights VALUES (1000000000024, 'TG0010', 'First Class')

INSERT INTO payment VALUES (15, 1000000000024, 4556211790394467, 1200.00, 0, 0, 0.8, 1200.00)

