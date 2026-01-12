import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

//function to check availability of rooms
const checkAvailability = async({ checkInDate, checkOutDate, room})=>{
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate},
        });
        const isAvailable = bookings.length === 0; 
        return isAvailable;
    } catch (error) {
       console.error(error.message); 
    }
}


//API to check availability of room
//POST / api/ bookings/ check-availability
export const checkAvailabilityAPI = async(req, res)=>{
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({checkInDate,checkOutDate, room});
        res.json({success: true, isAvailable})
    } catch (error) {
         res.json({success: false, message: error.message})
    }
}


//Api to create a new booking
// POST /api/booking/book

export const createBooking = async(req, res)=>{
    try {
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;

        // 1. Check Availability
       const isAvailable = await checkAvailability({
        checkInDate,
        checkOutDate,
        room
       });

       if(!isAvailable){
        return res.json({success: false, message: "Room is not available"})
       }

       // 2. Calculate Price
       const roomData = await Room.findById(room).populate("hotel");
       let totalPrice  = roomData.pricePerNight;

       const checkIn = new Date(checkInDate)
       const checkOut = new Date(checkOutDate)
       const timeDiff = checkOut.getTime() - checkIn.getTime();
       const nights = Math.ceil(timeDiff / (1000*3600*24));
       totalPrice *= nights;

       // 3. Create Booking (This part works!)
       const booking = await Booking.create({
        user,
        room,
        hotel: roomData._id,
        guests: +guests,
        checkInDate,
        checkOutDate,
        totalPrice,
       })

       // 4. Send Email (Wrapped in try/catch so it doesn't crash the app)
       try {
           const mailOptions = {
              from: process.env.SENDER_EMAIL, // FIX: Lowercase 'process'
              to: req.user.email,
              subject: 'Hotel Booking Details',
              html: `
              <h2> Your Booking Details </h2>
              <p> Dear ${req.user.username},</p>
              <p> Thank you for choosing us! Here is your booking Details: </p>
              <ul> 
                  <li><strong> Booking ID:</strong> ${booking._id} </li>
                  <li><strong> Hotel Name:</strong> ${roomData.hotel.name} </li>
                  <li><strong> Location:</strong> ${roomData.hotel.address} </li>
                  <li><strong> Date:</strong> ${new Date(booking.checkInDate).toDateString()} </li>
                  <li><strong> Total Amount:</strong> ${process.env.CURRENCY || '$'} ${booking.totalPrice} </li>
              </ul>
              <P> We look forward to welcoming you! </P>
              `
           }
           await transporter.sendMail(mailOptions)
       } catch (emailError) {
           console.log("Email failed to send:", emailError.message);
           // We do NOT stop the request here. We just log the error.
       }

     // 5. Send Success Response
     res.json({success: true, message: "Booking created successfully"})

    } catch (error) {
        console.log("Booking Error:", error);
        res.json({success: false, message: "Failed to create booking"})
    }
};

//API to get all booking for a user
//GET/ api/booking/user

export const getUserBooking = async (req,res) => {
    try {
       const user = req.user._id;
       const booking = await Booking.find({user}).populate("room hotel").sort({createdAt: -1}) 
       res.json({success: true, booking})
    } catch (error) {
     res.json({success: false, message: "Failed to fetch booking"})
        
    }
}

export const getHotelBooking = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({owner: req.user._id}); // Ensure usage of req.user._id if using protect middleware
    if(!hotel){
        return res.json({success: false, message: "No hotel found"})
    }
    const bookings = (await Booking.find({hotel: hotel._id}).populate("room hotel user")).sort({ createdAt: -1});

    //total booking
    const totalBooking = bookings.length;
    //total Revenue
    const totalRevenue = bookings.reduce((acc, booking)=>acc + booking.totalPrice, 0)

    res.json({success: true, dashboardData: {totalBooking,totalRevenue, bookings}})
    } catch (error) {
         res.json({success: false, message: "Failed to fetch booking"})
    }
}