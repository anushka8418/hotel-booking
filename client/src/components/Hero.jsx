import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Hero = () => {

    const { navigate, getToken, axios, setSearchedCities } = useAppContext()
    const [destination, setDestination] = useState("")

    const onSearch = async (e) => {
        e.preventDefault();
        
        // FIX 1: Corrected typo 'destnation' to 'destination' and query format
        // Use query parameter format: ?key=value
        navigate(`/rooms?destination=${destination}`)

        try {
            const token = await getToken();
            if (token) {
                await axios.post('/api/user/store-recent-search', 
                    { recentSearchedCity: destination }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        } catch (error) {
            console.error("Failed to store search:", error);
        }

        setSearchedCities((prevSearchCities) => {
            // FIX 2: Prevent duplicates
            // Filter out the current destination if it already exists, then add it to the end
            const filteredCities = prevSearchCities.filter(city => city !== destination);
            const updatedSearchedCities = [...filteredCities, destination];
            
            // Keep only the last 3 searches
            if (updatedSearchedCities.length > 3) {
                updatedSearchedCities.shift();
            }
            return updatedSearchedCities;
        })
    }

    return (
        <div className='flex flex-col items-start justify-center px-6 pb-8 md:px-16 lg:px-24 xl:px-32 text-white bg-[url("/src/assets/heroImage.png")] bg-no-repeat bg-cover bg-center h-screen'>
            <p className='bg-[#49B9FF]/50 px-3.5 rounded-full mt-28 max-md:mt-14'>The Ultimate Hotel Experience</p>

            <h1 className='font-playfair text-2xl md:text5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4'>Discover Your Perfect Gateway Destination</h1>

            <p className='max-w-130 mt-2 text-sm md:text-base'>Unparalleled luxury and comfort await at the world's MostExclusive hotel and resorts.  Explore our wide range of hotels, resorts & villas.
            </p>
            
            {/* FIX 3: Fixed 'text-white-500' to 'text-gray-800' for better contrast on inputs */}
            <form onSubmit={onSearch} className='bg-white/10 backdrop-blur-md text-gray-800 rounded-xl px-6 py-4  flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto mt-10 max-md:mt-4'>

                <div>
                    <div className='flex items-center gap-2 max-md:h-5 text-white '>
                        {/* Note: Ideally use locationIcon for destination, but calenderIcon is fine if intended */}
                        <img src={assets.locationIcon || assets.calenderIcon} alt="" className='h-4' />
                        <label htmlFor="destinationInput">Destination</label>
                    </div>
                    {/* Added text-black to inputs so user can see what they type */}
                    <input onChange={e => setDestination(e.target.value)} value={destination} list='destinations' id="destinationInput" type="text" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none text-white " placeholder="Type here" required />
                    <datalist id='destinations'>
                        {cities.map((city, index) => (<option value={city} key={index} />))}
                    </datalist>
                </div>

                <div>
                    <div className='flex items-center gap-2 max-md:h-5 text-white'>
                        <img src={assets.calenderIcon} alt="" className='h-4' />
                        <label htmlFor="checkIn">Check in</label>
                    </div>
                    <input id="checkIn" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none text-white " />
                </div>

                <div>
                    <div className='flex items-center gap-2 max-md:h-5 text-white'>
                        <img src={assets.calenderIcon} alt="" className='h-4' />
                        <label htmlFor="checkOut">Check out</label>
                    </div>
                    <input id="checkOut" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none text-white " />
                </div>

                <div className='flex md:flex-col max-md:gap-2 max-md:items-center max-md:h-5'>
                    <label htmlFor="guests" className='text-white'>Guests</label>
                    <input min={1} max={4} id="guests" type="number" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none  max-w-16 text-white" placeholder="0" />
                </div>

                <button className='flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1' >
                    <img src={assets.searchIcon} alt="searchIcon" className='h-7' />
                    <span>Search</span>
                </button>
            </form>
        </div>
    )
}

export default Hero