import React from 'react';
import { Bin } from '@/types/bin';
import { getStatusColor } from '@/lib/binUtils';
import { TrashIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';

interface BinCardProps {
  bin: Bin;
  onClick?: () => void;
}

const BinCard: React.FC<BinCardProps> = ({ bin, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrashIcon className={`w-8 h-8 text-${getStatusColor(bin.status)} mr-2`} />
          <h3 className="text-lg font-semibold">Bin #{bin.id}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(bin.status)}/20 text-${getStatusColor(bin.status)}`}>
          {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <MapPinIcon className="w-5 h-5 mr-2" />
          <span className="text-sm">{bin.address}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <ClockIcon className="w-5 h-5 mr-2" />
          <span className="text-sm">
            Last updated: {new Date(bin.lastUpdated).toLocaleString()}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="relative w-full h-2 bg-gray-200 rounded">
            <div
              className={`absolute top-0 left-0 h-full bg-${getStatusColor(bin.status)} rounded`}
              style={{ width: `${bin.fillLevel}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 mt-1">
            {Math.round(bin.fillLevel)}% full
          </span>
        </div>
      </div>
    </div>
  );
};

export default BinCard; 