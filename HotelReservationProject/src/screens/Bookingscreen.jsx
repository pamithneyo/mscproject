import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import StripeCheckout from 'react-stripe-checkout';
import Swal from 'sweetalert2'

function Bookingscreen() {
  const { roomid, fromdate, todate } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);

  console.log("From Date (from URL):", fromdate);
  console.log("To Date (from URL):", todate);

  const parsedFromDate = moment(fromdate, "DD-MM-YYYY", true);
  const parsedToDate = moment(todate, "DD-MM-YYYY", true);

  // Validate the dates and set the error state if invalid
  useEffect(() => {
    if (!parsedFromDate.isValid() || !parsedToDate.isValid()) {
      setError("Invalid booking dates. Please check the URL.");
      setLoading(false); // Stop loading if there's an error
    } else {
      setError(null); // Clear any previous error
    }
  }, [fromdate, todate]);

  const totaldays = parsedFromDate.isValid() && parsedToDate.isValid()
    ? parsedToDate.diff(parsedFromDate, "days")
    : 0;

  console.log("Total Days:", totaldays);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        console.log("Fetching room data for ID:", roomid);
        const response = await axios.post(
          "http://localhost:5000/api/rooms/getroombyid",
          { roomid }
        );
        console.log("API Response:", response.data);
        setRoom(response.data.room);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching room data:", err.message || err);
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [roomid]);

  const bookRoom = async () => {
    if (!room) return; // Prevent booking if room data is not loaded

    const totalamount = totaldays * (room?.rentperday || 0); // Calculate total amount safely
   
  };

  async function onToken(token) {
    console.log("Received Stripe token:", token);  // Handle Stripe token for payment processing
    // Proceed with the payment process, e.g., send token to backend
    const bookingDetails = {
      room,
      userid: JSON.parse(localStorage.getItem("currentUser"))?._id,
      fromdate,
      todate,
      totalamount,
      totaldays,
      token
    };

    try {
      const result = await axios.post(
        "http://localhost:5000/api/bookings/bookroom",
        bookingDetails,
      );
      console.log("Booking successful:", result.data);
      Swal.fire('Congratulation', 'Your Room Booke Sucessfully','sucess').then(result=>{
        window.location.href='/bookings'
      })
    } catch (error) {
      console.error("Error booking room:", error.message || error);
      Swal.fire('Congratulation', 'Something went wrong','error')
    }
  }

  return (
    <div>
      {loading ? (
        <h1>Loading...</h1>
      ) : error ? (
        <h1>Error: {error}</h1>
      ) : (
        room && (
          <div className="mt-5">
            <div className="row justify-content-center mt-5 bs">
              <div className="col-md-6">
                <h1 className="mt-5">{room?.name}</h1>
                {room?.imageurls?.length > 0 ? (
                  <img src={room.imageurls[0]} className="bigimg" alt="Room" />
                ) : (
                  <p>No image available</p>
                )}
              </div>
              <div className="col-md-6">
                <div style={{ textAlign: "right" }}>
                  <h1 className="mt-5">Booking Details</h1>
                  <hr />
                  <b>
                    <p>Name: {JSON.parse(localStorage.getItem('currentUser'))?.name || "User not found"} </p>
                    <p>From Date: {fromdate}</p>
                    <p>To Date: {todate}</p>
                    <p>Max Count: {room?.maxcount}</p>
                  </b>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b>
                    <h1>Amount</h1>
                    <hr />
                    <p>Total Days: {totaldays}</p>
                    <p>Rent Per Day: {room?.rentperday}</p>
                    <p>Total Amount: {totaldays * room?.rentperday}</p>
                  </b>
                </div>
                <div style={{ float: "right" }}>
                 
                  <StripeCheckout
                    token={onToken}
                    stripeKey="pk_test_51QbgIWP77BsglEvyriExGqW6xgitTsUmRE2FnrN9SLKXjRAOg13bKoMsclB2F8ReGoehhfZjYP4Lh4KdfgcQHYoY008kNAI56w"
                    currency="LKR"
                    amount={totaldays * room?.rentperday * 100} // Convert amount to cents
                    name="Room Booking"
                    description={`Booking for ${room?.name}`}
                  >
                     <button className="btn btn-primary">
                    Pay Now
                  </button>
                  </StripeCheckout>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default Bookingscreen;
