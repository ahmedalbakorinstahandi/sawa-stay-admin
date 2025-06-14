import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import Image from "next/image";

interface SortableItemProps {
  id: string;
  index: number;
  url: string;
  onRemove: () => void;
}

export function SortableItem({ id, index, url, onRemove }: SortableItemProps) {  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] aspect-square bg-gray-100 rounded-lg overflow-hidden touch-manipulation ${isDragging ? 'z-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <Image
        src={url || "/placeholder.svg"}
        alt={`صورة الإعلان ${index + 1}`}
        fill
        priority
        className="object-cover"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full h-6 w-6 flex items-center justify-center">
        {index + 1}
      </div>
    </div>
  );
}
