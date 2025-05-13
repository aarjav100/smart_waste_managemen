// Initialize map centered on India
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add India state boundaries
fetch('https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/india-states/india_states.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            style: {
                color: '#666',
                weight: 1,
                fillOpacity: 0.1
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error('Failed to load India state boundaries:', error);
    });

// Store markers for later use
const markers = new Map();
let tempMarker = null;

// Notification system
const showNotification = (message, type = 'error') => {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create notification content
    notification.innerHTML = `
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            ${type === 'error' ? `
                <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
            ` : `
                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"/>
            `}
        </svg>
        <span>${message}</span>
    `;
    
    notifications.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            notifications.removeChild(notification);
        }, 300);
    }, 5000);
};

// Function to get address from coordinates using reverse geocoding
const getAddressFromCoordinates = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();
        return data.display_name;
    } catch (error) {
        console.error('Failed to get address:', error);
        return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};

// Add click handler to map for marking garbage locations
map.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    
    // Remove previous temporary marker if it exists
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }
    
    // Create a temporary marker at clicked location
    tempMarker = L.marker([lat, lng], {
        icon: createMarkerIcon('new')
    }).addTo(map);

    // Show loading notification
    showNotification('Getting location details...', 'info');

    try {
        // Get address for clicked location
        const address = await getAddressFromCoordinates(lat, lng);
        
        // Update the address input field
        document.getElementById('binAddress').value = address;

        // Show confirmation popup
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'confirm-popup';
        confirmDiv.innerHTML = `
            <div class="confirm-content">
                <h3>Add Garbage Location?</h3>
                <p>${address}</p>
                <div class="confirm-buttons">
                    <button class="confirm-btn">Add Location</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;

        // Add popup to map
        const popup = L.popup()
            .setLatLng([lat, lng])
            .setContent(confirmDiv)
            .openOn(map);

        // Handle confirmation
        confirmDiv.querySelector('.confirm-btn').onclick = async () => {
            try {
                await addNewBin(address, lat, lng);
                const bins = await getBins();
                updateUI(bins);
                map.closePopup();
                showNotification('New garbage location added successfully!', 'success');
            } catch (error) {
                console.error('Failed to add garbage location:', error);
                showNotification('Failed to add garbage location. Please try again.', 'error');
            }
            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
        };

        // Handle cancellation
        confirmDiv.querySelector('.cancel-btn').onclick = () => {
            map.closePopup();
            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
        };

    } catch (error) {
        console.error('Failed to process location:', error);
        showNotification('Failed to process location. Please try again.', 'error');
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    }
});

// Function to geocode address and add bin
const geocodeAndAddBin = async (address) => {
    try {
        // Add ", India" to the address if it doesn't already include it
        const searchAddress = address.toLowerCase().includes('india') ? 
            address : `${address}, India`;
            
        // Geocode the address using Nominatim
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`
        );
        const data = await response.json();

        if (data.length === 0) {
            throw new Error('Address not found');
        }

        const location = data[0];
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lon);

        // Remove previous temporary marker if it exists
        if (tempMarker) {
            map.removeLayer(tempMarker);
        }

        // Add the new bin
        await addNewBin(address, lat, lng);
        const bins = await getBins();
        updateUI(bins);
        
        // Center map on the new location
        map.setView([lat, lng], 15);
        
        showNotification('New garbage location added successfully!', 'success');
    } catch (error) {
        console.error('Failed to geocode address:', error);
        showNotification('Failed to find location. Please check the address and try again.', 'error');
    }
};

// Handle form submission
document.getElementById('addBinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = document.getElementById('binAddress').value;
    
    if (!address) {
        showNotification('Please enter an address', 'error');
        return;
    }

    try {
        await geocodeAndAddBin(address);
        e.target.reset();
    } catch (error) {
        console.error('Failed to add new bin:', error);
        showNotification('Failed to add new garbage location. Please try again.', 'error');
    }
});

// Create custom marker icons for different bin states
const createMarkerIcon = (status) => {
    const markerHtmlStyles = `
        background-color: var(--color-${status});
        width: 2rem;
        height: 2rem;
        display: block;
        position: relative;
        border-radius: 3rem 3rem 0;
        transform: rotate(45deg);
        border: 1px solid #FFFFFF;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;

    return L.divIcon({
        className: "custom-marker",
        html: `<span style="${markerHtmlStyles}" />`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

// Create bin card HTML
const createBinCard = (bin) => {
    const card = document.createElement('div');
    card.className = 'bin-card';
    card.dataset.binId = bin.id; // Add data attribute for search filtering
    
    card.onclick = () => {
        const marker = markers.get(bin.id);
        if (marker) {
            map.setView(marker.getLatLng(), 15);
            marker.openPopup();
        }
    };

    // Add warning class if bin is nearly full
    if (bin.fillLevel > 90) {
        card.classList.add('critical-level');
    }

    card.innerHTML = `
        <div class="bin-header">
            <div class="bin-title">
                <svg class="bin-icon status-${getStatusColor(bin.status)}" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.75 2a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5H2.75ZM9 5a.75.75 0 0 0-.75.75V19.5a.75.75 0 0 0 1.5 0V5.75A.75.75 0 0 0 9 5Zm6.75.75a.75.75 0 0 1 1.5 0V19.5a.75.75 0 0 1-1.5 0V5.75Z" />
                </svg>
                <h3>Bin #${bin.id}</h3>
                ${bin.fillLevel > 80 ? '<span class="critical-badge">CRITICAL</span>' : ''}
            </div>
            <span class="bin-status status-${getStatusColor(bin.status)}">
                ${bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
            </span>
        </div>
        
        <div class="bin-info">
            <div class="bin-detail location-detail">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                </svg>
                <span class="address-text">${bin.address}</span>
            </div>
            
            <div class="bin-detail time-detail">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clip-rule="evenodd" />
                </svg>
                <span class="time-text">Last updated: ${formatDate(bin.lastUpdated)}</span>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill fill-${getStatusColor(bin.status)}" 
                     style="width: ${bin.fillLevel}%">
                </div>
            </div>
            <span class="bin-detail fill-level-detail ${bin.fillLevel > 80 ? 'critical-text' : ''}">${Math.round(bin.fillLevel)}% full</span>
        </div>
    `;

    return card;
};

// Create map marker popup content
const createPopupContent = (bin) => {
    return `
        <div class="popup-content">
            <h3 style="font-weight: 600; margin-bottom: 0.5rem;">Bin #${bin.id}</h3>
            <p style="color: var(--color-gray-600); font-size: 0.875rem;">${bin.address}</p>
            <p class="status-${getStatusColor(bin.status)}" style="font-size: 0.875rem; font-weight: 500; margin-top: 0.5rem;">
                ${bin.status.charAt(0).toUpperCase() + bin.status.slice(1)} (${Math.round(bin.fillLevel)}% full)
            </p>
        </div>
    `;
};

// Initialize modal functionality
const modal = document.getElementById('add-location-modal');
const addLocationBtn = document.getElementById('add-location-btn');
const closeModalBtns = document.querySelectorAll('.close-modal');
const searchInput = document.getElementById('location-search');

// Show modal
addLocationBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

// Close modal
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Find the closest modal to this button
        const modal = btn.closest('.modal');
        if (modal) {
            modal.classList.remove('active');
        }
    });
});

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // If search is empty, show all bins
        const allBins = document.querySelectorAll('.bin-card');
        allBins.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Get all the bin data
    getBins().then(bins => {
        // Filter bins based on search term
        const filteredBins = bins.filter(bin => {
            return (
                bin.address.toLowerCase().includes(searchTerm) || 
                bin.id.toLowerCase().includes(searchTerm) ||
                getStatusColor(bin.status).toLowerCase().includes(searchTerm) ||
                Math.round(bin.fillLevel).toString().includes(searchTerm)
            );
        });
        
        // Get all bin cards
        const allCards = document.querySelectorAll('.bin-card');
        
        // Hide all cards first
        allCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Show only the filtered ones
        filteredBins.forEach(bin => {
            const selector = `.bin-card[data-bin-id="${bin.id}"]`;
            const card = document.querySelector(selector);
            if (card) {
                card.style.display = 'block';
            }
        });
        
        // Update no results message if needed
        const criticalBinsList = document.getElementById('critical-bins-list');
        const binsList = document.getElementById('bins-list');
        
        const visibleCriticalCards = criticalBinsList.querySelectorAll('.bin-card[style="display: block;"]');
        const visibleNormalCards = binsList.querySelectorAll('.bin-card[style="display: block;"]');
        
        if (visibleCriticalCards.length === 0) {
            if (!criticalBinsList.querySelector('.no-results')) {
                const noResults = document.createElement('p');
                noResults.className = 'no-results';
                noResults.textContent = 'No critical locations match your search';
                criticalBinsList.appendChild(noResults);
            }
        } else {
            const noResults = criticalBinsList.querySelector('.no-results');
            if (noResults) {
                noResults.remove();
            }
        }
        
        if (visibleNormalCards.length === 0) {
            if (!binsList.querySelector('.no-results')) {
                const noResults = document.createElement('p');
                noResults.className = 'no-results';
                noResults.textContent = 'No locations match your search';
                binsList.appendChild(noResults);
            }
        } else {
            const noResults = binsList.querySelector('.no-results');
            if (noResults) {
                noResults.remove();
            }
        }
    });
});

// Update stats
const updateStats = (bins) => {
    const totalBinsCount = document.getElementById('total-bins-count');
    const criticalBinsCount = document.getElementById('critical-bins-count');
    
    const criticalCount = bins.filter(bin => bin.fillLevel > 80).length;
    
    totalBinsCount.textContent = bins.length;
    criticalBinsCount.textContent = criticalCount;
    
    // Update critical bins count in header if needed
    if (criticalCount > 0) {
        criticalBinsCount.classList.add('critical');
    } else {
        criticalBinsCount.classList.remove('critical');
    }
};

// Update the UI with bin data
const updateUI = (bins) => {
    const binsList = document.getElementById('bins-list');
    const criticalBinsList = document.getElementById('critical-bins-list');
    
    // Clear both lists
    binsList.innerHTML = '';
    criticalBinsList.innerHTML = '';
    
    // Sort bins by fill level in descending order
    const sortedBins = [...bins].sort((a, b) => b.fillLevel - a.fillLevel);
    
    sortedBins.forEach(bin => {
        // Create bin card
        const card = createBinCard(bin);
        
        // Determine if bin is critical (>80% full)
        const isCritical = bin.fillLevel > 80;
        
        if (isCritical) {
            card.classList.add('critical-level');
            criticalBinsList.appendChild(card);
        } else {
            binsList.appendChild(card);
        }
        
        // Update or create marker
        let marker = markers.get(bin.id);
        if (!marker) {
            marker = L.marker([bin.location.lat, bin.location.lng], {
                icon: createMarkerIcon(getStatusColor(bin.status))
            }).addTo(map);
            markers.set(bin.id, marker);
            
            // Add pulsing effect to critical markers
            if (isCritical) {
                marker.getElement().classList.add('marker-critical');
            }
            
            // Trigger municipal alert if bin is newly added and critical
            if (bin.fillLevel > 90 && !bin.alertSent) {
                sendMunicipalAlert(bin);
            }
        } else {
            marker.setIcon(createMarkerIcon(getStatusColor(bin.status)));
            // Update pulsing effect
            if (isCritical) {
                marker.getElement().classList.add('marker-critical');
            } else {
                marker.getElement().classList.remove('marker-critical');
            }
        }
        
        marker.setPopupContent(createPopupContent(bin));
        if (!marker.getPopup()) {
            marker.bindPopup(createPopupContent(bin));
        }
    });
    
    // Update stats
    updateStats(sortedBins);
    
    // Show no results message if needed
    if (criticalBinsList.children.length === 0) {
        criticalBinsList.innerHTML = '<p class="no-critical">No critical locations at the moment</p>';
    }
    if (binsList.children.length === 0) {
        binsList.innerHTML = '<p class="no-bins">No locations found</p>';
    }
};

// Initialize the dashboard
const initDashboard = async () => {
    try {
        const bins = await getBins();
        updateUI(bins);
        
        // Simulate real-time updates
        setInterval(async () => {
            if (mockBins.length > 0) {
                const randomBin = mockBins[Math.floor(Math.random() * mockBins.length)];
                const updatedBin = await updateBinData(randomBin.id);
                const bins = await getBins();
                updateUI(bins);
            }
        }, 5000);
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showNotification('Failed to initialize dashboard. Please refresh the page.', 'error');
    }
};

// Start the application
initDashboard();

// Initialize shop functionality
const shopBtn = document.getElementById('shop-btn');
const shopModal = document.getElementById('shop-modal');
const categoryBtns = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');
const buyBtns = document.querySelectorAll('.buy-btn');

// Cart state
let cartItems = [];

// Show shop modal
shopBtn.addEventListener('click', () => {
    shopModal.classList.add('active');
});

// Close shop modal
shopModal.addEventListener('click', (e) => {
    if (e.target === shopModal) {
        shopModal.classList.remove('active');
    }
});

// Category filtering
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryBtns.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        
        // Show/hide products based on category
        productCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Add to cart functionality
buyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const productCard = btn.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productImage = productCard.querySelector('img').src;
        
        // Add item to cart
        cartItems.push({
            name: productName,
            price: productPrice,
            image: productImage
        });
        
        // Update cart badge
        updateCartBadge();
        
        // Show notification
        showNotification(`Added "${productName}" to cart`, 'success');
        
        // Change button text temporarily
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.disabled = true;
        btn.style.backgroundColor = 'var(--color-empty)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.backgroundColor = '';
        }, 1500);
    });
});

// Update cart badge
function updateCartBadge() {
    if (cartItems.length > 0) {
        shopBtn.classList.add('cart-badge');
        shopBtn.setAttribute('data-count', cartItems.length);
    } else {
        shopBtn.classList.remove('cart-badge');
        shopBtn.removeAttribute('data-count');
    }
} 