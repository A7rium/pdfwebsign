import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import Navbar from '../components/Navbar';
import PDFViewer from '../components/PDFViewer';
import Sidebar from '../components/Sidebar';
import FieldsPanel from '../components/FieldsPanel';
import { useDocumentState } from '../hooks/useDocumentState';
import HelpButton from '../components/HelpButton';

const Index = () => {
  const {
    pdfFile,
    pdfName,
    numPages,
    currentPage,
    pageOrder,
    fields,
    signees,
    isAllSigned,
    setPdfFile,
    setPdfName,
    setNumPages,
    setCurrentPage,
    setPageOrder,
    addField,
    removeField,
    addSignee,
    removeSignee,
    checkAllSigned,
  } = useDocumentState();

  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfFile(e.target.result);
        setPdfName(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageOrder(Array.from({ length: numPages }, (_, i) => i + 1));
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      <Navbar 
        pdfName={pdfName} 
        currentPage={currentPage} 
        numPages={numPages} 
        onFileChange={onFileChange}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={toggleSidebar}
      />
      <div className="flex flex-1 overflow-hidden">
        {pdfFile && isSidebarVisible && (
          <Sidebar
            file={pdfFile}
            pages={pageOrder}
            onPageClick={(pageNumber) => setCurrentPage(pageNumber)}
            setPageOrder={setPageOrder}
          />
        )}
        <div className="flex-1 p-4 overflow-hidden relative">
          {pdfFile ? (
            <div className="flex h-full">
              <PDFViewer
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                pageOrder={pageOrder}
                fields={fields}
                removeField={removeField}
              />
              <FieldsPanel
                addField={addField}
                fields={fields}
                removeField={removeField}
                addSignee={addSignee}
                removeSignee={removeSignee}
                signees={signees}
                isAllSigned={isAllSigned}
                checkAllSigned={checkAllSigned}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                Upload PDF
                <input type="file" onChange={onFileChange} accept="application/pdf" className="hidden" />
              </label>
            </div>
          )}
        </div>
      </div>
      <HelpButton />
    </div>
  );
};

export default Index;
