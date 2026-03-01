import { useEffect } from 'react';

interface ConfettiPiece {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  vx: number;
  vy: number;
}

/**
 * useConfetti Hook
 *
 * Creates a confetti animation effect with physics
 * Pieces fall and rotate realistically
 */
export const useConfetti = () => {
  const triggerConfetti = (container: HTMLElement | null) => {
    if (!container) return;

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    const confettiPieces: ConfettiPiece[] = [];

    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
      const piece: ConfettiPiece = {
        id: `confetti-${i}`,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        opacity: 1,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 5 + 3,
      };
      confettiPieces.push(piece);
    }

    // Animation loop
    const animate = () => {
      confettiPieces.forEach((piece, index) => {
        // Physics
        piece.y += piece.vy;
        piece.x += piece.vx;
        piece.vy += 0.1; // Gravity
        piece.vx *= 0.99; // Air resistance
        piece.rotation += 5;
        piece.opacity -= 0.015;

        // Create element
        let el = document.getElementById(piece.id);
        if (!el) {
          el = document.createElement('div');
          el.id = piece.id;
          el.style.position = 'fixed';
          el.style.pointerEvents = 'none';
          el.style.fontSize = '20px';
          container.appendChild(el);
        }

        el.textContent = ['🎉', '✨', '🎊', '⭐', '🌟'][index % 5];
        el.style.left = `${piece.x}%`;
        el.style.top = `${piece.y}%`;
        el.style.transform = `rotate(${piece.rotation}deg) scale(${piece.scale})`;
        el.style.opacity = `${piece.opacity}`;
        el.style.zIndex = '9999';

        // Remove when done
        if (piece.y > 110 || piece.opacity <= 0) {
          el.remove();
          confettiPieces.splice(index, 1);
        }
      });

      if (confettiPieces.length > 0) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  return { triggerConfetti };
};
