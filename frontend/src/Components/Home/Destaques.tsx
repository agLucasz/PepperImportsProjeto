import React, { useEffect, useState } from 'react';
import { getAll, imageUrl, TAMANHOS, type ProdutoDTO } from '../../Services/produtoService';
import ProdutoModal from './ProdutoModal';
import '../../Styles/Home/destaques.css';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Etiquetas de tamanho a partir dos estoques disponíveis */
const tamanhoLabels = (estoques: ProdutoDTO['estoques']): string => {
  const disponiveis = estoques
    .filter(e => e.quantidade > 0)
    .map(e => TAMANHOS.find(t => t.value === e.tamanho)?.label ?? '?')
    .sort();
  return disponiveis.length > 0 ? disponiveis.join(' · ') : 'Esgotado';
};

const Destaques: React.FC = () => {
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProduto, setModalProduto] = useState<ProdutoDTO | null>(null);

  useEffect(() => {
    getAll()
      .then(data => setProdutos(data.filter(p => p.ativo && p.destaque)))
      .catch(() => {/* silently ignore */})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && produtos.length === 0) return null;

  return (
    <section className="destaques">
      {/* Header row */}
      <div className="destaques-head">
        <div>
          <p className="destaques-eyebrow">Seleção especial</p>
          <h2 className="destaques-title">
            DESTAQUES<br />DA LOJA
          </h2>
        </div>
        <button className="destaques-ver-todos">
          VER TODOS
          <span className="destaques-arrow" />
        </button>
      </div>

      {/* Cards */}
      <div className="destaques-track">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="destaque-card destaque-card--skeleton" />
            ))
          : produtos.map(prod => (
              <article key={prod.produtoId} className="destaque-card" onClick={() => setModalProduto(prod)}>
                {/* Badges */}
                <div className="destaque-badges">
                  {prod.categorias.slice(0, 2).map((cat, i) => (
                    <span key={i} className="destaque-badge">{cat}</span>
                  ))}
                </div>

                {/* Image area */}
                <div className="destaque-img-wrap">
                  {prod.imagemUrls.length > 0 ? (
                    <img
                      src={imageUrl(prod.imagemUrls[0])}
                      alt={prod.nomeProduto}
                      className="destaque-img"
                    />
                  ) : (
                    <div className="destaque-img-placeholder" />
                  )}

                  {/* Size pill */}
                  <span className="destaque-size">{tamanhoLabels(prod.estoques)}</span>
                </div>

                {/* Info */}
                <div className="destaque-info">
                  {prod.categorias.length > 0 && (
                    <p className="destaque-cat">{prod.categorias.join(' · ')}</p>
                  )}
                  <h3 className="destaque-name">{prod.nomeProduto}</h3>
                  <div className="destaque-price-row">
                    <span className="destaque-price">{fmtBRL(prod.valorVenda)}</span>
                    {prod.quantidadeTotal <= 3 && prod.quantidadeTotal > 0 && (
                      <span className="destaque-badge destaque-badge--low">
                        Últimas {prod.quantidadeTotal}
                      </span>
                    )}
                    {prod.quantidadeTotal === 0 && (
                      <span className="destaque-badge destaque-badge--out">Esgotado</span>
                    )}
                  </div>
                </div>
              </article>
            ))
        }
      </div>

      {/* Modal */}
      {modalProduto && (
        <ProdutoModal
          produto={modalProduto}
          onClose={() => setModalProduto(null)}
        />
      )}
    </section>
  );
};

export default Destaques;
