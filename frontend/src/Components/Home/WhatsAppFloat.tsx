import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import '../../Styles/Home/whatsapp-float.css';

const WHATSAPP_NUMBER = '5514981635560';

interface Props {
  message?: string;
}

const WhatsAppFloat: React.FC<Props> = ({
  message = 'Olá! Vim pelo site da Pepper Imports e gostaria de mais informações.',
}) => {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      aria-label="Falar no WhatsApp"
    >
      <FontAwesomeIcon icon={faWhatsapp} className="wa-float-icon" />
      <span className="wa-float-tooltip">Fale conosco</span>
    </a>
  );
};

export default WhatsAppFloat;

/** Gera o link do WhatsApp com mensagem personalizada */
export const waLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
