import React, { useState, useEffect } from 'react';

export function ConsentBanner() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('cookie_consent') === 'true') {
      setAccepted(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#000', color: '#fff' }}>
      <p>We use cookies for analytics. <button onClick={accept}>Accept</button></p>
    </div>
  );
}
