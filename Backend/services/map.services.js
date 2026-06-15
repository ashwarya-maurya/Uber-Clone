const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const OSRM_BASE_URL = 'https://router.project-osrm.org';

const getHeaders = () => ({
    'User-Agent': process.env.NOMINATIM_USER_AGENT || 'RideBookingBackend/1.0',
    'Accept': 'application/json'
});

module.exports.getCoordinates = async (address) => {
    if (!address) {
        throw new Error('Address is required');
    }

    const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    const response = await fetch(url, {
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error('Unable to fetch coordinates');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
        throw new Error('No coordinates found for this address');
    }

    return {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
        displayName: data[0].display_name
    };
};

module.exports.getSuggestions = async (input) => {
    if (!input) {
        throw new Error('Input is required');
    }

    const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(input)}&addressdetails=1&limit=5`;

    const response = await fetch(url, {
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error('Unable to fetch suggestions');
    }

    const data = await response.json();

    return data.map((place) => ({
        placeId: place.place_id,
        displayName: place.display_name,
        lat: Number(place.lat),
        lng: Number(place.lon),
        type: place.type,
        category: place.class
    }));
};

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const originCoordinates = await module.exports.getCoordinates(origin);
    const destinationCoordinates = await module.exports.getCoordinates(destination);

    const coordinates = `${originCoordinates.lng},${originCoordinates.lat};${destinationCoordinates.lng},${destinationCoordinates.lat}`;
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=false`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Unable to calculate distance and duration');
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found between origin and destination');
    }

    const route = data.routes[0];

    return {
        distance: route.distance,
        duration: route.duration,
        origin: originCoordinates,
        destination: destinationCoordinates
    };
};