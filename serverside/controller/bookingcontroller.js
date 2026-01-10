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
        const { room, checkInDate, checkOutDate } = req.bpdy;
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
        const { room, checkInDate, checkOutDate } = req.bpdy;
        const user = req.user._id;

        //before booking check Availability
       const isAvailable = await checkAvailability({
        checkInDate,
        checkOutDate,
        room
       });

       if(!isAvailable){
        return res.json({success: false, message: "Room is not available"})
       }

       //get totalPrice from room
       const roomData = await Room.findById(room).populate("hotel");
       let totalPrice  = roomData.pricePerNight;

       const checkIn = new Date(checkInDate)
       const checkOut = new Date(checkOutDate)
       const timeDiff = checkOut.getTime() - checkIn.getTime();
       const nights = Math.ceil(timeDiff / (1000*3600*24));
       totalPrice *= nights;
       const booking = await Booking.create({
        user,
        room,
        hotel: roomData._id,
        guests: +guests,
        checkInDate,
        checkOutDate,
        totalPrice,
       })
     res.json({success: true, message: "Booking created successfully "})

    } catch (error) {
        console.log(error);
     res.json({success: false, message: "Failed to create booking"})
        
    }
};

//API to get all booking for a user
//GET/ api/booking/user

export const getUserBooking = async (req,res) => {
    try {
       const user = req.user._id;
       const booking = await Booking.find({user}).populate("room hotel").Sort({createdAt: -1}) 
       res.json({success: true, booking})
    } catch (error) {
     res.json({success: false, message: "Failed to fetch booking"})
        
    }
}

export const getHotelBooking = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({owner: req.auth.userId});
    if(!hotel){
        return res.json({success: false, message: "No hotel found"})
    }
    const bookings = (await Booking.find({hotel: hotel._id}).populate("room hotel user")).toSorted({ createdAt: -1});

    //total booking
    const totalBooking = bookings.length;
    //total Revenue
    const totalRevenue = bookings.reduce((acc, booking)=>acc + booking.totalPrice, 0)

    res.json({success: true, dashboardData: {totalBooking,totalRevenue, bookings}})
    } catch (error) {
         res.json({success: false, message: "Failed to fetch booking"})
    }
}