import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import PDFSidebar from '../components/PDFSidebar';
import Navbar from '../components/Navbar';
import { PDFDocument } from 'pdf-lib';
import { FileIcon, PenIcon, CalendarIcon, CheckSquareIcon, PlusCircleIcon, TrashIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import HelpButton from '../components/HelpButton';
import Draggable from 'react-draggable';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DragDropArea = ({ onFileChange }) => {
  // ... (existing DragDropArea component code)
};

const SignatureCanvas = ({ onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = '#000000';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const context = canvas.getContext('2d');
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const signatureImage = canvas.toDataURL();
    onSave(signatureImage);
  };

  return (
    <div className="p-4">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="border border-gray-300"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      <div className="mt-4 flex justify-between">
        <Button onClick={handleSave}>Save Signature</Button>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
};

const SignatureField = ({ onAdd }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState(null);

  const handleOpenDrawing = () => {
    setIsDrawing(true);
  };

  const handleSaveSignature = (signatureImage) => {
    setSignature(signatureImage);
    setIsDrawing(false);
    onAdd({ type: 'signature', value: signatureImage });
  };

  const handleCloseDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="mb-2">
      <Button onClick={handleOpenDrawing}>Add Signature</Button>
      <Dialog open={isDrawing} onOpenChange={setIsDrawing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Draw Your Signature</DialogTitle>
          </DialogHeader>
          <SignatureCanvas onSave={handleSaveSignature} onClose={handleCloseDrawing} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InitialsField = ({ onAdd }) => {
  const [initials, setInitials] = useState('');

  return (
    <div className="flex items-center space-x-2 mb-2">
      <Input
        type="text"
        placeholder="Initials"
        value={initials}
        onChange={(e) => setInitials(e.target.value)}
      />
      <Button onClick={() => {
        if (initials) {
          onAdd({ type: 'initials', value: initials });
          setInitials('');
        }
      }}>Add</Button>
    </div>
  );
};

const TextField = ({ onAdd }) => {
  const [text, setText] = useState('');

  return (
    <div className="flex items-center space-x-2 mb-2">
      <Input
        type="text"
        placeholder="Text Field"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Button onClick={() => {
        if (text) {
          onAdd({ type: 'text', value: text });
          setText('');
        }
      }}>Add</Button>
    </div>
  );
};

const DateField = ({ onAdd }) => {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <Button onClick={() => onAdd({ type: 'date', value: new Date().toISOString() })}>
        Add Date Field
      </Button>
    </div>
  );
};

const CheckboxField = ({ onAdd }) => {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <Button onClick={() => onAdd({ type: 'checkbox', value: false })}>
        Add Checkbox
      </Button>
    </div>
  );
};

const DraggableField = ({ field, index, onRemove }) => {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x: 0, y: 0 }}
      bounds="parent"
    >
      <div ref={nodeRef} className="absolute cursor-move">
        <div className="bg-white border border-gray-300 p-2 rounded shadow-md">
          {field.type === 'signature' && <img src={field.value} alt="Signature" className="w-32 h-16 object-contain" />}
          {field.type === 'initials' && <span className="font-bold">{field.value}</span>}
          {field.type === 'text' && <span>{field.value}</span>}
          {field.type === 'date' && <CalendarIcon />}
          {field.type === 'checkbox' && <CheckSquareIcon />}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0"
            onClick={() => onRemove(index)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Draggable>
  );
};

const Index = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageOrder, setPageOrder] = useState([]);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [saveAsFileName, setSaveAsFileName] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [signatureFields, setSignatureFields] = useState([]);
  const [isInviteSigneesModalOpen, setIsInviteSigneesModalOpen] = useState(false);
  const [signees, setSignees] = useState([]);
  const mainContentRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(URL.createObjectURL(file));
      setPdfName(file.name);
      setCurrentPage(1);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageOrder(Array.from({ length: numPages }, (_, i) => i + 1));
  };

  const scrollToPage = (pageNumber) => {
    const pageElement = document.getElementById(`page_${pageNumber}`);
    if (pageElement && mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: pageElement.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newPageOrder = Array.from(pageOrder);
    const [reorderedItem] = newPageOrder.splice(result.source.index, 1);
    newPageOrder.splice(result.destination.index, 0, reorderedItem);

    setPageOrder(newPageOrder);
  };

  const onDeletePage = async (index) => {
    // ... (existing onDeletePage function code)
  };

  const onSave = async (saveAs = false) => {
    // ... (existing onSave function code)
  };

  const handleSaveAs = () => {
    // ... (existing handleSaveAs function code)
  };

  const onMerge = async (event) => {
    // ... (existing onMerge function code)
  };

  const handleTitleChange = (newTitle) => {
    setPdfName(newTitle);
  };

  const addSignatureField = (field) => {
    setSignatureFields([...signatureFields, field]);
  };

  const removeSignatureField = (index) => {
    const newFields = [...signatureFields];
    newFields.splice(index, 1);
    setSignatureFields(newFields);
  };

  const handleInviteSignees = () => {
    setIsInviteSigneesModalOpen(true);
  };

  const addSignee = (signee) => {
    setSignees([...signees, signee]);
  };

  const removeSignee = (index) => {
    const newSignees = [...signees];
    newSignees.splice(index, 1);
    setSignees(newSignees);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        const { scrollTop, clientHeight } = mainContentRef.current;
        const pageElements = document.querySelectorAll('[id^="page_"]');
        for (let i = 0; i < pageElements.length; i++) {
          const element = pageElements[i];
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.clientHeight;
          if (scrollTop >= elementTop - clientHeight / 2 && scrollTop < elementBottom - clientHeight / 2) {
            setCurrentPage(i + 1);
            break;
          }
        }
      }
    };

    const contentElement = mainContentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pageOrder]);

  return (
    <>
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 to-pink-100">
        <Navbar 
          pdfName={pdfName} 
          currentPage={currentPage} 
          numPages={numPages} 
          onFileChange={onFileChange}
          onSave={() => onSave(false)}
          onSaveAs={() => onSave(true)}
          onMerge={onMerge}
          showUploadButton={!!pdfFile}
          onTitleChange={handleTitleChange}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={toggleSidebar}
          onInviteSignees={handleInviteSignees}
        />
        <div className="flex flex-1 overflow-hidden">
          {pdfFile && isSidebarVisible && (
            <PDFSidebar
              file={pdfFile}
              pages={pageOrder}
              onPageClick={scrollToPage}
              onDragEnd={onDragEnd}
              onDeletePage={onDeletePage}
            />
          )}
          <div className="flex-1 p-4 overflow-hidden relative">
            {pdfFile ? (
              <div className="flex h-full">
                <div className="flex-1 border border-purple-200 rounded-lg overflow-hidden bg-white shadow-lg">
                  <div ref={mainContentRef} className="overflow-y-auto h-full">
                    <Document
                      file={pdfFile}
                      onLoadSuccess={onDocumentLoadSuccess}
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
                          {signatureFields.map((field, fieldIndex) => (
                            <DraggableField
                              key={fieldIndex}
                              field={field}
                              index={fieldIndex}
                              onRemove={removeSignatureField}
                            />
                          ))}
                        </div>
                      ))}
                    </Document>
                  </div>
                </div>
                <div className="w-64 ml-4 bg-white p-4 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Add Fields</h3>
                  <SignatureField onAdd={addSignatureField} />
                  <InitialsField onAdd={addSignatureField} />
                  <TextField onAdd={addSignatureField} />
                  <DateField onAdd={addSignatureField} />
                  <CheckboxField onAdd={addSignatureField} />
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Added Fields</h4>
                    {signatureFields.map((field, index) => (
                      <div key={index} className="flex justify-between items-center mb-2">
                        <span>{field.type}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSignatureField(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <DragDropArea onFileChange={onFileChange} />
            )}
          </div>
        </div>
      </div>
      <Dialog open={isSaveAsModalOpen} onOpenChange={setIsSaveAsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save As</DialogTitle>
          </DialogHeader>
          <Input
            value={saveAsFileName}
            onChange={(e) => setSaveAsFileName(e.target.value)}
            placeholder="Enter file name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && saveAsFileName.trim()) {
                handleSaveAs();
              }
            }}
          />
          <DialogFooter>
            <Button onClick={() => setIsSaveAsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAs}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isInviteSigneesModalOpen} onOpenChange={setIsInviteSigneesModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Signees</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input id="name" placeholder="Name" className="col-span-2" />
              <Input id="email" placeholder="Email" className="col-span-2" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => {
              const name = document.getElementById('name').value;
              const email = document.getElementById('email').value;
              if (name && email) {
                addSignee({ name, email });
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
              }
            }}>Add Signee</Button>
          </DialogFooter>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Invited Signees</h4>
            {signees.map((signee, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <span>{signee.name} ({signee.email})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSignee(index)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <HelpButton />
    </>
  );
};

export default Index;