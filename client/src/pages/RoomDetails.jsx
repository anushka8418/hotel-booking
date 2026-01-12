import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets, facilityIcons, roomCommonData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast'; 

const RoomDetails = () => {
    const { id } = useParams()
    const { rooms, navigate, getToken, axios } = useAppContext() 
    const [room, setRoom] = useState(null)
    const [mainImage, setMainImage] = useState(null)
    
    // Form State
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [isAvailable, setIsAvailable] = useState(false); // Added missing state definition

    useEffect(() => {
        const foundRoom = rooms.find(r => r._id === id); 
        if (foundRoom) {
            setRoom(foundRoom);
            setMainImage(foundRoom.images[0]);
        }
    }, [rooms, id])

    // Helper to reset availability when dates change
    const handleDateChange = (setter) => (e) => {
        setter(e.target.value);
        setIsAvailable(false); // Force re-check if user changes date
    }

    const handleCheckAvailability = async () => {
        try{
            if(!checkInDate || !checkOutDate){
                toast.error("Please select dates first");
                return;
            }
            if(checkInDate >= checkOutDate){
                toast.error("Check-out date must be after check-in date");
                return;
            }
            
            const {data} = await axios.post('/api/booking/check-availability', {room: id, checkInDate, checkOutDate})
            
            if(data.success){
                if(data.isAvailable){
                    setIsAvailable(true)
                    toast.success("Room Is Available");
                } else {
                    setIsAvailable(false)
                    toast.error("Room Is Not Available")
                }
            } else {
                toast.error(data.message)
            }
        } catch (error){
            toast.error(error.message)
        }
    }

    const onSubmitHandler = async(e)=>{
        e.preventDefault(); // Moved preventDefault to top
        try {
            if(!isAvailable){
                return handleCheckAvailability();
            } else {
                // FIX: Corrected URL from '/api/bookings/book' to '/api/booking/book'
                const {data} = await axios.post('/api/booking/book', 
                    {
                        room: id, 
                        checkInDate, 
                        checkOutDate, 
                        guests, 
                        PaymentMethod: 'Pay At Hotel' // Note: Backend currently ignores this, but safe to keep
                    }, 
                    { headers: { Authorization: `Bearer ${await getToken()}` }}
                )
                
                if(data.success){
                    toast.success(data.message)
                    navigate('/my-booking')
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return room && (
        <div className='py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 container mx-auto'>
            {/* Back Button */}
            <div className='mb-6'>
                <img
                    src={assets.arrowIcon}
                    alt="Back"
                    className='w-6 h-6 cursor-pointer hover:opacity-75 transition-opacity rotate-180'
                    onClick={() => navigate(-1)}
                />
            </div>

            {/* Room Header */}
            <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
                <h1 className='text-3xl md:text-4xl font-playfair'>{room.hotel.name} <span className='font-inter text-sm'>({room.roomType})</span></h1>
                <p className='text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full'>20% OFF</p>
            </div>

            {/* Room Rating */}
            <div className='flex items-center gap-1 mt-2'>
                <StarRating />
                <p className='ml-2'> 200+ reviews</p>
            </div>

            {/* Room Address */}
            <div className='flex items-center gap-1 text-gray-500 mt-2'>
                <img src={assets.locationIcon} alt="location-icon" />
                <span>{room.hotel.address}</span>
            </div>

            {/* Room Images */}
            <div className='flex flex-col lg:flex-row mt-6 gap-6'>
                <div className='lg:w-1/2 w-full'>
                    <img src={mainImage || assets.galleryIcon} alt="room-main"
                        className='w-full rounded-xl shadow-lg object-cover' />
                </div>
                <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
                    {room?.images.length > 1 && room.images.map((image, index) => (
                        <img 
                            key={index}
                            onClick={() => setMainImage(image)}
                            src={image} 
                            alt={`Room View ${index + 1}`} 
                            className={`w-full rounded-xl shadow-md object-cover cursor-pointer transition-all ${mainImage === image ? 'ring-2 ring-orange-500 opacity-100' : 'opacity-80 hover:opacity-100'}`} 
                        />
                    ))}
                </div>
            </div>

            {/* Room Highlights & Price */}
            <div className='flex flex-col md:flex-row md:justify-between mt-10'>
                <div className='flex flex-col'>
                    <h1 className='text-3xl md:text-4xl font-playfair'>Experience luxury like Never Before.</h1>
                    <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                        {room.amenities.map((item, index) => (
                            <div key={index} className='flex item-center gap-2 px-3 py-2 rounded-lg bg-gray-100'>
                                {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className='w-5 h-5' />}
                                <p className='text-xs'>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className='text-2xl font-medium'> ${room.pricePerNight}/night</p>
            </div>

            {/* Check-In/Out Form */}
            <form onSubmit={onSubmitHandler} className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'>
                <div className='flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500'>
                    <div className='flex flex-col'>
                        <label htmlFor="checkInDate" className='font-medium'>Check-In</label>
                        <input 
                            type="date" 
                            id='checkInDate' 
                            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' 
                            required 
                            placeholder='Check-In'
                            onChange={handleDateChange(setCheckInDate)} // Reset isAvailable on change
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className='w-px h-15 bg-gray-300/70 max-md:hidden' ></div>
                    <div className='flex flex-col'>
                        <label htmlFor="checkOutDate" className='font-medium'>Check-Out</label>
                        <input 
                            type="date" 
                            id='checkOutDate' 
                            placeholder='Check-Out'
                            className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' 
                            required 
                            onChange={handleDateChange(setCheckOutDate)} // Reset isAvailable on change
                            min={checkInDate} disabled={!checkInDate}
                        />
                    </div>
                    <div className='w-px h-15 bg-gray-300/70 max-md:hidden' ></div>
                    <div className='flex flex-col'>
                        <label htmlFor="guests" className='font-medium'>Guests</label>
                        <input 
                            type="number" 
                            id='guests' 
                            min={1}
                            className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none' 
                            required 
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                        />
                    </div>
                </div>
                <button type='submit' className={`text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer transition-all ${isAvailable ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-dull'}`}>
                   { isAvailable ? "Book Now" : "Check Availability"}
                </button>
            </form>

            {/* Common Specifications */}
            <div className='mt-25 space-y-4'>
                {roomCommonData.map((spec, index) => (
                    <div key={index} className='flex items-start gap-2'>
                        <img src={spec.icon} alt={`${spec.title}-icon`} className='w-6.5' />
                        <div>
                            <p className='text-base'>{spec.title}</p>
                            <p className='text-gray-500'>{spec.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Description */}
            <div>
                <p className='max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500'>
                    Guests will be allocated on the ground floor according to availability. You get a comfortable two bedroom apartment that has a true city feeling.
                </p>
            </div>

            {/* Hosted By */}
            <div className='flex flex-col items-start gap-4'>
                <div className='flex gap-4'>
                    <img src={room.hotel.owner?.image || assets.userIcon} alt="Host" className='h-14 w-14 md:h-18 md:w-18 rounded-full object-cover' />
                    <div>
                        <p className='text-lg md:text-xl'>Hosted by {room.hotel.name}</p>
                        <div className='flex items-center mt-1'>
                            <StarRating />
                            <p className='ml-2'>200+ review</p>
                        </div>
                    </div>
                </div>
                <button className='px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer'>Contact Now</button>
            </div>
        </div>
    )
}

export default RoomDetails