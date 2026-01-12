import React, { useEffect, useState } from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../context/AppContext'
// Removed unused imports (Navigate, useNavigate)

const RecommendedHotel = () => {
  const { rooms, searchedCities } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    // Safety check: ensure rooms and searchedCities exist
    if (rooms && searchedCities && searchedCities.length > 0) {
      
      const filteredHotels = rooms.filter(room => {
        // Safety check: ensure room.hotel exists
        if (!room.hotel || !room.hotel.city) return false;

        // Case-insensitive comparison
        return searchedCities.some(city => 
           room.hotel.city.toLowerCase() === city.toLowerCase()
        );
      });

      setRecommended(filteredHotels);
    }
  }, [rooms, searchedCities]) // Dependency array is correct

  // Only render if we found matches
  return recommended.length > 0 && (
    <div className='flex flex-col items-center justify-center px-6 md:px-16 lg:px-5 bg-slate-100 py-10'>

      <Title title='Recommended Hotels' subTitle='Discover our handpicked selection for exceptional properties around the world, offering unparalleled luxury and unforgettable experience.' />

      <div className='flex flex-wrap items-center justify-evenly gap-6 mt-10'>
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>

    </div>
  )
}

export default RecommendedHotel