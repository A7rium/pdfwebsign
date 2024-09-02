import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import PDFSidebar from '../components/PDFSidebar';
import Navbar from '../components/Navbar';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FileIcon, PenIcon, CalendarIcon, CheckSquareIcon, PlusCircleIcon, TrashIcon, TypeIcon, UserIcon, SendIcon } from 'lucide-react';
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
  // ... (existing SignatureCanvas component code)
};

const InputField = ({ type, onAdd, onClose, signees }) => {
  // ... (existing InputField component code)
};

const DraggableField = ({ field, index, onRemove }) => {
  // ... (existing DraggableField component code)
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
  const [fields, setFields] = useState([]);
  const [isAddESignModalOpen, setIsAddESignModalOpen] = useState(false);
  const [signees, setSignees] = useState([]);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [currentFieldType, setCurrentFieldType] = useState(null);
  const [isAllSigned, setIsAllSigned] = useState(false);
  const mainContentRef = useRef(null);

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

  const scrollToPage = (pageNumber) => {
    const pageElement = document.getElementById(`page_${pageNumber}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = Array.from(pageOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);
    setPageOrder(newOrder);
  };

  const onDeletePage = (index) => {
    const newOrder = pageOrder.filter((_, i) => i !== index);
    setPageOrder(newOrder);
  };

  const onSave = async (saveAs = false) => {
    // Implement save functionality
  };

  const handleSaveAs = () => {
    // Implement save as functionality
  };

  const onMerge = (event) => {
    // Implement merge functionality
  };

  const handleTitleChange = (newTitle) => {
    setPdfName(newTitle);
  };

  const addField = (field) => {
    setFields([...fields, field]);
    setIsAddFieldModalOpen(false);
  };

  const removeField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleAddField = (type) => {
    setCurrentFieldType(type);
    setIsAddFieldModalOpen(true);
  };

  const handleAddESign = () => {
    setIsAddESignModalOpen(true);
  };

  const addSignee = (signee) => {
    setSignees([...signees, signee]);
  };

  const removeSignee = (index) => {
    const newSignees = [...signees];
    newSignees.splice(index, 1);
    setSignees(newSignees);
  };

  const checkAllSigned = () => {
    const requiredFields = signees.length * 2; // Assuming each signee needs to add at least 2 fields (e.g., signature and name)
    const actualFields = fields.length;
    setIsAllSigned(actualFields >= requiredFields);
  };

  useEffect(() => {
    checkAllSigned();
  }, [fields, signees]);

  const generateESignaturePage = async () => {
    if (!isAllSigned) {
      alert("Not all signees have completed their required fields.");
      return;
    }

    const pdfDoc = await PDFDocument.load(await fetch(pdfFile).then(res => res.arrayBuffer()));
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('E-Signature Details', {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    let yOffset = height - 100;
    signees.forEach((signee, index) => {
      const signeeFields = fields.filter(field => field.signee === signee.email);
      page.drawText(`${index + 1}. ${signee.name} (${signee.email})`, {
        x: 50,
        y: yOffset,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      yOffset -= 20;
      signeeFields.forEach(field => {
        page.drawText(`   ${field.type}: ${field.value}`, {
          x: 50,
          y: yOffset,
          size: 10,
          font,
          color: rgb(0, 0, 0),
        });
        yOffset -= 15;
      });
      page.drawText(`   Signed on: ${new Date().toLocaleString()}`, {
        x: 50,
        y: yOffset,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      yOffset -= 40;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPdfFile(url);
    setNumPages(numPages + 1);
    setPageOrder([...pageOrder, numPages + 1]);
  };

  const sendForESigning = () => {
    if (isAllSigned) {
      generateESignaturePage();
    } else {
      alert("Not all required fields have been completed by the signees.");
    }
  };

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
                <div className="w-64 ml-4 bg-white p-4 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Add Fields</h3>
                  <Button onClick={() => handleAddField('signature')} className="w-full mb-2">
                    <PenIcon className="mr-2 h-4 w-4" />Add Signature
                  </Button>
                  <Button onClick={() => handleAddField('text')} className="w-full mb-2">
                    <TypeIcon className="mr-2 h-4 w-4" />Add Text
                  </Button>
                  <Button onClick={() => handleAddField('name')} className="w-full mb-2">
                    <UserIcon className="mr-2 h-4 w-4" />Add Name
                  </Button>
                  <Button onClick={() => handleAddField('date')} className="w-full mb-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />Add Date
                  </Button>
                  <Button onClick={() => handleAddField('checkbox')} className="w-full mb-2">
                    <CheckSquareIcon className="mr-2 h-4 w-4" />Add Checkbox
                  </Button>
                  <Button onClick={handleAddESign} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white">
                    <PlusCircleIcon className="mr-2 h-4 w-4" />Add E-Sign
                  </Button>
                  <Button onClick={sendForESigning} className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white">
                    <SendIcon className="mr-2 h-4 w-4" />Send for E-Signing
                  </Button>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Added Fields</h4>
                    {fields.map((field, index) => (
                      <div key={index} className="flex justify-between items-center mb-2">
                        <span>{field.type} (for {field.signee})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(index)}
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
      <Dialog open={isAddESignModalOpen} onOpenChange={setIsAddESignModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add E-Sign</DialogTitle>
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
      <Dialog open={isAddFieldModalOpen} onOpenChange={setIsAddFieldModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {currentFieldType}</DialogTitle>
          </DialogHeader>
          {currentFieldType === 'signature' ? (
            <SignatureCanvas onSave={(value) => addField({ type: 'signature', value, signee: signees[0]?.email })} onClose={() => setIsAddFieldModalOpen(false)} />
          ) : (
            <InputField type={currentFieldType} onAdd={addField} onClose={() => setIsAddFieldModalOpen(false)} signees={signees} />
          )}
        </DialogContent>
      </Dialog>
      <HelpButton />
    </>
  );
};

export default Index;