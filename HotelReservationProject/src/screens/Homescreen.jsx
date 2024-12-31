import React, { useState, useEffect } from 'react';
import Room from '../components/Room'
import 'antd/dist/antd.css';
import { DatePicker, Space } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;


function HomeScreen() {

  const [rooms, setRooms] = useState([]); // State for storing rooms
  const [loading, setLoading] = useState(false); // State for loading status
  const [error, setError] = useState(false); // State for error handling
  const [fromdate, setfromdate] = useState()
  const [todate, settodate] = useState()
  const [duplicaterooms, setduplicaterooms] = useState([])
  const [searchkey,setsearchkey]=useState('')


  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true); // Start loading
        setError(false); // Reset error before fetching
        const response = await fetch('http://localhost:5000/api/rooms/getallrooms');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched Rooms:', data.rooms);
        setRooms(data.rooms); // Update rooms state with fetched data
        setduplicaterooms(data)
      } catch (error) {
        setError(true); // Set error state if fetching fails
        console.error('Error fetching rooms:', error.message);
      } finally {
        setLoading(false); // Stop loading
      }
    }

    fetchRooms();
  }, []);

  // Log state right before the return
  console.log('Rooms state:', rooms);
  function filterByDate(dates) {
    setfromdate(moment(dates[0]).format('DD-MM-YYYY'))
    settodate(moment(dates[1]).format('DD-MM-YYYY'))

    var temprooms = []
    var availability = false
    for (const room of duplicaterooms) {
      if (room.currentbookings.length > 0) {
        for ( const booking of room.currentbookings) {
          if (!momonet(moment(dates[0]).format('DD-MM-YYYY')).isBetween(booking.fromdate, booking.todate)
            && moment(moment(dates[1]).format('DD-MM-YYYY')).isBetween(booking.fromdate, booking.todate))
           {
            if (
              moment(dates[0]).format('DD-MM-YYYY') !== booking.fromdate &&
              moment(dates[0]).format('DD-MM-YYYY') !== booking.todate &&
              moment(dates[1]).format('DD-MM-YYYY') !== booking.fromdate &&
              moment(dates[1]).format('DD-MM-YYYY') !== booking.todate
            ) {
              availability = true
            }
          }
        }
      }
      if(availability == true || room.currentbookings.length ==0)
      {
        temprooms.push(room)
      }
      setRooms(temprooms)
    }

  }
  return (
    <div className="container bs">
      <div className='row mt-2 bs'>
        <div className="col-md-3 mt-5">
          <RangePicker format="DD-MM-YYYY" onChange={filterByDate} />
        </div>
        <div className='col-md-5 mt-5'>
        <input type="text"  className='form-control' placeholder='search rooms' />
        </div>
        <select className='col-md-3 mt-5'>
          <option value="All">All</option>
          <option value="Deluxe Suite">Deluxe Suite</option>
          <option value="Standard Double Room">Standard Double Room</option>
          <option value="Family Room">Family Room</option>
          <option value="Economy Single Room">Economy Single Room</option>
          <option value="Penthouse Suite">Penthouse Suite</option>

        </select>

      </div>
      <div className='row justify-content-center mt-5'>
        {loading ? (
          <h1>Loading...</h1>
        ) : error ? (
          <h1></h1>
        ) : (
          rooms.length > 0 ? (
            rooms.map((room, index) => (
              <div key={index} className="col-md-9 mt-2">
                <h2>{room.name}</h2>
                <Room room={room} fromdate={fromdate} todate={todate} /> {/* Adjust fields based on your room object structure */}
              </div>
            ))
          ) : (
            <h1>No rooms available</h1>
          )
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
