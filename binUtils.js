const calculateBinStatus = (distance, binHeight = 100) => {
    const fillPercentage = (1 - distance / binHeight) * 100;
    
    if (fillPercentage < 40) {
        return 'empty';
    } else if (fillPercentage < 80) {
        return 'half';
    } else {
        return 'full';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'empty':
            return 'empty';
        case 'half':
            return 'half';
        case 'full':
            return 'full';
        default:
            return 'empty';
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
}; 