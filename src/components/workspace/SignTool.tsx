import React from 'react';
import { PenTool, Download } from 'lucide-react';
import type { PlacedSignature } from '../../types/pdf';

export interface SignToolProps {
  placedSignatures: PlacedSignature[];
  onOpenSignatureModal: () => void;
  isProcessing?: boolean;
  onProcess?: () => void;
}

export const SignTool: React.FC<SignToolProps> = ({
  placedSignatures,
  onOpenSignatureModal,
  isProcessing = false,
  onProcess,
}) => {
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
        className="btn btn-secondary btn-sm"
        style={{ width: '100%', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <PenTool size={14} />
        <span>Create / Add Signature</span>
      </button>

      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
        Placed on this document: {placedSignatures.length} signature(s)
      </span>

      {onProcess && (
        <button
          type="button"
          onClick={onProcess}
          disabled={isProcessing || placedSignatures.length === 0}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Download size={14} />
          <span>Burn Signatures & Download PDF</span>
        </button>
      )}

      {placedSignatures.length === 0 && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
          Click "Create / Add Signature" to stamp a signature onto the canvas before exporting.
        </p>
      )}
    </div>
  );
};
