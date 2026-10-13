import React from 'react';
import { Wrench } from 'lucide-react';

export interface RepairToolProps {
  isProcessing: boolean;
  onProcess: () => void;
}

export const RepairTool: React.FC<RepairToolProps> = ({ isProcessing, onProcess }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Wrench size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Repair Damaged PDF</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Rebuilds broken XREF cross-reference tables, stream lengths, and structural dictionaries.
      </p>

      <div className="glass-card" style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
        File health status: <strong style={{ color: '#10b981' }}>Stream Analyzed</strong>
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Wrench size={14} />
        <span>Repair & Reconstruct PDF</span>
      </button>
    </div>
  );
};
