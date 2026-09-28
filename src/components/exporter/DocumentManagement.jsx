import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, Clock, ShieldCheck, AlertCircle, FileBarChart, Download, X } from 'lucide-react';

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([
    { id: 'INV-1029', type: 'Commercial Invoice', status: 'Verified', date: 'Oct 24, 2026', file: 'invoice_1029.pdf' },
    { id: 'PL-8821', type: 'Packing List', status: 'Pending Review', date: 'Oct 24, 2026', file: 'packing_list.pdf' },
  ]);
  
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('Commercial Invoice');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }
    
    setIsUploading(true);
    setTimeout(() => {
      setDocuments([
        ...documents,
        { 
          id: `DOC-${Math.floor(Math.random() * 10000)}`, 
          type: uploadType, 
          status: 'Pending Review', 
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 
          file: selectedFile.name 
        }
      ]);
      setIsUploading(false);
      setUploadModal(false);
      setSelectedFile(null);
    }, 1500);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      
      // Generate the report content based on current documents
      let reportContent = "=========================================\n";
      reportContent += "       CARGOSHARE COMPLIANCE REPORT      \n";
      reportContent += "=========================================\n";
      reportContent += `Generated On: ${new Date().toLocaleString()}\n\n`;
      reportContent += `Total Documents: ${documents.length}\n`;
      
      const verified = documents.filter(d => d.status === 'Verified').length;
      const pending = documents.filter(d => d.status === 'Pending Review').length;
      reportContent += `Verified: ${verified} | Pending: ${pending}\n\n`;
      
      reportContent += "--- Document Details ---\n";
      documents.forEach(doc => {
        reportContent += `ID: ${doc.id}\n`;
        reportContent += `Type: ${doc.type}\n`;
        reportContent += `File: ${doc.file}\n`;
        reportContent += `Status: ${doc.status}\n`;
        reportContent += `Date: ${doc.date}\n`;
        reportContent += "------------------------\n";
      });
      
      reportContent += "\nEnd of Report.";

      // Create a Blob and trigger download
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Compliance_Report_${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    }, 2000);
  };

  const getStatusColor = (status) => {
    if (status === 'Verified') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Pending Review') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'Rejected') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Docs & Customs</h1>
          <p className="text-slate-500 mt-2">Manage shipping documents, verify compliance, and track customs approvals.</p>
        </div>
        <button 
          onClick={() => setUploadModal(true)}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Upload className="w-5 h-5" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Document List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Uploaded Documents</h2>
              <span className="text-sm font-medium text-slate-500">{documents.length} files</span>
            </div>
            <div className="divide-y divide-slate-100">
              {documents.length > 0 ? documents.map(doc => (
                <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{doc.type}</h4>
                      <p className="text-sm text-slate-500">{doc.file} • Uploaded {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                    <button className="text-slate-400 hover:text-brand-600 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No documents uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status & Compliance Sidebar */}
        <div className="space-y-6">
          
          {/* Customs Clearance Status */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-500 rounded-full opacity-20 blur-3xl pointer-events-none"></div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" /> Customs Status
            </h3>
            
            <div className="space-y-6 relative">
              <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-700"></div>
              
              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-slate-900"></div>
                <p className="font-bold text-slate-100">Documents Submitted</p>
                <p className="text-xs text-slate-400 mt-1">All required files received</p>
              </div>
              
              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-1 w-5 h-5 rounded-full bg-brand-500 border-4 border-slate-900 animate-pulse"></div>
                <p className="font-bold text-slate-100">Verification in Progress</p>
                <p className="text-xs text-brand-200 mt-1">Checking origin certificates</p>
              </div>
              
              <div className="relative pl-8">
                <div className="absolute -left-[9px] top-1 w-5 h-5 rounded-full bg-slate-700 border-4 border-slate-900"></div>
                <p className="font-bold text-slate-400">Customs Approval</p>
                <p className="text-xs text-slate-500 mt-1">Pending verification</p>
              </div>
            </div>
          </div>

          {/* Compliance Report */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <FileBarChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Compliance Report</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Generate a comprehensive summary of all shipping documentation and customs clearance statuses for your records.</p>
            
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 
                ${isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'}`}
            >
              {isGenerating ? (
                <><div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> Generating...</>
              ) : (
                <><Download className="w-5 h-5" /> Generate Report</>
              )}
            </button>
          </div>
          
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">Upload Document</h3>
              <button onClick={() => setUploadModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Document Type</label>
                <select 
                  value={uploadType} 
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-700"
                >
                  <option value="Commercial Invoice">Commercial Invoice</option>
                  <option value="Packing List">Packing List</option>
                  <option value="Certificate of Origin">Certificate of Origin</option>
                  <option value="Bill of Lading">Bill of Lading</option>
                  <option value="Customs Declaration">Customs Declaration</option>
                </select>
              </div>

              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-brand-500 hover:bg-brand-50 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="w-16 h-16 bg-slate-100 group-hover:bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-brand-600 transition-colors" />
                </div>
                {selectedFile ? (
                  <p className="font-semibold text-brand-600 mb-1">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="font-semibold text-slate-700 mb-1">Click to browse or drag file here</p>
                    <p className="text-xs text-slate-500">Supports PDF, JPG, PNG (Max 10MB)</p>
                  </>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isUploading}
                className={`w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                  ${isUploading ? 'bg-brand-400 text-white cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg'}`}
              >
                {isUploading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Uploading...</>
                ) : 'Confirm Upload'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
