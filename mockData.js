const mockBins = [
    {
        id: '001',
        location: { lat: 28.6139, lng: 77.2090 },
        address: 'Connaught Place, New Delhi',
        fillLevel: 30,
        lastUpdated: new Date().toISOString(),
        status: 'empty',
        alertSent: false
    },
    {
        id: '002',
        location: { lat: 19.0760, lng: 72.8777 },
        address: 'Dadar, Mumbai',
        fillLevel: 65,
        lastUpdated: new Date().toISOString(),
        status: 'half',
        alertSent: false
    },
    {
        id: '003',
        location: { lat: 12.9716, lng: 77.5946 },
        address: 'MG Road, Bangalore',
        fillLevel: 90,
        lastUpdated: new Date().toISOString(),
        status: 'full',
        alertSent: false
    },
    {
        id: '004',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Park Street, Kolkata',
        fillLevel: 45,
        lastUpdated: new Date().toISOString(),
        status: 'half',
        alertSent: false
    },
    {
        id: '005',
        location: { lat: 17.3850, lng: 78.4867 },
        address: 'Hitech City, Hyderabad',
        fillLevel: 25,
        lastUpdated: new Date().toISOString(),
        status: 'empty',
        alertSent: false
    },
    {
        id: '006',
        location: { lat: 13.0827, lng: 80.2707 },
        address: 'Marina Beach, Chennai',
        fillLevel: 70,
        lastUpdated: new Date().toISOString(),
        status: 'half',
        alertSent: false
    }
];

// Simulated municipal API endpoint
const sendMunicipalAlert = (bin) => {
    const alertType = bin.fillLevel > 90 ? 'CRITICAL' : 'NEW_LOCATION';
    const emoji = alertType === 'CRITICAL' ? '🚨' : '📍';
    
    console.log(`${emoji} ALERT: Municipal Notification sent for Bin #${bin.id}`);
    console.log(`Type: ${alertType}`);
    console.log(`Location: ${bin.address}`);
    console.log(`Coordinates: ${bin.location.lat}, ${bin.location.lng}`);
    console.log(`Fill Level: ${bin.fillLevel}%`);
    console.log(`Last Updated: ${bin.lastUpdated}`);
    console.log(`Status: ${bin.status.toUpperCase()}`);
    console.log('-----------------------------------');

    // In a real application, this would be an API call to the municipal system
    return Promise.resolve({
        success: true,
        timestamp: new Date().toISOString(),
        message: `Alert sent for Bin #${bin.id}`,
        alertType: alertType,
        location: {
            address: bin.address,
            coordinates: [bin.location.lat, bin.location.lng]
        },
        status: {
            fillLevel: bin.fillLevel,
            condition: bin.status
        }
    });
};

const getBins = () => {
    return Promise.resolve([...mockBins]);
};

const simulateSensorData = (binId) => {
    const bin = mockBins.find(b => b.id === binId);
    if (!bin) throw new Error('Bin not found');

    const distance = Math.random() * 100;
    const timestamp = new Date().toISOString();

    // Update bin data
    bin.fillLevel = 100 - distance;
    bin.status = calculateBinStatus(distance);
    bin.lastUpdated = timestamp;

    // Check if bin needs municipal alert
    if (bin.fillLevel > 90 && !bin.alertSent) {
        bin.alertSent = true;
        sendMunicipalAlert(bin)
            .then(response => {
                console.log('Municipal alert sent successfully:', response.message);
                // Add visual notification on the dashboard
                showNotification(`Municipal alert sent for Bin #${bin.id} (${bin.fillLevel}% full)`);
            })
            .catch(error => {
                console.error('Failed to send municipal alert:', error);
            });
    }

    // Reset alert flag if bin is emptied
    if (bin.fillLevel < 90) {
        bin.alertSent = false;
    }

    return {
        distance,
        timestamp,
        binId
    };
};

const updateBinData = (binId) => {
    simulateSensorData(binId);
    const updatedBin = mockBins.find(b => b.id === binId);
    if (!updatedBin) throw new Error('Bin not found');
    
    return Promise.resolve({...updatedBin});
};

const addNewBin = (address, lat, lng) => {
    const newBin = {
        id: String(mockBins.length + 1).padStart(3, '0'),
        location: { lat, lng },
        address,
        fillLevel: Math.floor(Math.random() * 100), // Random initial fill level
        lastUpdated: new Date().toISOString(),
        status: 'new',
        alertSent: false
    };
    
    // Update status based on fill level
    if (newBin.fillLevel > 90) {
        newBin.status = 'full';
    } else if (newBin.fillLevel > 40) {
        newBin.status = 'half';
    } else {
        newBin.status = 'empty';
    }
    
    // Send immediate alert for new garbage location
    sendMunicipalAlert(newBin)
        .then(response => {
            console.log('Municipal alert sent for new location:', response.message);
            showNotification(`Municipal authorities notified about new garbage location at ${address}`);
        })
        .catch(error => {
            console.error('Failed to send municipal alert:', error);
        });
    
    mockBins.push(newBin);
    return Promise.resolve(newBin);
}; 