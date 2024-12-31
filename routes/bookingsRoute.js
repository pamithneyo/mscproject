const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Room = require("../models/room");
const moment = require('moment');
const stripe = require('stripe')('sk_test_51QbgIWP77BsglEvywnjfbxGGIGRdw40Q6AKteQ07uHDrqSaBmkPl9yWWqDjjdIoQUWQygD9SN78tfrGPeLZwKIYl00mQSkcfEl')
const { v4: uuidv4 } = require('uuid');


router.post("/bookroom", async (req, res) => {
    const {
        room,
        userid,
        fromdate,
        todate,
        totalamount,
        totaldays,
        token
    } = req.body;
    try {
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        })
        const payment = await stripe.charges.create(
            {
                amount: totalamount * 100,
                customer: customer.id,
                currency: 'LKR',
                reciept_email: token.email
            },
            {
                idempotencykey: uuidv4()
            }
        )
        if (payment) {
            
                const newbooking = new Booking({
                    room: room.name,
                    roomid: room._id,
                    userid,
                    fromdate: moment(fromdate).format('DD-MM-YYYY'),
                    todate: moment(todate).format('DD-MM-YYYY'),
                    totalamount,
                    totaldays,
                    transactionId: '1234',
                });

                const booking = await newbooking.save()
                const roomtemp = await Room.findOne({ _id: room._id })
                roomtemp.currentbookings.push({
                    bookingid: booking._id,
                    fromdate: moment(fromdate).format('DD-MM-YYYY'),
                    todate: moment(todate).format("DD-MM-YYYY"),
                    userid: userid,
                    status: booking.status
                });
                await roomtemp.save()
                res.status(201).json({
                    message: "Booking created successfully",
                    booking,
                })
                ;
            
        }
        res.send('Payment is Sucessfull, Your Room is Booked')
    } catch (error) {
        return res.status(400).json({ error });
    }

});

module.exports = router;
