import { useState, useCallback } from "react";

interface UseProductSelectionOptions {
  defaultColor?: string;
  defaultStorage?: string;
  defaultSim?: string;
  defaultEsim?: string;
}

interface UseProductSelectionReturn {
  selectedColor: string;
  selectedStorage: string;
  selectedSim: string;
  selectedEsim: string;
  selectColor: (colorId: string) => void;
  selectStorage: (storage: string) => void;
  selectSim: (sim: string) => void;
  selectEsim: (esim: string) => void;
}

export const useProductSelection = ({
  defaultColor = "",
  defaultStorage = "",
  defaultSim = "",
  defaultEsim = "",
}: UseProductSelectionOptions): UseProductSelectionReturn => {
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [selectedStorage, setSelectedStorage] = useState(defaultStorage);
  const [selectedSim, setSelectedSim] = useState(defaultSim);
  const [selectedEsim, setSelectedEsim] = useState(defaultEsim);

  const selectColor = useCallback((colorId: string) => {
    setSelectedColor(colorId);
  }, []);

  const selectStorage = useCallback((storage: string) => {
    setSelectedStorage(storage);
  }, []);

  const selectSim = useCallback((sim: string) => {
    setSelectedSim(sim);
  }, []);

  const selectEsim = useCallback((esim: string) => {
    setSelectedEsim(esim);
  }, []);

  return {
    selectedColor,
    selectedStorage,
    selectedSim,
    selectedEsim,
    selectColor,
    selectStorage,
    selectSim,
    selectEsim,
  };
};
