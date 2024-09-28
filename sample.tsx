/**
 * it is only a sample
 * i have not tested it yet
 */

import React, { useEffect, useRef } from 'react';
import Bubble, { BubbleOptions } from './Bubble';
import styles from './SamplePage.module.css';
import { data } from './data';

const SamplePage: React.FC = () => {
  const bubblesRef = useRef<HTMLDivElement>(null);

  const options: BubbleOptions = {
    size: 120,
    minSize: 20,
    gutter: 8,
    provideProps: false,
    numCols: 5,
    fringeWidth: 100,
    yRadius: 200,
    xRadius: 200,
    cornerRadius: 50,
    showGuides: false,
    compact: true,
    gravitation: 5,
    shape: 'ellipse',
  };

  useEffect(() => {
    const bubbles = bubblesRef.current;
    if (!bubbles) return;

    const dragspeed = 1.5;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      isDown = true;
      bubbles.classList.add(styles.active);
      startX = e.pageX - bubbles.offsetLeft;
      startY = e.pageY - bubbles.offsetTop;
      scrollLeft = bubbles.scrollLeft;
      scrollTop = bubbles.scrollTop;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - bubbles.offsetLeft;
      const y = e.pageY - bubbles.offsetTop;
      const walkX = (x - startX) * dragspeed;
      const walkY = (y - startY) * dragspeed;
      bubbles.scrollLeft = scrollLeft - walkX;
      bubbles.scrollTop = scrollTop - walkY;
    };

    const handleMouseUp = () => {
      isDown = false;
      bubbles.classList.remove(styles.active);
    };

    const handleMouseLeave = () => {
      isDown = false;
      bubbles.classList.remove(styles.active);
    };

    bubbles.addEventListener('mousedown', handleMouseDown);
    bubbles.addEventListener('mousemove', handleMouseMove);
    bubbles.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      bubbles.removeEventListener('mousedown', handleMouseDown);
      bubbles.removeEventListener('mousemove', handleMouseMove);
      bubbles.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const children = data.map((item) => (
    <div key={item.id} className={styles.child}>
      {item.content}
    </div>
  ));

  return (
    <div className={styles.container}>
      <BubbleUI
        ref={bubblesRef}
        options={options}
        className={styles.bubbleUI}
      >
        {children}
      </BubbleUI>
    </div>
  );
};

export default SamplePage;
