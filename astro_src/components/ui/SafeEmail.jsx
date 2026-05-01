import React from 'react';

/**
 * SafeEmail Component
 * Obfuscates email address in the DOM to prevent basic scrapers from extracting it.
 * Renders as a clickable link.
 */
export const SafeEmail = ({ className = "" }) => {
  // We split the email to avoid literal string matching in scanners
  const parts = {
    user: 'soporte',
    at: '@',
    domain: 'cacomi',
    tld: '.app'
  };

  const handleClick = (e) => {
    e.preventDefault();
    const fullEmail = `${parts.user}${parts.at}${parts.domain}${parts.tld}`;
    window.location.href = `mailto:${fullEmail}`;
  };

  return (
    <a 
      href="#"
      onClick={handleClick}
      className={`hover:underline cursor-pointer ${className}`}
      title="Contactar soporte"
    >
      <span>{parts.user}</span>
      <span>{parts.at}</span>
      <span>{parts.domain}</span>
      <span>{parts.tld}</span>
    </a>
  );
};
