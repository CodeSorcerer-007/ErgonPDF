import React from 'react';
import { ShieldCheck, Trash2 } from 'lucide-react';

export interface MetadataToolProps {
  metadataFields: {
    title: string;
    author: string;
    subject: string;
  };
  onMetadataFieldsChange: (fields: { title: string; author: string; subject: string }) => void;
}

export const MetadataTool: React.FC<MetadataToolProps> = ({
  metadataFields,
  onMetadataFieldsChange,
}) => {
  const handleClearAll = () => {
    onMetadataFieldsChange({ title: '', author: '', subject: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
        Document Metadata
      </h4>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Inspect, edit, or sanitize embedded PDF document properties.
      </p>

      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Title
        </label>
        <input
          type="text"
          value={metadataFields.title}
          onChange={(e) => onMetadataFieldsChange({ ...metadataFields, title: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            marginTop: '4px',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Author
        </label>
        <input
          type="text"
          value={metadataFields.author}
          onChange={(e) => onMetadataFieldsChange({ ...metadataFields, author: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            marginTop: '4px',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Subject
        </label>
        <input
          type="text"
          value={metadataFields.subject}
          onChange={(e) => onMetadataFieldsChange({ ...metadataFields, subject: e.target.value })}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            marginTop: '4px',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        <button
          type="button"
          onClick={handleClearAll}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%' }}
        >
          <ShieldCheck size={14} color="#10b981" />
          <span>1-Click Sanitize All</span>
        </button>

        <button
          type="button"
          onClick={handleClearAll}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', color: 'var(--text-muted)' }}
        >
          <Trash2 size={13} />
          <span>Clear All Metadata</span>
        </button>
      </div>
    </div>
  );
};
