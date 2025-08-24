
import React, { useState, useEffect, useCallback } from 'react';
import Button from './Button';

type SortOrder = 'original' | 'asc' | 'desc';

interface SortControlsProps<T> {
  data: T[];
  sortKey: keyof T;
  onSort: (sortedData: T[]) => void;
  initialSort?: SortOrder;
  buttonTextPrefix?: string;
}

function SortControls<T,>({ data, sortKey, onSort, initialSort = 'original', buttonTextPrefix = 'Trier par' }: SortControlsProps<T>) {
  const [currentSortOrder, setCurrentSortOrder] = useState<SortOrder>(initialSort);
  const [originalData, setOriginalData] = useState<T[]>([...data]);

  useEffect(() => {
    setOriginalData([...data]);
    // If initialSort is not 'original', apply it
    if (initialSort !== 'original' && data.length > 0) {
        let sortedArray;
        if (initialSort === 'asc') {
            sortedArray = [...data].sort((a, b) => String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { sensitivity: 'base' }));
        } else { // desc
            sortedArray = [...data].sort((a, b) => String(b[sortKey] ?? '').localeCompare(String(a[sortKey] ?? ''), undefined, { sensitivity: 'base' }));
        }
        onSort(sortedArray);
    } else {
        onSort([...data]); // Keep original order or if data is empty
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sortKey, initialSort]); // Removed onSort from deps to avoid potential loops if onSort changes identity

  const handleSort = useCallback(() => {
    let sortedArray: T[];
    let nextSortOrder: SortOrder;

    if (currentSortOrder === 'original') {
      sortedArray = [...originalData].sort((a, b) => String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { sensitivity: 'base' }));
      nextSortOrder = 'asc';
    } else if (currentSortOrder === 'asc') {
      sortedArray = [...originalData].sort((a, b) => String(b[sortKey] ?? '').localeCompare(String(a[sortKey] ?? ''), undefined, { sensitivity: 'base' }));
      nextSortOrder = 'desc';
    } else { // desc
      sortedArray = [...originalData];
      nextSortOrder = 'original';
    }
    setCurrentSortOrder(nextSortOrder);
    onSort(sortedArray);
  }, [currentSortOrder, originalData, sortKey, onSort]);

  const getButtonText = () => {
    const keyDisplay = String(sortKey).charAt(0).toUpperCase() + String(sortKey).slice(1);
    if (currentSortOrder === 'original') return `${buttonTextPrefix} ${keyDisplay} (A-Z)`;
    if (currentSortOrder === 'asc') return `${buttonTextPrefix} ${keyDisplay} (Z-A)`;
    return `Ordre Original`;
  };

  if (!data || data.length === 0) return null;

  return (
    <Button
      onClick={handleSort}
      variant="light"
      size="sm"
      icon="swap_vert"
      className="ml-auto whitespace-nowrap"
    >
      {getButtonText()}
    </Button>
  );
}

export default SortControls;