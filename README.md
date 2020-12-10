Put make_airline_sql.sql in your server and run it using Postgres: \i make_airline_sql.sql.


Type in your username and password into password.txt with username on the first line and password on the second line. No spaces. Save.


Open server folder in terminal. If you're using Visual Studio Code, right click the server folder and click Open in Integrated Terminal. 


Run command npm install. This should install dependencies. If not, go to package.json and look at dependencies. Install them individually: 

npm install cors

npm install express --save

npm install --save-dev nodemon

npm install pg 

Or you can access this link if you're having trouble: 

https://www.youtube.com/watch?v=eauREi0vwB0&fbclid=IwAR1dSTPF_K_f-oiKTHdrR92Dw1BelaIJqOjz2IfSQ6qpjt9lpDtfksd2avg


Run command nodemon app.js. This starts the server. 


Right click airlineweb.html and click Copy Path. Paste this into Google Chrome. 


Now you can book a flight!

This is the list of flights we have in the database, so choose from this list: 

https://docs.google.com/spreadsheets/d/10MW60MhF_okBsf8vNaF4m9mKCl3F--yl8NCV0C8rBsk/edit?fbclid=IwAR1bX4-sGMI_-PFtZY3oo0m2EOMVpmbqTSk38Qj0Smu76yC5KjZyaZg-2SU#gid=0

