import { useState, useCallback } from "react";

interface ZoomPosition {
  x: number;
  y: number;
}

interface UseImageGalleryOptions {
  totalImages: number;
}

interface UseImageGalleryReturn {
  selectedIndex: number;
  isZoomed: boolean;
  zoomPosition: ZoomPosition;
  selectImage: (index: number) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  nextImage: () => void;
  prevImage: () => void;
}

export const useImageGallery = ({
  totalImages,
}: UseImageGalleryOptions): UseImageGalleryReturn => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState<ZoomPosition>({
    x: 0,
    y: 0,
  });

  const selectImage = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => setIsZoomed(true), []);
  const handleMouseLeave = useCallback(() => setIsZoomed(false), []);

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const prevImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  return {
    selectedIndex,
    isZoomed,
    zoomPosition,
    selectImage,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    nextImage,
    prevImage,
  };
};
