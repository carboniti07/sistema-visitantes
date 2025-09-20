// src/components/Footer.jsx
import React from "react";
import styled, { css } from "styled-components";
import { FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";

const FooterWrapper = styled.footer`
  width: 100%;
  background: transparent;
  font-family: 'Poppins', sans-serif;
  color: #888;
  display: flex;
  justify-content: center;
  padding: 0.6rem 0;
  font-size: 0.9rem;
   margin-top: 24px;

  ${(props) =>
    props.$variant === "card" &&
    css`
      margin-top: auto;
      border-top: 1px solid #e9e9e9;
      padding: 0.75rem 12px;
      box-sizing: border-box;
    `}
`;

const Row = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  gap: clamp(0.4rem, 2.4vw, 0.7rem);
  font-size: clamp(0.84rem, 2.2vw, 0.92rem);
  max-width: 100%;
  min-width: 0;
`;

const Text = styled.span`
  color: #888;
`;

const NameText = styled.span`
  color: #174ea6;
  font-weight: 600;
  font-size: 1rem; /* levemente maior que o texto normal */
`;

const IconLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin: -4px;
  color: #174ea6;
  text-decoration: none;
  outline: none;

  svg { font-size: clamp(1rem, 3.2vw, 1.15rem); }

  transition: opacity .2s ease, transform .2s ease;
  &:hover { opacity: .85; transform: translateY(-0.5px); }
  &:focus-visible {
    outline: 2px solid rgba(26,93,255,.35);
    border-radius: 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity .2s ease;
    &:hover { transform: none; }
  }
`;

export default function Footer({ variant = "global" }) {
  const ano = new Date().getFullYear();

  return (
    <FooterWrapper $variant={variant}>
      <Row>
        <Text>
          © {ano} Desenvolvido por <NameText>Carboni</NameText>
        </Text>

        <IconLink
          href="https://www.instagram.com/carboni._/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram do Carboni"
          title="Instagram"
        >
          <FaInstagram />
        </IconLink>

        <IconLink
          href="https://www.linkedin.com/in/matheus-carboni-332a97304/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn do Carboni"
          title="LinkedIn"
        >
          <FaLinkedin />
        </IconLink>

        <IconLink
          href="https://wa.me/5511994551544"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp do Carboni"
          title="WhatsApp"
        >
          <FaWhatsapp />
        </IconLink>
      </Row>
    </FooterWrapper>
  );
}
