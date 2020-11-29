/*Make Airline*/
DROP TABLE IF EXISTS bookings CASCADE;

DROP TABLE IF EXISTS ticket CASCADE;

DROP TABLE IF EXISTS check_bag CASCADE;

DROP TABLE IF EXISTS passenger_info CASCADE;

DROP TABLE IF EXISTS payment CASCADE;

DROP TABLE IF EXISTS boarding_passes CASCADE;

DROP TABLE IF EXISTS ticket_flights CASCADE;

DROP TABLE IF EXISTS flights CASCADE;

DROP TABLE IF EXISTS airport CASCADE;

DROP TABLE IF EXISTS class CASCADE;

DROP TABLE IF EXISTS seats CASCADE;

DROP TABLE IF EXISTS aircraft CASCADE;

/*create aircraft table*/
CREATE TABLE aircraft(
    aircraft_code char(3),
    model char(25),
    RANGE int,
    PRIMARY KEY (aircraft_code)
    /*CONSTRAINT "flights_aircraft_code_fkey" FOREIGN KEY (flights_aircraft_code) REFERENCES aircraft(aircraft_code),*/
    /*CONSTRAINT "seats_aircraft_code_fkey" FOREIGN KEY (aircraft_code) REFERENCES aircraft(aircraft_code) ON DELETE CASCADE*/
);

/*create booking table*/
CREATE TABLE bookings(
    book_ref char(6) NOT NULL,
    book_date timestamp NOT NULL,
    book_total_amount numeric(10,2) NOT NULL,
    PRIMARY KEY (book_ref)
);

/*create airport table*/
CREATE TABLE airport(
    airport_code char(3) NOT NULL,
    airport_name char(42) NOT NULL,
    city char(12) NOT NULL,
    PRIMARY KEY (airport_code)
    
);

/*create class table*/
CREATE TABLE class(
    fare_conditions varchar(15) NOT NULL,
    group_no int UNIQUE NOT NULL,
    price numeric(10,2) NOT NULL,
    PRIMARY KEY (fare_conditions)
);


/*create seats table*/
CREATE TABLE seats(
    seat_id int NOT NULL,
    aircraft_code char(3) NOT NULL,
    seat_no varchar(3) NOT NULL,
    seat_fare_conditions varchar(15) NOT NULL,
    seat_status char(10) NOT NULL,
    movie char(1) NOT NULL,
    meal int NOT NULL,
    PRIMARY KEY (seat_id),
    CONSTRAINT seats_aircraft_code_fkey FOREIGN KEY (aircraft_code) REFERENCES aircraft(aircraft_code) ON DELETE CASCADE,
    CONSTRAINT seats_fare_conditions_fkey FOREIGN KEY (seat_fare_conditions) REFERENCES class(fare_conditions),
    CONSTRAINT seats_fare_conditions_check CHECK (
        (
            (seat_fare_conditions)::text = ANY (
                ARRAY [('First Class'::character varying)::text, ('Business'::character varying)::text, ('Economy'::character varying)::text]
            )
        )
    )
);


/*create flights table*/
CREATE TABLE flights(
    flight_id char(6) NOT NULL,
    flight_no int NOT NULL,
    scheduled_departure timestamp NOT NULL,
    scheduled_arrival timestamp NOT NULL,
    departure_airport char(3) NOT NULL,
    arrival_airport char(3) NOT NULL,
    flight_status varchar(20) NOT NULL,
    flights_aircraft_code char(3) NOT NULL,
    departure_terminal char(1) NOT NULL,
    arrival_terminal char(1) NOT NULL,
    departure_gate char(3) NOT NULL,
    arrival_gate char(3) NOT NULL,
    seat_available int NOT NULL,
    PRIMARY KEY (flight_id), 
    CONSTRAINT flights_departure_airport_fkey FOREIGN KEY (departure_airport) REFERENCES airport(airport_code),
    CONSTRAINT flights_arrival_airport_fkey FOREIGN KEY (arrival_airport) REFERENCES airport(airport_code),
    CONSTRAINT flights_aircraft_code_fkey FOREIGN KEY (flights_aircraft_code) REFERENCES aircraft(aircraft_code),
    CONSTRAINT flights_check CHECK (scheduled_arrival > scheduled_departure)
);

/*create check_bag table*/
CREATE TABLE check_bag(
    check_bag_no varchar(15) NOT NULL,
    check_bag_count int NOT NULL,
    check_bag_price numeric(5,2) NOT NULL,
    PRIMARY KEY (check_bag_no)
);

/*create passenger_info table*/
CREATE TABLE passenger_info(
    passenger_id char(10) NOT NULL,
    passenger_name text NOT NULL,
    email char(50) NOT NULL,
    phone char(15) NOT NULL,
    PRIMARY KEY (passenger_id)
);

/*create ticket table*/
CREATE TABLE ticket(
    ticket_no char(13) NOT NULL,
    ticket_book_ref char(6) NOT NULL,
    ticket_status varchar(12) NOT NULL,
    ticket_passenger_id char(10) NOT NULL,
    ticket_check_bag_no varchar(15) NOT NULL,
    PRIMARY KEY (ticket_no),
    CONSTRAINT ticket_book_ref_fkey FOREIGN KEY (ticket_book_ref) REFERENCES bookings(book_ref),
    CONSTRAINT ticket_passenger_id_fkey FOREIGN KEY (ticket_passenger_id) REFERENCES passenger_info(passenger_id),
    CONSTRAINT ticket_check_bag_no_fkey FOREIGN KEY (ticket_check_bag_no) REFERENCES check_bag(check_bag_no)
);

/*create ticket_flights table*/
CREATE TABLE ticket_flights(
    ticket_no char(13) NOT NULL,
    flight_id char(6) NOT NULL,
    tf_fare_conditions varchar(15) NOT NULL,
    PRIMARY KEY (ticket_no, flight_id),
    CONSTRAINT ticket_flights_ticket_no_fkey FOREIGN KEY (ticket_no) REFERENCES ticket(ticket_no),
    CONSTRAINT ticket_flights_flight_id_fkey FOREIGN KEY (flight_id) REFERENCES flights(flight_id),
    CONSTRAINT ticket_flights_class_fkey FOREIGN KEY (tf_fare_conditions) REFERENCES class(fare_conditions),
    CONSTRAINT seats_fare_conditions_check CHECK (
        (
            (tf_fare_conditions)::text = ANY (
                ARRAY [('First Class'::character varying)::text, ('Business'::character varying)::text, ('Economy'::character varying)::text]
            )
        )
    )
);

/*create boarding_passes table*/
CREATE TABLE boarding_passes(
    boarding_no int NOT NULL,
    bp_ticket_no char(13) NOT NULL,
    bp_flight_id char(6) NOT NULL,
    seat_no varchar(4) NOT NULL,
    boarding_time timestamp NOT NULL,
    PRIMARY KEY (boarding_no),
    CONSTRAINT boarding_passes_bp_ticket_no_flight_id_fkey FOREIGN KEY (bp_ticket_no, bp_flight_id) REFERENCES ticket_flights(ticket_no, flight_id)
);

/*create payment table*/
CREATE TABLE payment(
    payment_no int NOT NULL,
    pmt_ticket_no char(13) NOT NULL,
    card_no char(16) NOT NULL,
    pmt_ticket_price numeric(10,2) NOT NULL,
    check_bag_total numeric(10,2) NOT NULL,
    discount numeric(3,2) NOT NULL,
    tax numeric(3,2) NOT NULL,
    total_payment numeric(10,2) NOT NULL,
    PRIMARY KEY (payment_no),
    CONSTRAINT payment_ticket_no_fkey FOREIGN KEY (pmt_ticket_no) REFERENCES ticket(ticket_no)
);

/*Initialize database*/
/*aircraft*/
INSERT INTO aircraft
VALUES ('773', 'Boeing 777-300', 11100);

INSERT INTO aircraft
VALUES ('763', 'Boeing 767-300', 7900);

/*INSERT INTO aircraft
VALUES ('SU9', 'Boeing 777-300', 5700);

INSERT INTO aircraft
VALUES ('320', 'Boeing 777-300', 6400);

INSERT INTO aircraft
VALUES ('321', 'Boeing 777-300', 6100);*/

/*airport*/
INSERT INTO airport
VALUES (
        'IAH',
        'George Bush Intercontinental Airport',
        'Houston'
    );

INSERT INTO airport
VALUES (
        'DFW',
        'Dallas/Fort Worth International Airport',
        'Dallas'
    );

INSERT INTO airport
VALUES (
        'LAX',
        'Los Angeles International Airport',
        'Los Angeles'
    );

INSERT INTO airport
VALUES (
        'JFK',
        'John F Kennedy International Airport',
        'New York'
    );

INSERT INTO airport
VALUES (
        'MCO',
        'Orlando International Airport',
        'Orlando'
    );

INSERT INTO airport
VALUES (
        'MDW',
        'Chicago International Airport',
        'Chicago'
    );

/*class*/
INSERT INTO class
VALUES ('First Class', 1, 1200.00);

INSERT INTO class
VALUES ('Business', 2, 500.00);

INSERT INTO class
VALUES ('Economy', 3, 150.00);

/*seats*/
INSERT INTO seats
VALUES (
        1,
        '773',
        '01A',
        'First Class',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        2,
        '773',
        '01B',
        'First Class',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        3,
        '773',
        '02A',
        'First Class',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        4,
        '773',
        '02B',
        'First Class',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        5,
        '773',
        '03A',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        6,
        '773',
        '03B',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        7,
        '773',
        '03C',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        8,
        '773',
        '04A',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        9,
        '773',
        '04B',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        10,
        '773',
        '04C',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        11,
        '773',
        '05A',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        12,
        '773',
        '05B',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        13,
        '773',
        '05C',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        14,
        '773',
        '05D',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        15,
        '773',
        '05E',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        16,
        '773',
        '06A',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        17,
        '773',
        '06B',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        18,
        '773',
        '06C',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        19,
        '773',
        '06D',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        20,
        '773',
        '06E',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        21,
        '763',
        '01A',
        'First Class',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        22,
        '763',
        '01B',
        'First Class',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        23,
        '763',
        '02A',
        'First Class',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        24,
        '763',
        '02B',
        'First Class',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        25,
        '763',
        '03A',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        26,
        '763',
        '03B',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        27,
        '763',
        '03C',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        28,
        '763',
        '04A',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        29,
        '763',
        '04B',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        30,
        '763',
        '04C',
        'Business',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        31,
        '763',
        '05A',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        32,
        '763',
        '05B',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        33,
        '763',
        '05C',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        34,
        '763',
        '05D',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        35,
        '763',
        '05E',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        36,
        '763',
        '06A',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        37,
        '763',
        '06B',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        38,
        '763',
        '06C',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        39,
        '763',
        '06D',
        'Economy',
        'Available',
        'Y',
        1
    );

INSERT INTO seats
VALUES (
        40,
        '763',
        '06E',
        'Economy',
        'Available',
        'Y',
        1
    );

/*flights*/
INSERT INTO flights
VALUES (
        'TG0010',
        100001,
        '2020-12-10 08:15:00',
        '2020-12-10 10:45:00',
        'IAH',
        'MDW',
        'Scheduled',
        '773',
        'A',
        'B',
        'A12',
        'B22',
        40
    );

INSERT INTO flights
VALUES (
        'TG0020',
        100001,
        '2020-12-10 11:15:00',
        '2020-12-10 13:15:00',
        'MDW',
        'JFK',
        'Scheduled',
        '763',
        'B',
        'C',
        'B22',
        'C10',
        40
    );

INSERT INTO flights
VALUES (
        'TG0030',
        100002,
        '2021-01-28 09:20:00',
        '2021-01-28 12:40:00',
        'IAH',
        'MDW',
        'Scheduled',
        '773',
        'A',
        'B',
        'A12',
        'B01',
        40
    );

INSERT INTO flights
VALUES (
        'TG0040',
        100003,
        '2021-01-14 10:35:00',
        '2021-01-14 14:10:00',
        'IAH',
        'LAX',
        'Scheduled',
        '763',
        'A',
        'C',
        'A08',
        'C04',
        40
    );

INSERT INTO flights
VALUES (
        'TG0050',
        100004,
        '2020-12-24 11:05:00',
        '2020-12-24 13:30:00',
        'DFW',
        'MCO',
        'Scheduled',
        '773',
        'B',
        'A',
        'B05',
        'A11',
        40
    );

INSERT INTO flights
VALUES (
        'TG0060',
        100004,
        '2020-12-24 14:00:00',
        '2020-12-24 16:25:00',
        'MCO',
        'JFK',
        'Scheduled',
        '763',
        'A',
        'C',
        'A11',
        'C03',
        40
    );

INSERT INTO flights
VALUES (
        'TG0070',
        100005,
        '2021-01-02 12:40:00',
        '2021-01-02 15:05:00',
        'DFW',
        'MCO',
        'Scheduled',
        '773',
        'B',
        'C',
        'B05',
        'C01',
        40
    );

INSERT INTO flights
VALUES (
        'TG0080',
        100006,
        '2020-12-30 07:20:00',
        '2020-12-30 11:40:00',
        'LAX',
        'MDW',
        'Scheduled',
        '773',
        'B',
        'A',
        'B10',
        'A03',
        40
    );

INSERT INTO flights
VALUES (
        'TG0090',
        100006,
        '2020-12-30 13:20:00',
        '2020-12-30 15:25:00',
        'MDW',
        'JFK',
        'Scheduled',
        '763',
        'A',
        'B',
        'A03',
        'B06',
        40
    );

INSERT INTO flights
VALUES (
        'TG0100',
        100007,
        '2020-12-17 15:45:00',
        '2020-12-17 18:10:00',
        'JFK',
        'MDW',
        'Scheduled',
        '773',
        'A',
        'B',
        'A04',
        'B05',
        40
    );

INSERT INTO flights
VALUES (
        'TG0110',
        100007,
        '2020-12-17 19:15:00',
        '2020-12-17 22:00:00',
        'MDW',
        'IAH',
        'Scheduled',
        '763',
        'B',
        'C',
        'B05',
        'C08',
        40
    );

INSERT INTO flights
VALUES (
        'TG0120',
        100008,
        '2021-01-03 09:30:00',
        '2021-01-03 12:05:00',
        'JFK',
        'MDW',
        'Scheduled',
        '773',
        'C',
        'B',
        'C12',
        'B06',
        40
    );

INSERT INTO flights
VALUES (
        'TG0130',
        100008,
        '2021-01-03 13:30:00',
        '2021-01-03 17:30:00',
        'MDW',
        'LAX',
        'Scheduled',
        '763',
        'B',
        'A',
        'B06',
        'A10',
        40
    );

INSERT INTO flights
VALUES (
        'TG0140',
        100009,
        '2021-01-02 16:50:00',
        '2021-01-02 20:00:00',
        'LAX',
        'IAH',
        'Scheduled',
        '773',
        'C',
        'A',
        'C03',
        'A04',
        40
    );

INSERT INTO flights
VALUES (
        'TG0150',
        100010,
        '2021-01-28 17:10:00',
        '2021-01-28 20:20:00',
        'LAX',
        'IAH',
        'Scheduled',
        '763',
        'C',
        'B',
        'C03',
        'B04',
        40
    );

INSERT INTO flights
VALUES (
        'TG0160',
        100011,
        '2021-02-04 18:05:00',
        '2021-02-04 20:30:00',
        'MCO',
        'JFK',
        'Scheduled',
        '763',
        'A',
        'B',
        'A09',
        'B07',
        40
    );

INSERT INTO flights
VALUES (
        'TG0170',
        100012,
        '2021-01-02 08:15:00',
        '2021-01-02 11:00:00',
        'JFK',
        'MCO',
        'Scheduled',
        '773',
        'B',
        'C',
        'B11',
        'C21',
        40
    );

INSERT INTO flights
VALUES (
        'TG0180',
        100012,
        '2021-01-02 12:15:00',
        '2021-01-02 15:15:00',
        'MCO',
        'DFW',
        'Scheduled',
        '763',
        'C',
        'A',
        'C10',
        'A07',
        40
    );

INSERT INTO flights
VALUES (
        'TG0190',
        100013,
        '2021-02-10 13:25:00',
        '2021-02-10 16:05:00',
        'MCO',
        'DFW',
        'Scheduled',
        '763',
        'B',
        'C',
        'B01',
        'C02',
        40
    );

INSERT INTO flights
VALUES (
        'TG0200',
        100014,
        '2021-01-13 15:25:00',
        '2021-01-13 19:05:00',
        'IAH',
        'LAX',
        'Scheduled',
        '773',
        'A',
        'C',
        'B06',
        'C03',
        40
    );