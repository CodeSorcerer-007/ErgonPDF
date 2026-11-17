import React, { useState } from 'react';
import { X, Plus, Trash2, Download, FileCode, CheckCircle2, Building, User, Receipt } from 'lucide-react';
import { PDFEngineService } from '../services/pdfEngine';
import confetti from 'canvas-confetti';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdfInWorkspace: (pdfBuffer: ArrayBuffer, fileName: string) => void;
}

export const InvoiceBuilderModal: React.FC<InvoiceBuilderModalProps> = ({
  isOpen,
  onClose,
  onOpenPdfInWorkspace,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() =>
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );
  const [currency, setCurrency] = useState('$');

  // Seller & Buyer
  const [sellerName, setSellerName] = useState('Acme Corporation');
  const [sellerAddress, setSellerAddress] = useState('100 Innovation Way\nSan Francisco, CA 94105');
  const [sellerTaxId, setSellerTaxId] = useState('US-TAX-987654321');

  const [buyerName, setBuyerName] = useState('Global Logistics Ltd');
  const [buyerAddress, setBuyerAddress] = useState('456 Enterprise Blvd, Suite 200\nNew York, NY 10001');
  const [buyerTaxId, setBuyerTaxId] = useState('US-VAT-123456789');

  // Items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Software Architecture & Development', quantity: 40, unitPrice: 125 },
    { id: '2', description: 'Cloud Infrastructure & Security Audit', quantity: 1, unitPrice: 1500 },
  ]);

  const [taxRate, setTaxRate] = useState<number>(10);
  const [notes, setNotes] = useState('Payment is due within 14 days of invoice date. Thank you for your business!');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Math
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: 'New Service Item', quantity: 1, unitPrice: 100 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, val: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await PDFEngineService.generateInvoicePDF({
        invoiceNumber,
        date,
        dueDate,
        currency,
        seller: { name: sellerName, address: sellerAddress, taxId: sellerTaxId },
        buyer: { name: buyerName, address: buyerAddress, taxId: buyerTaxId },
        items: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.quantity * i.unitPrice,
        })),
        subtotal,
        taxRate,
        taxAmount,
        grandTotal,
        notes,
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      alert('Error generating invoice PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportXml = () => {
    try {
      const xmlStr = PDFEngineService.generateZUGFeRDXml({
        invoiceNumber,
        date,
        currency,
        seller: { name: sellerName, address: sellerAddress, taxId: sellerTaxId },
        buyer: { name: buyerName, address: buyerAddress, taxId: buyerTaxId },
        items: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.quantity * i.unitPrice,
        })),
        subtotal,
        taxRate,
        taxAmount,
        grandTotal,
      });

      const blob = new Blob([xmlStr], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factur-x_${invoiceNumber}.xml`;
      a.click();
      URL.revokeObjectURL(url);

      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      alert('Error exporting ZUGFeRD XML.');
    }
  };

  const handleOpenInWorkspace = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await PDFEngineService.generateInvoicePDF({
        invoiceNumber,
        date,
        dueDate,
        currency,
        seller: { name: sellerName, address: sellerAddress, taxId: sellerTaxId },
        buyer: { name: buyerName, address: buyerAddress, taxId: buyerTaxId },
        items: items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.quantity * i.unitPrice,
        })),
        subtotal,
        taxRate,
        taxAmount,
        grandTotal,
        notes,
      });

      onOpenPdfInWorkspace(pdfBytes.buffer as ArrayBuffer, `Invoice_${invoiceNumber}.pdf`);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error opening invoice in workspace.');
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
          maxWidth: '860px',
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
            <Receipt size={20} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Interactive Invoice & E-Invoice Generator
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Real-time math calculations with ZUGFeRD 2.2 / XRechnung compliance (100% offline).
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

        {/* Scrollable Form Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Metadata Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Invoice #</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  marginTop: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Issue Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  marginTop: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  marginTop: '4px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  marginTop: '4px',
                }}
              >
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="¥">¥ JPY</option>
              </select>
            </div>
          </div>

          {/* Seller / Buyer Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Seller */}
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Building size={14} color="var(--accent-primary)" />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Seller / Issuer (From)</span>
              </div>
              <input
                type="text"
                placeholder="Company Name"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              />
              <textarea
                rows={2}
                placeholder="Address & Contact"
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginBottom: '6px',
                  resize: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Tax / VAT ID (e.g. US-TAX-123)"
                value={sellerTaxId}
                onChange={(e) => setSellerTaxId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              />
            </div>

            {/* Buyer */}
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <User size={14} color="var(--accent-primary)" />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Client / Recipient (Bill To)</span>
              </div>
              <input
                type="text"
                placeholder="Client Name"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginBottom: '6px',
                }}
              />
              <textarea
                rows={2}
                placeholder="Client Address & Contact"
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginBottom: '6px',
                  resize: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Client Tax / VAT ID"
                value={buyerTaxId}
                onChange={(e) => setBuyerTaxId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Line Items & Deliverables</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', padding: '4px 8px', gap: '4px' }}
              >
                <Plus size={12} />
                <span>Add Item</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '4fr 1.2fr 2fr 2fr 36px',
                    gap: '8px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    value={item.description}
                    placeholder="Description"
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '8px', top: '7px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {currency}
                    </span>
                    <input
                      type="number"
                      value={item.unitPrice}
                      min={0}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      style={{
                        padding: '6px 8px 6px 20px',
                        width: '100%',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, textAlign: 'right', paddingRight: '6px' }}>
                    {currency}{(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length <= 1}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '6px', color: 'var(--error)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals & Terms */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', alignItems: 'start' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Payment Terms & Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  marginTop: '4px',
                  resize: 'none',
                }}
              />
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax Rate (%):</span>
                <input
                  type="number"
                  value={taxRate}
                  min={0}
                  max={100}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '60px',
                    padding: '3px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    textAlign: 'right',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax Amount:</span>
                <span>{currency}{taxAmount.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderTop: '1px solid var(--border-medium)',
                  paddingTop: '6px',
                  color: 'var(--accent-primary)',
                }}
              >
                <span>Grand Total:</span>
                <span>{currency}{grandTotal.toFixed(2)}</span>
              </div>
            </div>
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
            <span>ZUGFeRD 2.2 / Factur-X Ready (EN 16931)</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleExportXml}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <FileCode size={14} />
              <span>Export ZUGFeRD XML</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInWorkspace}
              disabled={isGenerating}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <span>Open in Workspace</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <Download size={14} />
              <span>Download PDF Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
