import React, { useState } from 'react';
import { X, Download, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import { PDFEngineService } from '../services/pdfEngine';
import confetti from 'canvas-confetti';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdfInWorkspace: (pdfBuffer: ArrayBuffer, fileName: string) => void;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  onOpenPdfInWorkspace,
}) => {
  const [applicantName, setApplicantName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@example.com');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [location, setLocation] = useState('San Francisco, CA');
  const [targetRole, setTargetRole] = useState('Lead Systems Architect');
  const [targetCompany, setTargetCompany] = useState('Anthropic Labs');
  const [skillsText, setSkillsText] = useState('TypeScript, Rust, Distributed Systems, WebAssembly, Security Architecture, CI/CD');
  const [coverLetter, setCoverLetter] = useState(
    `I am writing to express my enthusiastic interest in the Lead Systems Architect position. With over a decade of hands-on experience designing high-throughput, privacy-first software architectures, I have consistently led cross-functional engineering initiatives that deliver resilient, mission-critical solutions.\n\nIn my previous roles, I architected client-side execution frameworks that eliminated sensitive data leakage while decreasing computational latency by over 40%. My philosophy centers around clean code invariants, developer autonomy, and relentless user privacy.\n\nI welcome the opportunity to discuss how my technical leadership and architectural rigor can contribute to your engineering milestones.`
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
      const pdfBytes = await PDFEngineService.generateJobApplicationPDF({
        applicantName,
        email,
        phone,
        location,
        targetRole,
        targetCompany,
        coverLetter,
        skills,
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Application_${applicantName.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      alert('Error generating application PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenWorkspace = async () => {
    setIsGenerating(true);
    try {
      const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
      const pdfBytes = await PDFEngineService.generateJobApplicationPDF({
        applicantName,
        email,
        phone,
        location,
        targetRole,
        targetCompany,
        coverLetter,
        skills,
      });

      onOpenPdfInWorkspace(
        pdfBytes.buffer as ArrayBuffer,
        `Application_${applicantName.replace(/\s+/g, '_')}.pdf`
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error opening application in workspace.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 140,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={20} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Job Application & Cover Letter Builder
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Generate an executive vector PDF application letter ready to submit.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Target Position / Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Target Organization / Company</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Cover Letter Text</label>
            <textarea
              rows={8}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
                lineHeight: 1.5,
                marginTop: '4px',
                resize: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Core Skills & Proficiencies (comma-separated)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                marginTop: '4px',
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--success)' }}>
            <CheckCircle2 size={13} />
            <span>Ready for ATS & Executive Review</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleOpenWorkspace}
              disabled={isGenerating}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <ArrowRight size={14} />
              <span>Open in Workspace</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Download size={14} />
              <span>Generate & Download Application PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
