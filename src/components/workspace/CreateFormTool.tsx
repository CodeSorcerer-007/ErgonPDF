import React from 'react';
import { CheckSquare } from 'lucide-react';
import { PDFEngineService } from '../../services/pdfEngine';
import type { PDFDocumentState } from '../../types/pdf';

export interface CreateFormToolProps {
  docState: PDFDocumentState;
  currentPageNum: number;
  formFieldState: { type: 'text' | 'checkbox'; name: string };
  onFormFieldStateChange: (state: { type: 'text' | 'checkbox'; name: string }) => void;
  onUpdateDocState: (newDoc: PDFDocumentState) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setProcessingStatus: (status: string) => void;
}

export const CreateFormTool: React.FC<CreateFormToolProps> = ({
  docState,
  currentPageNum,
  formFieldState,
  onFormFieldStateChange,
  onUpdateDocState,
  isProcessing,
  setIsProcessing,
  setProcessingStatus,
}) => {
  const handleAddField = async () => {
    setIsProcessing(true);
    setProcessingStatus('Adding form fields…');
    try {
      const updated = await PDFEngineService.addInteractiveFormFields(docState.arrayBuffer, [
        {
          type: formFieldState.type,
          name: formFieldState.name,
          pageNumber: currentPageNum,
          xPercent: 30,
          yPercent: 40,
          widthPercent: formFieldState.type === 'checkbox' ? 5 : 40,
          heightPercent: formFieldState.type === 'checkbox' ? 3 : 5,
        },
      ]);
      onUpdateDocState({ ...docState, arrayBuffer: updated.buffer as ArrayBuffer });
      alert(`Added interactive ${formFieldState.type} field to page ${currentPageNum}!`);
    } catch (err) {
      console.error('Failed to add form field:', err);
      alert('Could not add interactive form field to this document.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CheckSquare size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Interactive Form Builder</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Add fillable form controls directly onto this page.
      </p>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Field Name / ID</label>
        <input
          type="text"
          value={formFieldState.name}
          onChange={(e) => onFormFieldStateChange({ ...formFieldState, name: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            marginTop: '4px',
            fontSize: '13px',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Field Type</label>
        <select
          value={formFieldState.type}
          onChange={(e) => onFormFieldStateChange({ ...formFieldState, type: e.target.value as any })}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            marginTop: '4px',
            fontSize: '13px',
          }}
        >
          <option value="text">Text Input Field</option>
          <option value="checkbox">Checkbox</option>
        </select>
      </div>

      <button
        type="button"
        onClick={handleAddField}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <CheckSquare size={14} />
        <span>Add Field to Current Page</span>
      </button>
    </div>
  );
};
