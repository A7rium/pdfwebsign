import React from 'react';
import { Document, Page } from 'react-pdf';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Sidebar = ({ file, pages, onPageClick, setPageOrder }) => {
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newOrder = Array.from(pages);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    setPageOrder(newOrder);
  };

  const onDeletePage = (index) => {
    const newOrder = pages.filter((_, i) => i !== index);
    setPageOrder(newOrder);
  };

  return (
    <div className="w-64 h-screen overflow-y-auto bg-gradient-to-b from-purple-500 to-pink-500 p-4 border-r border-white/20">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="pdf-pages">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <Document file={file}>
                {pages.map((page, index) => (
                  <Draggable key={`thumb_${page}`} draggableId={`thumb_${page}`} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mb-4 cursor-pointer bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors"
                        onClick={() => onPageClick(page)}
                      >
                        <div className="relative">
                          <Page
                            pageNumber={page}
                            width={200}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 w-6 h-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePage(index);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-center text-sm mt-1 text-white">
                          Page {index + 1}
                        </p>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Document>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Sidebar;