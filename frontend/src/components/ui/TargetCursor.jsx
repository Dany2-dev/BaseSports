import { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef([]); // Cambiado a array para acceso rápido
  const spinTl = useRef(null);
  const dotRef = useRef(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef(null);
  const activeStrengthRef = { current: 0 }; // Objeto simple para evitar re-renders

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return true;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    return hasTouchScreen && isSmallScreen;
  }, []);

  const constants = useMemo(() => ({ borderWidth: 3, cornerSize: 12 }), []);

  // Optimizamos el movimiento base con un factor de suavizado fijo
  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x,
      y,
      duration: 0.1,
      ease: 'none', // 'none' es más ligero para seguimiento de ratón
      overwrite: 'auto'
    });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    // Cache de elementos de esquina para evitar querySelector repetidos
    cornersRef.current = Array.from(cursor.querySelectorAll('.target-cursor-corner'));
    
    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) document.body.style.cursor = 'none';

    let activeTarget = null;
    let resumeTimeout = null;

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    const createSpinTimeline = () => {
      if (spinTl.current) spinTl.current.kill();
      spinTl.current = gsap.to(cursor, { 
        rotation: 360, 
        duration: spinDuration, 
        ease: 'none', 
        repeat: -1 
      });
    };
    createSpinTimeline();

    // TICKER OPTIMIZADO: Eliminamos gsap.to interno para evitar saturar el motor
    const tickerFn = () => {
      if (!isActiveRef.current || !targetCornerPositionsRef.current) return;

      const strength = activeStrengthRef.current;
      const cursorX = gsap.getProperty(cursor, 'x');
      const cursorY = gsap.getProperty(cursor, 'y');

      for (let i = 0; i < cornersRef.current.length; i++) {
        const corner = cornersRef.current[i];
        const targetPos = targetCornerPositionsRef.current[i];
        
        const currentX = gsap.getProperty(corner, 'x');
        const currentY = gsap.getProperty(corner, 'y');

        // Interpolación lineal manual (más rápida que crear un objeto tween por frame)
        const destX = targetPos.x - cursorX;
        const destY = targetPos.y - cursorY;
        
        const nextX = currentX + (destX - currentX) * 0.15; // Suavizado fijo
        const nextY = currentY + (destY - currentY) * 0.15;

        gsap.set(corner, { x: nextX, y: nextY });
      }
    };

    const moveHandler = (e) => moveCursor(e.clientX, e.clientY);
    
    const scrollHandler = () => {
      if (!activeTarget) return;
      const mouseX = gsap.getProperty(cursor, 'x');
      const mouseY = gsap.getProperty(cursor, 'y');
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      
      if (!elementUnderMouse || (!elementUnderMouse.closest(targetSelector))) {
        leaveHandler();
      }
    };

    const mouseDownHandler = () => {
      gsap.to(dot, { scale: 0.7, duration: 0.2 });
      gsap.to(cursor, { scale: 0.9, duration: 0.2 });
    };

    const mouseUpHandler = () => {
      gsap.to(dot, { scale: 1, duration: 0.2 });
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    };

    const enterHandler = (e) => {
      const target = e.target.closest(targetSelector);
      if (!target || target.closest('.is-expanded') || activeTarget === target) return;

      activeTarget = target;
      if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }

      // Pausar rotación limpiamente
      spinTl.current?.pause();
      gsap.to(cursor, { rotation: 0, duration: 0.3 });

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
      ];

      isActiveRef.current = true;
      gsap.ticker.add(tickerFn);
      gsap.to(activeStrengthRef, { current: 1, duration: hoverDuration });
    };

    const leaveHandler = () => {
      if (!activeTarget) return;
      
      gsap.ticker.remove(tickerFn);
      isActiveRef.current = false;
      activeTarget = null;
      activeStrengthRef.current = 0;

      const { cornerSize } = constants;
      const positions = [
        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: cornerSize * 0.5 },
        { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
      ];

      cornersRef.current.forEach((corner, i) => {
        gsap.to(corner, { x: positions[i].x, y: positions[i].y, duration: 0.3, ease: 'power2.out' });
      });

      resumeTimeout = setTimeout(() => {
        if (!isActiveRef.current) spinTl.current?.play();
      }, 50);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseover', enterHandler, { passive: true });
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    return () => {
      gsap.ticker.remove(tickerFn);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseover', enterHandler);
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      document.body.style.cursor = originalCursor;
      spinTl.current?.kill();
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper" style={{ pointerEvents: 'none' }}>
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

export default TargetCursor;