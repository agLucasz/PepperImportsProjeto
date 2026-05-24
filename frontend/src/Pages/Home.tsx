import React from 'react';
import Header from '../Components/Home/Header';
import Carousel from '../Components/Home/Carousel';
import Destaques from '../Components/Home/Destaques';
import Editorial from '../Components/Home/Editorial';
import Retro from '../Components/Home/Retro';
import WhatsAppFloat from '../Components/Home/WhatsAppFloat';
import '../Styles/home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <Header />
      <Carousel />
      <Destaques />
      <Editorial />
      <Retro />
      <WhatsAppFloat />
    </div>
  );
};

export default Home;
