import React, { useRef, useState } from 'react';
import { parseCSV, buildPayloadData, validatePayload, formatAmount } from '../utils/csv';
import { PayloadData } from '../types';

interface CSVUploadProps {
  onDataLoaded: (data: PayloadData) => void;
  onError: (error: string) => void;
}

export default function CSVUpload({ onDataLoaded, onError }: CSVUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PayloadData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      const err = 'Please upload a CSV file';
      onError(err);
      setErrors([err]);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const text = await file.text();
      const entries = parseCSV(text);
      const data = buildPayloadData(entries);
      const validation = validatePayload(data);

      if (!validation.valid) {
        setErrors(validation.errors);
        onError(validation.errors[0]);
        setLoading(false);
        return;
      }

      setPreview(data);
      onDataLoaded(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse CSV';
      setErrors([message]);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleClick = () => fileInputRef.current?.click();

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={handleClick}
        className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
      >
        <p className="text-gray-400 mb-2">Drag and drop your payroll CSV here</p>
        <p className="text-sm text-gray-500">or click to select file</p>
        {loading && <p className="text-blue-400 mt-2">Processing...</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      <div className="p-4 bg-slate-700 rounded-lg text-sm text-gray-400">
        <p className="font-medium mb-2">Expected CSV format:</p>
        <code className="text-xs text-gray-300">recipient_address,amount,did,tax_jurisdiction</code>
      </div>

      {errors.length > 0 && (
        <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-200 font-medium mb-2">Validation Errors:</p>
          {errors.map((err, i) => (
            <p key={i} className="text-red-300 text-sm">
              • {err}
            </p>
          ))}
        </div>
      )}

      {preview && errors.length === 0 && (
        <div className="p-4 bg-green-900 border border-green-700 rounded-lg">
          <p className="text-green-200 font-medium mb-4">✓ CSV Loaded Successfully</p>
          <div className="space-y-2 text-sm text-green-300">
            <p>Recipients: {preview.recipientCount}</p>
            <p>Total Amount: {formatAmount(preview.totalAmount)} XLM</p>
            <div className="mt-4 max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-green-700">
                    <th className="text-left py-2">Address</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.entries.slice(0, 10).map((entry, i) => (
                    <tr key={i} className="border-b border-green-800">
                      <td className="py-1 truncate">{entry.recipient_address.slice(0, 20)}...</td>
                      <td className="text-right">{entry.amount} XLM</td>
                    </tr>
                  ))}
                  {preview.entries.length > 10 && (
                    <tr>
                      <td colSpan={2} className="text-center py-2 text-green-400">
                        +{preview.entries.length - 10} more recipients
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
