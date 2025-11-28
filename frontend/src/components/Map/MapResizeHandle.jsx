import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

const MapResizeHandle = ({ isExpanded, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="absolute top-2 left-2 z-[1001] bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors"
      title={isExpanded ? 'Küçült' : 'Büyüt'}
    >
      {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </button>
  );
};

export default MapResizeHandle;


