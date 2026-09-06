"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface UseSliderOptions {
  sensitivity?: number;
  momentumMultiplier?: number;
  friction?: number;
  infinite?: boolean;
}

export const useSlider = (options: UseSliderOptions = {}) => {
  const {
    sensitivity = 1.5,
    momentumMultiplier = 15,
    friction = 0.95,
    infinite = false,
  } = options;

  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Use refs for all tracking values to avoid stale closures and re-renders
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velocityRef = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);
  const isMouseDown = useRef(false);
  const dragStartX = useRef(0);
  const hasDragged = useRef(false);
  const DRAG_THRESHOLD = 5;

  const updateScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (infinite) {
      setCanScrollLeft(true);
      setCanScrollRight(true);
    } else {
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, [infinite]);

  const handleInfiniteLoop = useCallback(() => {
    const el = sliderRef.current;
    if (!el || !infinite) return;

    const { scrollLeft, scrollWidth } = el;
    // Each "set" of original items occupies 1/3 of total scrollWidth
    const singleSetWidth = scrollWidth / 3;

    // If scrolled past the third copy, jump back to the second copy
    if (scrollLeft >= singleSetWidth * 2) {
      el.scrollLeft = scrollLeft - singleSetWidth;
    }
    // If scrolled before the first copy, jump forward to the second copy
    else if (scrollLeft < singleSetWidth * 0.05) {
      el.scrollLeft = scrollLeft + singleSetWidth;
    }
  }, [infinite]);

  const stopMomentum = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  const startMomentum = useCallback(() => {
    const vel = velocityRef.current;
    if (Math.abs(vel) < 0.5 || !sliderRef.current) return;

    const decelerate = () => {
      if (!sliderRef.current || Math.abs(velocityRef.current) < 0.3) {
        velocityRef.current = 0;
        animationRef.current = undefined;
        handleInfiniteLoop();
        return;
      }

      sliderRef.current.scrollLeft += velocityRef.current;
      velocityRef.current *= friction;
      handleInfiniteLoop();
      animationRef.current = requestAnimationFrame(decelerate);
    };

    animationRef.current = requestAnimationFrame(decelerate);
  }, [friction, handleInfiniteLoop]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!sliderRef.current) return;
      // Предотвращаем нативный drag ссылок и изображений браузером
      e.preventDefault();
      stopMomentum();
      isMouseDown.current = true;
      hasDragged.current = false;
      dragStartX.current = e.pageX;
      startXRef.current = e.pageX - sliderRef.current.offsetLeft;
      scrollLeftRef.current = sliderRef.current.scrollLeft;
      lastX.current = e.pageX;
      lastTime.current = Date.now();
      velocityRef.current = 0;
    },
    [stopMomentum],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isMouseDown.current || !sliderRef.current) return;

      if (!hasDragged.current) {
        const diff = Math.abs(e.pageX - dragStartX.current);
        if (diff < DRAG_THRESHOLD) return;
        hasDragged.current = true;
        setIsDragging(true);
      }

      e.preventDefault();

      const x = e.pageX - sliderRef.current.offsetLeft;
      const walk = (x - startXRef.current) * sensitivity;
      sliderRef.current.scrollLeft = scrollLeftRef.current - walk;

      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        velocityRef.current =
          ((lastX.current - e.pageX) / dt) * momentumMultiplier;
      }
      lastX.current = e.pageX;
      lastTime.current = now;

      handleInfiniteLoop();
      updateScrollState();
    },
    [sensitivity, momentumMultiplier, handleInfiniteLoop, updateScrollState],
  );

  const handleMouseUp = useCallback(() => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;

    if (hasDragged.current) {
      // Вешаем перехватчик клика в capturing-фазе, чтобы отменить навигацию
      // только внутри текущего слайдера после драга (клик всегда идёт после mouseup)
      const cancelClick = (e: MouseEvent) => {
        const sliderEl = sliderRef.current;
        if (sliderEl && e.target instanceof Node && sliderEl.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
        document.removeEventListener("click", cancelClick, true);
      };
      document.addEventListener("click", cancelClick, true);

      startMomentum();
      setIsDragging(false);
      hasDragged.current = false;
    } else {
      setIsDragging(false);
    }
  }, [startMomentum]);

  const scrollByAmount = useCallback(
    (direction: "left" | "right") => {
      const el = sliderRef.current;
      if (!el) return;
      stopMomentum();
      const amount = el.clientWidth * 0.7;
      el.scrollBy({
        left: direction === "right" ? amount : -amount,
        behavior: "smooth",
      });
      // Check infinite loop after smooth scroll completes
      if (infinite) {
        setTimeout(() => {
          handleInfiniteLoop();
          updateScrollState();
        }, 400);
      }
    },
    [stopMomentum, infinite, handleInfiniteLoop, updateScrollState],
  );

  // Initialize infinite scroll position (start at middle copy)
  useEffect(() => {
    const el = sliderRef.current;
    if (!el || !infinite) return;

    // Wait for layout to settle
    const timer = setTimeout(() => {
      const singleSetWidth = el.scrollWidth / 3;
      el.scrollLeft = singleSetWidth;
      updateScrollState();
    }, 50);

    return () => clearTimeout(timer);
  }, [infinite, updateScrollState]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      stopMomentum();
    };
  }, [handleMouseMove, handleMouseUp, stopMomentum]);

  // Track scroll position for arrow visibility
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const onScroll = () => {
      updateScrollState();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    // Initial check after mount to avoid synchronous setState in effect body
    const rafId = requestAnimationFrame(() => {
      updateScrollState();
    });

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("scroll", onScroll);
    };
  }, [updateScrollState]);

  return {
    sliderRef,
    isDragging,
    canScrollLeft,
    canScrollRight,
    scrollByAmount,
    handlers: {
      onMouseDown: handleMouseDown,
    },
  };
};
