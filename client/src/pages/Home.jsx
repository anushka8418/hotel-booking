import React from 'react'
import Hero from '../components/Hero'
import FeaturesDestintion from '../components/FeaturesDestintion'
import ExclusiveOffers from '../components/ExclusiveOffers'
import Testimonial from '../components/Testimonial'
import NewsLetter from '../components/NewsLetter'
import RecommendedHotel from '../components/RecommendedHotel'


const Home = () => {
  return (
    <>
        <Hero />
        <RecommendedHotel/>
        <FeaturesDestintion/>
        <ExclusiveOffers/>
        <Testimonial/>
        <NewsLetter/>
        </>
  ) 
}

export default Home