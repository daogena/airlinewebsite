BEGIN

SELECT * from bookings

SELECT book_ref FROM bookings ORDER BY book_date DESC LIMIT 1

INSERT INTO bookings VALUES ('AAA105', CURRENT_TIMESTAMP, 1250)

COMMIT

BEGIN

SELECT book_ref FROM bookings ORDER BY book_date DESC LIMIT 1

SELECT seat_id FROM seats JOIN flights ON flights.flights_aircraft_code=seats.aircraft_code WHERE flights.flight_id='TG0020' AND seats.seat_fare_conditions='Economy' and seats.seat_status='Available'

SELECT seat_no FROM seats WHERE seat_id='35'

SELECT * FROM ticket

SELECT ticket_no FROM ticket ORDER BY ticket_no DESC LIMIT 1

SELECT passenger_id FROM passenger_info ORDER BY passenger_id DESC LIMIT 1

SELECT check_bag_no FROM check_bag ORDER BY check_bag_no DESC LIMIT 1

SELECT boarding_no FROM boarding_passes ORDER BY boarding_no DESC LIMIT 1

INSERT INTO check_bag VALUES (200000000000018, 1, 50)

INSERT INTO ticket VALUES (1000000000018, 'AAA105', 'Booked', 1000000010, 200000000000018)

INSERT INTO ticket_flights VALUES (1000000000018, 'TG0020', 'Economy')

UPDATE flights SET seat_available = seat_available - 1 WHERE flight_id='TG0020'

UPDATE seats SET seat_status='Booked' WHERE seat_id='35'

INSERT INTO boarding_passes VALUES (19, 1000000000018, 'TG0020', (SELECT seat_no FROM seats WHERE seat_id=35), ((SELECT scheduled_departure FROM flights WHERE flight_id='TG0020') - INTERVAL '30 MIN'))

COMMIT

BEGIN

SELECT book_ref FROM bookings ORDER BY book_date DESC LIMIT 1

SELECT seat_id FROM seats JOIN flights ON flights.flights_aircraft_code=seats.aircraft_code WHERE flights.flight_id='TG0010' AND seats.seat_fare_conditions='Economy' and seats.seat_status='Available'

SELECT seat_no FROM seats WHERE seat_id='17'

SELECT * FROM ticket

SELECT ticket_no FROM ticket ORDER BY ticket_no DESC LIMIT 1

SELECT passenger_id FROM passenger_info ORDER BY passenger_id DESC LIMIT 1

SELECT check_bag_no FROM check_bag ORDER BY check_bag_no DESC LIMIT 1

SELECT payment_no FROM payment ORDER BY payment_no DESC LIMIT 1

SELECT boarding_no FROM boarding_passes ORDER BY boarding_no DESC LIMIT 1

INSERT INTO passenger_info VALUES (1000000011, 'Gena Dao', 'daogena@gmail.com', '6094323435')

INSERT INTO check_bag VALUES (200000000000019, 1, 50)

INSERT INTO ticket VALUES (1000000000019, 'AAA105', 'Booked', 1000000011, 200000000000019)

INSERT INTO ticket_flights VALUES (1000000000019, 'TG0010', 'Economy')

UPDATE flights SET seat_available = seat_available - 1 WHERE flight_id='TG0010'

UPDATE seats SET seat_status='Booked' WHERE seat_id='17'

INSERT INTO payment VALUES (12, 1000000000019, 4556596459858657, 150.00, 1, 0, 0.8, 150.00)

INSERT INTO boarding_passes VALUES (20, 1000000000019, 'TG0010', (SELECT seat_no FROM seats WHERE seat_id=17), ((SELECT scheduled_departure FROM flights WHERE flight_id='TG0010') - INTERVAL '30 MIN'))

COMMIT

