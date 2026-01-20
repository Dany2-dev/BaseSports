import { useEffect, useRef, useState, createElement, useMemo } from 'react';
import { gsap } from 'gsap';
import './TextType.css';

const TextType = ({
  text,
  as: Component = 'span',
  typingSpeed = 50,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  cursorCharacter = '|',
  cursorBlinkDuration = 0.5,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const cursorRef = useRef(null);
  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    let timeout;
    const currentFullText = textArray[currentTextIndex];

    if (isDeleting) {
      if (displayedText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
        setCurrentCharIndex(0);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(currentFullText.substring(0, displayedText.length - 1));
        }, deletingSpeed);
      }
    } else {
      if (currentCharIndex < currentFullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentFullText.substring(0, currentCharIndex + 1));
          setCurrentCharIndex((prev) => prev + 1);
        }, typingSpeed);
      } else if (loop) {
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentCharIndex, isDeleting, currentTextIndex, textArray, displayedText]);

  return createElement(
    Component,
    { className: `text-type ${className}` },
    displayedText,
    showCursor && <span ref={cursorRef} className="text-type__cursor">{cursorCharacter}</span>
  );
};

export default TextType;