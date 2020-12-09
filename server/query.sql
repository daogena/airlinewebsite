DROP TABLE search_flights

DROP TABLE connections

SELECT f1.flight_no, f1.departure_airport, f2.departure_airport AS connection, f2.arrival_airport INTO TABLE connections
 FROM flights f1
 LEFT JOIN flights f2 ON f1.arrival_airport = f2.departure_airport
 WHERE f1.flight_no = f2.flight_no

SELECT * INTO TABLE search_flights
 FROM flights
 WHERE departure_airport='IAH' AND arrival_airport='JFK' AND DATE(scheduled_departure)='2020-12-10'

SELECT *
 FROM connections
 WHERE departure_airport='IAH' AND arrival_airport='JFK'

SELECT *
 FROM flights
 WHERE departure_airport='IAH' AND flight_no=100001

SELECT *
 FROM flights
 WHERE departure_airport='MDW' AND flight_no=100001

SELECT *
 FROM search_flights

SELECT price
 FROM class
 WHERE fare_conditions='First Class'

SELECT flight_id
 from flights
 WHERE flight_no=100001

SELECT *
 FROM flights
 WHERE flight_id='TG0020'

SELECT group_no
 FROM class
 WHERE fare_conditions='First Class'

SELECT *
 FROM flights
 WHERE flight_id='TG0010'

SELECT group_no
 FROM class
 WHERE fare_conditions='First Class'

