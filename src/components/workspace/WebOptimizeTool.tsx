import React from 'react';
import { Zap } from 'lucide-react';

export interface WebOptimizeToolProps {
  isProcessing: boolean;
  onProcess: () => void;
}

export const WebOptimizeTool: React.FC<WebOptimizeToolProps> = ({ isProcessing, onProcess }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Web Fast View (Linearize)</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Re-indexes indirect objects into compressed streams for instantaneous browser streaming without waiting for full download.
      </p>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Zap size={14} />
        <span>Linearize Document</span>
      </button>
    </div>
  );
};
