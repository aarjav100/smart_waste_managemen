import { Bin, BinSensorData } from '@/types/bin';
import { calculateBinStatus } from './binUtils';

const mockBins: Bin[] = [
  {
    id: '001',
    location: { lat: 51.505, lng: -0.09 },
    address: '123 Main St, London',
    fillLevel: 30,
    lastUpdated: new Date().toISOString(),
    status: 'empty'
  },
  {
    id: '002',
    location: { lat: 51.51, lng: -0.1 },
    address: '456 High St, London',
    fillLevel: 65,
    lastUpdated: new Date().toISOString(),
    status: 'half'
  },
  {
    id: '003',
    location: { lat: 51.515, lng: -0.095 },
    address: '789 Park Lane, London',
    fillLevel: 90,
    lastUpdated: new Date().toISOString(),
    status: 'full'
  }
];

export const getBins = (): Promise<Bin[]> => {
  return Promise.resolve(mockBins);
};

export const simulateSensorData = (binId: string): BinSensorData => {
  const bin = mockBins.find(b => b.id === binId);
  if (!bin) throw new Error('Bin not found');

  const distance = Math.random() * 100; // Simulate distance reading
  const sensorData: BinSensorData = {
    distance,
    timestamp: new Date().toISOString(),
    binId
  };

  // Update bin data
  bin.fillLevel = 100 - distance;
  bin.status = calculateBinStatus(distance);
  bin.lastUpdated = sensorData.timestamp;

  return sensorData;
};

export const updateBinData = (binId: string): Promise<Bin> => {
  const sensorData = simulateSensorData(binId);
  const updatedBin = mockBins.find(b => b.id === binId);
  if (!updatedBin) throw new Error('Bin not found');
  
  return Promise.resolve(updatedBin);
}; 