import React from 'react';

export interface BubbleData {
  id: string;
  content: React.ReactNode;
}

export const data: BubbleData[] = [
  {
    id: 'bubble1',
    content: (
      <div style={{ backgroundColor: '#ff7675', borderRadius: '50%', width: '100%', height: '100%' }}>
        <p style={{ color: '#000000', textAlign: 'center', lineHeight: '100px' }}>Bubble 1</p>
      </div>
    ),
  },
  {
    id: 'bubble2',
    content: (
      <div style={{ backgroundColor: '#74b9ff', borderRadius: '50%', width: '100%', height: '100%' }}>
        <p style={{ color: '#000000', textAlign: 'center', lineHeight: '100px' }}>Bubble 2</p>
      </div>
    ),
  },
  // Add more bubbles as needed
];