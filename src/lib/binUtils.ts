import { BinStatus } from '@/types/bin';

export const calculateBinStatus = (distance: number, binHeight: number = 100): BinStatus => {
  const fillPercentage = (1 - distance / binHeight) * 100;
  
  if (fillPercentage < 40) {
    return 'empty';
  } else if (fillPercentage < 80) {
    return 'half';
  } else {
    return 'full';
  }
};

export const getStatusColor = (status: BinStatus): string => {
  switch (status) {
    case 'empty':
      return 'bin-empty';
    case 'half':
      return 'bin-half';
    case 'full':
      return 'bin-full';
    default:
      return 'gray-400';
  }
}; 