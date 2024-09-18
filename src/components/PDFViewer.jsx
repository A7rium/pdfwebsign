import React from 'react';
import { Document, Page } from 'react-pdf';
import DraggableField from './DraggableField';

const PDFViewer = ({ file, onLoadSuccess, pageOrder, fields, removeField }) => {
  return (
    <div className="flex-1 border border-purple-200 rounded-lg overflow-hidden bg-white shadow-lg">
      <div className="overflow-y-auto h-full">
        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
          className="flex flex-col items-center"
        >
          {pageOrder.map((pageNumber, index) => (
            <div id={`page_${pageNumber}`} key={`page_${pageNumber}`} className="mb-8 relative">
              <Page
                pageNumber={pageNumber}
                width={Math.min(800, window.innerWidth * 0.6)}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
              {fields.map((field, fieldIndex) => (
                <DraggableField
                  key={fieldIndex}
                  field={field}
                  index={fieldIndex}
                  onRemove={removeField}
                />
              ))}
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;