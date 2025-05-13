export type BinStatus = 'empty' | 'half' | 'full';

export interface Bin {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  fillLevel: number;
  lastUpdated: string;
  status: BinStatus;
}

export interface BinSensorData {
  distance: number;
  timestamp: string;
  binId: string;
} 