import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PenIcon, TypeIcon, UserIcon, CalendarIcon, CheckSquareIcon, PlusCircleIcon, SendIcon, TrashIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import SignatureCanvas from './SignatureCanvas';

const FieldsPanel = ({ addField, fields, removeField, addSignee, removeSignee, signees, isAllSigned, checkAllSigned }) => {
  const [isAddESignModalOpen, setIsAddESignModalOpen] = useState(false);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [currentFieldType, setCurrentFieldType] = useState(null);

  const handleAddField = (type) => {
    setCurrentFieldType(type);
    setIsAddFieldModalOpen(true);
  };

  const handleAddESign = () => {
    setIsAddESignModalOpen(true);
  };

  const handleFieldAdd = (fieldData) => {
    addField({ ...fieldData, type: currentFieldType, position: { x: 0, y: 0 } });
    setIsAddFieldModalOpen(false);
  };

  return (
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
      <Button onClick={checkAllSigned} className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white">
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
            <SignatureCanvas onSave={handleFieldAdd} />
          ) : (
            <Input
              placeholder={`Enter ${currentFieldType}`}
              onChange={(e) => handleFieldAdd({ value: e.target.value })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldsPanel;