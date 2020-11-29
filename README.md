# airlinewebsite

Fork this repo or you can download it to your computer. 

Open in VSCode. 
Open the terminal in VSCode and type ```npm install```. If npm isn't an available command, refer to this website: https://www.npmjs.com/get-npm

Right click airlineweb.html and click Copy Path. Paste this into Google Chrome. You can do this for any HTML file we have if you want to see what it looks like. 

Right click the server folder and click Open in Integrated Terminal. Type in ```nodemon app.js```. This should start the server and you can see it says "Server listening." 

Right click anywhere on the page and click Inspect. Click on the console tab. This is the console and you can debug by doing writing in the js file ```console.log(ANYTHING YOU WANT)```. 

Things we need to do: 
- I put in global variables (book_ref, ticket_number, passenger_id, etc.) in app.js that is supposed to update after every booking. It doesn't work and if you try to query the db, it'll say something like "book ref already exists." Idk what to do about this yet, but some solutions we can consider: 
  - Query from the bookings table and get the previous book_ref (I've already added an endpoint to do this)
  - Figure out how to use global variables with NodeJS after the page refreshes 
- Please edit the book_ref, ticket_number, passenger_id that I declared to match your database. I just put in these as placeholders so if they don't look like how the variables in your database are supposed to look, you can change them 
- Finish the bookings post endpoint to add a user onto the waitlist 
- If user is on the waitlist, we need to somehow update ticket_status when we "POST" to the database (/confirmbooking endpoint in app.js)
  - Idk where you put the waitlist in the DB so I haven't figured this part out yet 
