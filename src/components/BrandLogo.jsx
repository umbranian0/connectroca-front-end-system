import { useEffect, useState } from 'react';
import { getBrandLogoUrl, getLocalLogoUrl } from '../api/brandingApi';

function BrandLogo({ alt, className, loading = 'lazy', decoding = 'async' }) {
  const [logoUrl, setLogoUrl] = useState(getLocalLogoUrl());

  useEffect(() => {
    let isMounted = true;

    getBrandLogoUrl().then((resolvedLogoUrl) => {
      if (isMounted && resolvedLogoUrl) {
        setLogoUrl(resolvedLogoUrl);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleError = () => {
    const fallbackLogo = getLocalLogoUrl();

    if (logoUrl !== fallbackLogo) {
      setLogoUrl(fallbackLogo);
    }
  };

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={handleError}
    />
  );
}

export default BrandLogo;
