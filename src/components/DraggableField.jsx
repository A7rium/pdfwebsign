import React from 'react';
import Draggable from 'react-draggable';
import { Button } from "@/components/ui/button";
import { TrashIcon } from 'lucide-react';

const DraggableField = ({ field, index, onRemove }) => {
  return (
    <Draggable bounds="parent" defaultPosition={field.position}>
      <div className="absolute cursor-move bg-blue-200 border border-blue-400 p-2 rounded">
        {field.type === 'signature' ? (
          <img src={field.value} alt="Signature" className="w-32 h-16 object-contain" />
        ) : (
          <span>{field.value || field.type}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </Draggable>
  );
};

export default DraggableField;