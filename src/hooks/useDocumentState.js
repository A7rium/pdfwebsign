import { useState, useEffect } from 'react';

export const useDocumentState = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageOrder, setPageOrder] = useState([]);
  const [fields, setFields] = useState([]);
  const [signees, setSignees] = useState([]);
  const [isAllSigned, setIsAllSigned] = useState(false);

  const addField = (field) => {
    setFields([...fields, field]);
  };

  const removeField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
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
    const requiredFields = signees.length * 2;
    const actualFields = fields.length;
    setIsAllSigned(actualFields >= requiredFields);
  };

  useEffect(() => {
    checkAllSigned();
  }, [fields, signees]);

  return {
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
  };
};