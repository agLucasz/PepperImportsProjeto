import React, { useEffect, useState, useCallback } from 'react';
import { imageUrl, TAMANHOS, type ProdutoDTO } from '../../Services/produtoService';
import { waLink } from './WhatsAppFloat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import '../../Styles/Home/produto-modal.css';
import '../../Styles/Admin/rich-text-editor.css';

const imgLabel = (i: number) => `FOTO ${i + 1}`;

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  produto: ProdutoDTO;
  onClose: () => void;
}

const ProdutoModal: React.FC<Props> = ({ produto, onClose }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [tamanhoSel, setTamanhoSel] = useState<number | null>(null);

  /* Pré-seleciona o primeiro tamanho disponível */
  useEffect(() => {
    const primeiroDisp = produto.estoques.find(e => e.quantidade > 0);
    setTamanhoSel(primeiroDisp?.tamanho ?? null);
  }, [produto]);

  /* Fechar com ESC */
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('pm-open');
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      document.body.classList.remove('pm-open');
    };
  }, [handleKey]);

  /* Navegar entre imagens com setas */
  const prevImg = () => setActiveImg(i => (i - 1 + produto.imagemUrls.length) % produto.imagemUrls.length);
  const nextImg = () => setActiveImg(i => (i + 1) % produto.imagemUrls.length);

  const hasMultiple = produto.imagemUrls.length > 1;
  const totalQty = produto.quantidadeTotal;

  /* Quantidade do tamanho selecionado */
  const qtdSelecionada = tamanhoSel !== null
    ? (produto.estoques.find(e => e.tamanho === tamanhoSel)?.quantidade ?? 0)
    : 0;

  /* Mapa rápido tamanho → quantidade */
  const estoqueMap = Object.fromEntries(
    produto.estoques.map(e => [e.tamanho, e.quantidade])
  );

  const semEstoque = totalQty === 0;

  return (
    <div
      className="pm-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="pm-modal" role="dialog" aria-modal="true">

        {/* ===== ESQUERDA — galeria ===== */}
        <div className="pm-gallery">

          {/* Badges de categoria */}
          <div className="pm-gallery-badges">
            {produto.categorias.slice(0, 3).map((cat, i) => (
              <span key={i} className="pm-badge">{cat}</span>
            ))}
          </div>

          {/* Imagem principal */}
          <div className="pm-main-img-wrap">
            {produto.imagemUrls.length > 0 ? (
              <img
                key={activeImg}
                src={imageUrl(produto.imagemUrls[activeImg])}
                alt={produto.nomeProduto}
                className="pm-main-img"
              />
            ) : (
              <div className="pm-img-empty" />
            )}

            {/* Setas */}
            {hasMultiple && (
              <>
                <button className="pm-arrow pm-arrow--prev" onClick={prevImg} aria-label="Imagem anterior" />
                <button className="pm-arrow pm-arrow--next" onClick={nextImg} aria-label="Próxima imagem" />
              </>
            )}

            {/* Dots */}
            {hasMultiple && (
              <div className="pm-dots">
                {produto.imagemUrls.map((_, i) => (
                  <button
                    key={i}
                    className={`pm-dot${i === activeImg ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Imagem ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Label da imagem atual */}
          {produto.imagemUrls.length > 0 && (
            <p className="pm-img-label">
              {produto.categorias[0] && (
                <>{produto.categorias[0]} &middot; </>
              )}
              {imgLabel(activeImg)}
            </p>
          )}

          {/* Thumbnails */}
          {hasMultiple && (
            <div className="pm-thumbs">
              {produto.imagemUrls.map((url, i) => (
                <button
                  key={i}
                  className={`pm-thumb${i === activeImg ? ' active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={imageUrl(url)} alt={imgLabel(i)} />
                  <span>{imgLabel(i)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== DIREITA — informações ===== */}
        <div className="pm-info">

          {/* Breadcrumb */}
          <nav className="pm-breadcrumb">
            <span>Catálogo</span>
            {produto.categorias[0] && (
              <>
                <span className="pm-bc-sep" />
                <span>{produto.categorias[0]}</span>
              </>
            )}
            <span className="pm-bc-sep" />
            <span className="pm-bc-current">{produto.nomeProduto}</span>
          </nav>

          {/* Nome */}
          <h2 className="pm-title">{produto.nomeProduto}</h2>

          {/* Preço */}
          <div className="pm-price-wrap">
            <span className="pm-price">{fmtBRL(produto.valorVenda)}</span>
            {semEstoque && (
              <span className="pm-stock-badge pm-stock-badge--out">Esgotado</span>
            )}
            {!semEstoque && totalQty <= 3 && (
              <span className="pm-stock-badge pm-stock-badge--low">Últimas {totalQty}</span>
            )}
          </div>

          <div className="pm-divider" />

          {/* Descrição */}
          {produto.descricao && (
            <div
              className="pm-desc rte-rendered"
              dangerouslySetInnerHTML={{ __html: produto.descricao }}
            />
          )}

          {/* Tamanhos — grid com disponibilidade por tamanho */}
          {produto.estoques.length > 0 && (
            <div className="pm-sizes">
              <p className="pm-sizes-label">
                Tamanho
                {tamanhoSel !== null && (
                  <span className="pm-sizes-sel">
                    &nbsp;·&nbsp;
                    {TAMANHOS.find(t => t.value === tamanhoSel)?.label}
                    {qtdSelecionada > 0 && qtdSelecionada <= 3 && (
                      <span className="pm-sizes-low">&nbsp;({qtdSelecionada} restante{qtdSelecionada > 1 ? 's' : ''})</span>
                    )}
                  </span>
                )}
              </p>
              <div className="pm-sizes-grid">
                {TAMANHOS.map(t => {
                  const qty = estoqueMap[t.value] ?? 0;
                  // Só renderiza tamanhos que existem no produto
                  if (!(t.value in estoqueMap)) return null;
                  const available = qty > 0;
                  const selected  = tamanhoSel === t.value;
                  return (
                    <button
                      key={t.value}
                      className={`pm-size-pill${selected ? ' selected' : ''}${available ? ' available' : ' unavailable'}`}
                      disabled={!available}
                      onClick={() => available && setTamanhoSel(t.value)}
                      title={available ? `${qty} disponível${qty > 1 ? 'is' : ''}` : 'Esgotado'}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pm-cta-row">
            {semEstoque || tamanhoSel === null || qtdSelecionada === 0 ? (
              <button className="pm-btn-add" disabled>
                <span className="pm-plus-icon" />
                {semEstoque ? 'Sem estoque' : 'Selecione um tamanho'}
              </button>
            ) : (
              <a
                className="pm-btn-add pm-btn-add--wa"
                href={waLink(
                  `Olá! Tenho interesse no produto *${produto.nomeProduto}*` +
                  ` — Tamanho: *${TAMANHOS.find(t => t.value === tamanhoSel)?.label}*. Pode me ajudar?`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
                Chamar no WhatsApp
              </a>
            )}

            <button className="pm-btn-back" onClick={onClose}>
              <span className="pm-back-arrow" aria-hidden="true" />
              Voltar
            </button>
          </div>

          {/* Garantias */}
          <div className="pm-guarantees">
            <div className="pm-guarantee">
              <div>
                <b>Frete Gratis</b>
                <small>Para Todo o Brasil</small>
              </div>
            </div>
            <div className="pm-guarantee">
              <div>
                <b>Autêntico</b>
                <small>Alta Qualidade</small>
              </div>
            </div>
            <div className="pm-guarantee">
              <div>
                <b>Compra Segura</b>
                <small>Pagamento Seguro</small>
              </div>
            </div>
          </div>
        </div>

        {/* Botão fechar */}
        <button className="pm-close" onClick={onClose} aria-label="Fechar" />
      </div>
    </div>
  );
};

export default ProdutoModal;
