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
  - Idk where you put the waitlist in the DB so I haven't figured this part out yet ***I dont have a separate table for waitlist that why added the ticket_status into the ticket table so if someone have to be on a waitlist then we just put "Waitlist" in the database. If that customer ever get a chance to get a ticket after, then we can update the status to "Booked" showing that the customer finally get the ticket. So we will have 2 datas for ticket_status, either "Booked" or "Waitlist".***

********GENA please read this, this is my plan for the booking from start to done, hopefully this help us. I didn't mess with the code yet because I don't know nodejs so you prob need to help me understand the structure more*********
1. Generate book_ref, get current timestamp for book_date, and based on class customer chose and the total number of ticket they want to book we can get the total amount from there. 
    So in app.js -> app.post('/bookings, async(req, res), we only need to update booking table.
2. Then in app.js -> app.post('/confirmbooking', async(req, res)
    +Check if there is any seat available
      -if it is available then we set status variable as 'Booked' (which we need to declare seat_status variable.
      -if it is not avai. then we set status variable as 'Waitlist'
    +Update ticket table and passenger_info table
      -if the customer is able to book the ticket
         +then update check_bag table
         +next, choose a seat for the customer (or we can let he/she/them pick the seat they want), update the seats table which change seat_status from 'Available' to 'Booked'
           *Hence, if we let the customer choose the seat then we need to make sure the seat that appear to the customer on the website is the one that availabe (meaning seat_status in seats table is 'Available')
3. If everything is good(meaning customer can book the ticker he/she/them want)
    +Prompt the customer to enter card number and discount
       -for discount i'm thinking we can just automatically give them about 10-20% discount if they book the Business class seat because I think if we let customer to enter discount it gonne be more complicate for us to do and keep track. So we can just to that to show that our discount system is working.
    +Lastly, do query to update boarding_passes table to showed that the customer is done booking the table.
