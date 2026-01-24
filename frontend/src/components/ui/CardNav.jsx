import { useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';
import { GoArrowUpRight } from 'react-icons/go';
import './CardNav.css';

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  items = [],
  className = '',
  ease = 'expo.out',
  baseColor = '#fff',
  menuColor,
  buttonBgColor,
  buttonTextColor,
  onUploadSuccess
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- LÓGICA DE SUBIDA DE ARCHIVOS ---
  const handleButtonClick = useCallback((e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/stats/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (response.ok) {
        const data = await response.json();
        alert('Estadísticas cargadas correctamente');
        if (onUploadSuccess) onUploadSuccess(data);
      } else {
        alert('Error al subir el archivo: El servidor no procesó la solicitud');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor (Python).');
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Reset para permitir subir el mismo archivo
    }
  };

  // --- LÓGICA DE ANIMACIÓN ---
  const calculateHeight = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content');
      if (contentEl) {
        // Clonar temporalmente para medir sin saltos visuales
        const topBar = 60;
        const padding = 24;
        const contentHeight = contentEl.scrollHeight;
        return topBar + contentHeight + padding;
      }
    }
    return 260;
  }, []);

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl || cardsRef.current.length === 0) return null;

    // Limpieza de instancia previa
    if (tlRef.current) tlRef.current.kill();

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 30, opacity: 0, scale: 0.98 });

    const tl = gsap.timeline({ 
      paused: true, 
      defaults: { ease, duration: 0.5 } 
    });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.6,
    })
    .to(cardsRef.current, { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      stagger: 0.05 
    }, '-=0.4'); // Overlap optimizado

    return tl;
  }, [calculateHeight, ease]);

  useLayoutEffect(() => {
    tlRef.current = createTimeline();
    return () => {
      if (tlRef.current) tlRef.current.kill();
    };
  }, [createTimeline, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      
      if (isExpanded) {
        gsap.to(navRef.current, { 
          height: calculateHeight(), 
          duration: 0.3, 
          ease: 'power2.out' 
        });
      }
      // Re-inicializar timeline para nuevos valores de altura
      tlRef.current = createTimeline();
      if (isExpanded) tlRef.current.progress(1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, calculateHeight, createTimeline]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl || tl.isActive()) return; // Evitar spam de clics

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play();
    } else {
      setIsHamburgerOpen(false);
      tl.reverse().eventCallback('onReverseComplete', () => {
        setIsExpanded(false);
      });
    }
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav 
        ref={navRef} 
        className={`card-nav ${isExpanded ? 'open' : ''}`} 
        style={{ backgroundColor: baseColor }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          accept=".csv, .xlsx, .json"
        />
        
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isExpanded}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleMenu()}
            style={{ color: menuColor || '#000' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            <Link to="/">
              <img src={logo} alt={logoAlt} className="logo" />
            </Link>
          </div>

          <button
            type="button"
            className="card-nav-cta-button"
            onClick={handleButtonClick}
            disabled={isUploading}
            style={{ 
              backgroundColor: isUploading ? '#ccc' : buttonBgColor, 
              color: buttonTextColor,
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? 'CARGANDO...' : 'SUBIR ARCHIVO'}
          </button>
        </div>

        <div 
          className="card-nav-content" 
          style={{ visibility: isExpanded ? 'visible' : 'hidden' }}
          aria-hidden={!isExpanded}
        >
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={`nav-card-${idx}`}
              className="nav-card"
              ref={el => cardsRef.current[idx] = el}
              style={{ 
                backgroundColor: item.bgColor, 
                color: item.textColor 
              }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <Link 
                    key={`link-${idx}-${i}`} 
                    className="nav-card-link" 
                    to={lnk.path || '/'} 
                    onClick={toggleMenu}
                  >
                    <GoArrowUpRight className="nav-card-link-icon" />
                    {lnk.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;