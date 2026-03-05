'use client';
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ fileUrl, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoadingPDF, setIsLoadingPDF] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') changePage(1);
      if (e.key === 'ArrowLeft') changePage(-1);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoadingPDF(false);
  }

  const changePage = (offset) => {
    setPageNumber(prev => {
      const next = prev + offset;
      if (next < 1 || (numPages && next > numPages)) return prev;
      return next;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden"
    >
      {}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
      >
        <X size={32} />
      </button>

      {}
      {pageNumber > 1 && (
        <button 
          onClick={() => changePage(-1)}
          className="absolute left-4 z-50 text-white/30 hover:text-white transition-colors p-4 hover:bg-white/5 rounded-full"
        >
          <ChevronLeft size={64} />
        </button>
      )}

      {}
      <div className="h-full w-full flex items-center justify-center relative">
        {isLoadingPDF && (
          <div className="absolute inset-0 flex items-center justify-center text-emerald-500 z-20">
            <Loader2 className="animate-spin" size={60} />
          </div>
        )}
        
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex items-center justify-center w-full h-full"
          loading={null}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            height={typeof window !== 'undefined' ? window.innerHeight : 600}
            className="shadow-none object-contain max-w-full" 
          />
        </Document>
      </div>

      {}
      {numPages && pageNumber < numPages && (
        <button 
          onClick={() => changePage(1)}
          className="absolute right-4 z-50 text-white/30 hover:text-white transition-colors p-4 hover:bg-white/5 rounded-full"
        >
          <ChevronRight size={64} />
        </button>
      )}

      {}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-sm text-white/70 px-4 py-1 rounded-full text-sm font-mono select-none border border-white/10">
        {pageNumber} / {numPages || '--'}
      </div>
    </motion.div>
  );
}