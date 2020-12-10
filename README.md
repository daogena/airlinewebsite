Put make_airline_sql.sql in your server and run it using Postgres: \i make_airline_sql.sql.

Type in your username and password into password.txt with username on the first line and password on the second line. No spaces. Save.

Open server folder in terminal. 

Run command npm install. This should install dependencies. If not, go to package.json and look at dependencies. Install them individually: 

npm install cors

npm install express --save

npm install --save-dev nodemon

npm install pg 

Run command nodemon app.js. This starts the server. 

Right click airlineweb.html and click Copy Path. Paste this into Google Chrome. 

Now you can book a flight!
