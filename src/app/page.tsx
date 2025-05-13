'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Bin } from '@/types/bin';
import { getBins, updateBinData } from '@/lib/mockData';
import BinCard from '@/components/BinCard';

// Import map component dynamically to avoid SSR issues
const BinMap = dynamic(() => import('@/components/BinMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg animate-pulse" />
  ),
});

export default function Home() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [selectedBin, setSelectedBin] = useState<string | null>(null);

  useEffect(() => {
    const fetchBins = async () => {
      const data = await getBins();
      setBins(data);
    };

    fetchBins();

    // Simulate real-time updates
    const interval = setInterval(async () => {
      if (bins.length > 0) {
        const randomBin = bins[Math.floor(Math.random() * bins.length)];
        const updatedBin = await updateBinData(randomBin.id);
        setBins(prev => prev.map(bin => 
          bin.id === updatedBin.id ? updatedBin : bin
        ));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bins.length]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Smart Waste Management Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BinMap bins={bins} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Waste Bins Status</h2>
            {bins.map((bin) => (
              <BinCard
                key={bin.id}
                bin={bin}
                onClick={() => setSelectedBin(bin.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 