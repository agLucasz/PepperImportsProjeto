import React from 'react';
import { useNavigate } from 'react-router-dom';
import torcedor from '../../assets/torcedor.png';
import brasil from '../../assets/brasil.png';
import '../../Styles/Home/editorial.css';

interface EditorialCard {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
}

const cards: EditorialCard[] = [
  {
    image: torcedor,
    title: 'DO VESTIÁRIO PRA SUA ESTANTE',
    subtitle: 'Importamos cada peça lacrada. Veste como torcedor, tem o peso de colecionador.',
    cta: 'VER CATÁLOGO',
  },
  {
    image: brasil,
    title: 'COLEÇÃO COPA 26',
    subtitle: 'Explore as principais seleções da Copa 2026 em uma coleção feita para quem vive o futebol. Camisas oficiais com autenticidade garantida e história em cada detalhe',
    cta: 'VER CATÁLOGO',
  },
];

const Editorial: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="editorial">
      <div className="editorial-grid">
        {cards.map((card, i) => (
          <div key={i} className="ed-card">
            {/* Background */}
            <div
              className="ed-card-bg"
              style={{ backgroundImage: `url(${card.image})` }}
            />
            <div className="ed-card-overlay" />

            {/* Content */}
            <div className="ed-card-content">
              <h3 className="ed-title">{card.title}</h3>
              <p className="ed-subtitle">{card.subtitle}</p>
              <button className="ed-cta" onClick={() => navigate('/catalogo')}>
                {card.cta}
                <span className="ed-cta-arrow" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Editorial;
