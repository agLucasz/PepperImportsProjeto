import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Home/retro.css';

const Retro: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="retro">
      <div className="retro-inner">

        <h2 className="retro-title">
          CAMISAS QUE<br />
          FIZERAM <span className="retro-title-dark">HISTÓRIA</span>
        </h2>

        <p className="retro-sub">
          Cada camisa carrega mais do que cores — traz memórias, conquistas e histórias que marcaram gerações do futebol.
        </p>

        <button className="retro-cta" onClick={() => navigate('/catalogo')}>
          Explorar Acervo
          <span className="retro-cta-arrow" />
        </button>

      </div>
    </section>
  );
};

export default Retro;
