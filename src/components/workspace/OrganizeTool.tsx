import React from 'react';
import { Download } from 'lucide-react';

export interface OrganizeToolProps {
  isProcessing: boolean;
  onProcess: () => void;
}

export const OrganizeTool: React.FC<OrganizeToolProps> = ({ isProcessing, onProcess }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
        Organize Pages
      </h4>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Drag, delete, rotate, or reorder pages in the left thumbnail panel. Use the dropdown above to switch to any of the 38 tools.
      </p>
      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Download size={14} />
        <span>Export Document</span>
      </button>
    </div>
  );
};
