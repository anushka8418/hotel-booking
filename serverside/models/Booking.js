import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
   user: {type:String, ref: "User", required: ture},
   room: {type:String, ref: "Room", required: ture},
   hotel: {type:String, ref: "Hotel", required: ture},
   checkInDate: {type: Date, required: ture},
   checkOutDate: {type: Date, required: ture},
   totalPrice: {type: Number, required: ture},
   guests: {type: Number, required: ture},
   status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled,"],
    default: "pending"},
   paymentMethod: {
    type: String,
    required: true,
    default: "Pay At hotel",},
   isPaid: {type: Boolean, default: false},

}, {timestamps: true});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;

