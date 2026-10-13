import React from 'react';
import { PenTool } from 'lucide-react';
import type { PlacedSignature } from '../../types/pdf';

export interface SignToolProps {
  placedSignatures: PlacedSignature[];
  onOpenSignatureModal: () => void;
}

export const SignTool: React.FC<SignToolProps> = ({ placedSignatures, onOpenSignatureModal }) => {
  return (
    <div>
      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
        Sign Document
      </h4>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Create or upload a signature and place it on any page.
      </p>

      <button
        type="button"
        onClick={onOpenSignatureModal}
        className="btn btn-primary btn-sm"
        style={{ width: '100%', marginBottom: '12px' }}
      >
        <PenTool size={14} />
        <span>Create / Add Signature</span>
      </button>

      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Placed on this document: {placedSignatures.length} signature(s)
      </span>
    </div>
  );
};
