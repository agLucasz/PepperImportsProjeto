import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import banner1 from '../../assets/banner_1.png';
import '../../Styles/Home/carousel.css';

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  titleRed: string;
  subtitle: string;
  cta: string;
}

const slides: Slide[] = [
  {
    image: banner1,
    eyebrow: 'Pepper Imports',
    title: 'CAMISAS',
    titleRed: 'NACIONAIS',
    subtitle: 'As peças mais raras do futebol brasileiro em um só lugar.',
    cta: 'EXPLORAR CAMISAS',
  },
];

const Carousel: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + slides.length) % slides.length);
  const next = () => setCurrent(i => (i + 1) % slides.length);

  const slide = slides[current];

  return (
    <div className="carousel">
      {/* Background image with overlay */}
      <div
        className="carousel-bg"
        style={{ backgroundImage: `url(${slide.image})` }}
      />
      <div className="carousel-overlay" />

      {/* Content */}
      <div className="carousel-content">
        <p className="carousel-eyebrow">{slide.eyebrow}</p>
        <h2 className="carousel-title">
          {slide.title}
          <br />
          <span className="red">{slide.titleRed}</span>
        </h2>
        <p className="carousel-subtitle">{slide.subtitle}</p>
        <button className="carousel-cta" onClick={() => navigate('/catalogo')}>
          {slide.cta}
          <span className="carousel-cta-arrow" />
        </button>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button className="carousel-arrow prev" onClick={prev} aria-label="Anterior" />
          <button className="carousel-arrow next" onClick={next} aria-label="Próximo" />
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="carousel-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`carousel-dot${i === current ? ' active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
