import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { applicationService, documentService } from '../services/api';

export const DocumentIntelligencePage: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ocrRunning, setOcrRunning] = useState(false);

  // Field editing state
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [editedFields, setEditedFields] = useState<any>({});

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await applicationService.list({ limit: 50 });
      setApplications(data.applications || []);
      // Pick first doc with extractions if available
      for (const app of data.applications || []) {
        if (app.documents && app.documents.length > 0) {
          const detailed = await applicationService.getById(app.id);
          if (detailed.documents && detailed.documents.length > 0) {
            setSelectedDoc(detailed.documents[0]);
            if (detailed.documents[0].extractions?.[0]?.extractedFieldsJson) {
              setEditedFields(JSON.parse(detailed.documents[0].extractions[0].extractedFieldsJson));
            }
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSelectDoc = async (doc: any, appId: string) => {
    const detailed = await applicationService.getById(appId);
    const target = detailed.documents.find((d: any) => d.id === doc.id);
    setSelectedDoc(target || doc);
    setIsEditingFields(false);
    if (target?.extractions?.[0]?.extractedFieldsJson) {
      setEditedFields(JSON.parse(target.extractions[0].extractedFieldsJson));
    } else {
      setEditedFields({});
    }
  };

  const handleRunOcr = async () => {
    if (!selectedDoc) return;
    setOcrRunning(true);
    try {
      const res = await documentService.triggerOcr(selectedDoc.id);
      setSelectedDoc((prev: any) => ({
        ...prev,
        status: 'OCR_COMPLETED',
        extractions: [
          {
            id: res.extractionId,
            rawText: res.text,
            extractedFieldsJson: JSON.stringify(res.fields),
            confidenceScore: res.confidence,
            ocrEngine: res.engine,
          },
        ],
      }));
      setEditedFields(res.fields);
    } catch (err) {
      console.error(err);
    } finally {
      setOcrRunning(false);
    }
  };

  const handleSaveFields = async () => {
    if (!selectedDoc) return;
    try {
      await documentService.updateFields(selectedDoc.id, editedFields, 'Officer manually verified fields');
      setIsEditingFields(false);
    } catch (err) {
      console.error(err);
    }
  };

  const allDocuments: Array<{ doc: any; app: any }> = [];
  applications.forEach((app) => {
    (app.documents || []).forEach((doc: any) => {
      allDocuments.push({ doc, app });
    });
  });

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Document Intelligence & OCR Scrutiny Studio
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Optical character recognition, field detection, confidence scores & evidence extraction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: Document Navigator (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Document Vault ({allDocuments.length} files)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {allDocuments.map(({ doc, app }) => (
              <div
                key={doc.id}
                onClick={() => handleSelectDoc(doc, app.id)}
                className={`p-3 text-xs cursor-pointer transition-colors ${
                  selectedDoc?.id === doc.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {doc.originalName || doc.documentType}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      doc.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : doc.status === 'FLAGGED'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {doc.documentType.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  App: {app.applicationNumber} • {app.institution?.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: OCR Inspector (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col p-6 space-y-6">
          {selectedDoc ? (
            <>
              {/* Document Overview Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedDoc.originalName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {selectedDoc.documentType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    SHA-256: {selectedDoc.checksumSha256}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRunOcr}
                    disabled={ocrRunning}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${ocrRunning ? 'animate-spin' : ''}`} />
                    <span>{ocrRunning ? 'Extracting...' : 'Re-Run OCR'}</span>
                  </button>

                  <a
                    href={documentService.downloadUrl(selectedDoc.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Vault File</span>
                  </a>
                </div>
              </div>

              {/* Detected Key-Value Regulatory Entities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Detected Structured Regulatory Entities
                  </h3>
                  {!isEditingFields ? (
                    <button
                      onClick={() => setIsEditingFields(true)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> Edit Fields
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveFields}
                        className="text-xs text-emerald-600 font-semibold flex items-center"
                      >
                        <Check className="w-3 h-3 mr-1" /> Save
                      </button>
                      <button
                        onClick={() => setIsEditingFields(false)}
                        className="text-xs text-slate-400 flex items-center"
                      >
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(editedFields || {}).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      {isEditingFields ? (
                        <input
                          type="text"
                          value={String(val)}
                          onChange={(e) =>
                            setEditedFields({ ...editedFields, [key]: e.target.value })
                          }
                          className="mt-1 w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded"
                        />
                      ) : (
                        <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block truncate">
                          {String(val)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw OCR Text Recognition Stream */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Extracted Text Stream
                  </h3>
                  {selectedDoc.extractions?.[0] && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Engine: {selectedDoc.extractions[0].ocrEngine} • Confidence: {(selectedDoc.extractions[0].confidenceScore * 100).toFixed(1)}%
                    </span>
                  )}
                </div>

                <div className="flex-1 max-h-72 overflow-y-auto p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed border border-slate-800">
                  {selectedDoc.extractions?.[0]?.rawText || (
                    <span className="text-slate-500 italic">
                      No text extraction processed yet. Click 'Re-Run OCR' to process this document.
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a document from the left vault to inspect OCR extractions and field bindings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
