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
  isMarkedForDeletion?: boolean;
}

export function SortableItem({ id, index, url, onRemove, isMarkedForDeletion = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "100%",
  };
  
  // إضافة معالج منفصل للنقر على زر الحذف
  const handleRemoveClick = (e: React.MouseEvent) => {
    // منع انتشار الحدث حتى لا يتداخل مع أحداث السحب
    e.preventDefault();
    e.stopPropagation();
    console.log("تم النقر على زر الحذف:", id);
    onRemove();
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`relative w-full w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] aspect-square bg-gray-100 rounded-lg overflow-hidden touch-manipulation ${isMarkedForDeletion ? 'opacity-90' : ''
        }`}
      {...attributes}
      // فصل أحداث السحب عن باقي العنصر
      // سنضيف listeners للصورة فقط وليس للمكون بالكامل
    >      <div className="relative w-full h-full cursor-grab group" {...listeners}>
        <Image
          src={url || "/placeholder.svg"}
          alt={`صورة الإعلان ${index + 1}`}
          fill
          priority
          className={`object-cover ${isMarkedForDeletion ? 'grayscale brightness-50' : ''}`}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-transparent"></div>
        
        {/* إشارة السحب تظهر عند تحريك المؤشر فوق الصورة */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-80 bg-black/20 transition-opacity duration-300">
          <div className="p-2 rounded-full bg-white/70">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
              <path d="M3 8V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1"></path>
              <path d="M3 16v1a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"></path>
              <path d="m8 12 4-4 4 4"></path>
              <path d="m8 12 4 4 4-4"></path>
            </svg>
          </div>
        </div>
      </div>{isMarkedForDeletion && (
        <>
          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transform -rotate-12 shadow-md border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>سيتم حذفها</span>
            </div>
          </div>
          <div className="absolute inset-0 border-4 border-red-600 rounded-lg"></div>
        </>
      )}      <Button
        variant="destructive"
        size="icon"
        className={`absolute top-2 right-2 h-9 w-9 rounded-full shadow-lg transition-all transform hover:scale-110 z-10 ${isMarkedForDeletion
          ? 'bg-green-600 text-white hover:bg-green-700 border-2 border-white animate-pulse'
          : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        onClick={handleRemoveClick} 
        // نقوم بفصل زر الحذف تماما عن أحداث السحب
        onMouseDown={e => {
          e.stopPropagation();
        }}
        onTouchStart={e => {
          e.stopPropagation();
        }}
      >        {isMarkedForDeletion ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white">
          <path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 1 1 0 12h-3"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
        </svg>
      )}
      </Button>
      <div className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full h-6 w-6 flex items-center justify-center">
        {index + 1}
      </div>
    </div>
  );
}
