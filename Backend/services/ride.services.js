const rideModel = require('../models/ride.models');
const mapService = require('./map.services');
const captainService = require('./captain.services');

const fareRates = {
    Auto: {
        baseFare: 30,
        perKm: 10,
        perMinute: 2
    },
    Car: {
        baseFare: 50,
        perKm: 15,
        perMinute: 3
    },
    Bike: {
        baseFare: 20,
        perKm: 8,
        perMinute: 1.5
    }
};

const getOtp = (num) => {
    return Math.floor(Math.random() * Math.pow(10, num))
        .toString()
        .padStart(num, '0');
};

module.exports.getFare = async (pickup, destination) => {
    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const distanceInKm = distanceTime.distance / 1000;
    const durationInMinutes = distanceTime.duration / 60;

    const fare = {
        Auto: Math.round(
            fareRates.Auto.baseFare +
            distanceInKm * fareRates.Auto.perKm +
            durationInMinutes * fareRates.Auto.perMinute
        ),
        Car: Math.round(
            fareRates.Car.baseFare +
            distanceInKm * fareRates.Car.perKm +
            durationInMinutes * fareRates.Car.perMinute
        ),
        Bike: Math.round(
            fareRates.Bike.baseFare +
            distanceInKm * fareRates.Bike.perKm +
            durationInMinutes * fareRates.Bike.perMinute
        )
    };

    return {
        fare,
        distance: distanceTime.distance,
        duration: distanceTime.duration
    };
};

module.exports.createRide = async ({
    user,
    pickup,
    destination,
    vehicleType
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    if (!fareRates[vehicleType]) {
        throw new Error('Invalid vehicle type');
    }

    const fareData = await module.exports.getFare(pickup, destination);

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        vehicleType,
        fare: fareData.fare[vehicleType],
        distance: fareData.distance,
        duration: fareData.duration,
        otp: getOtp(6)
    });

    return ride;
};

module.exports.getNearbyCaptains = async ({
    pickup,
    vehicleType,
    radius
}) => {
    if (!pickup || !vehicleType) {
        throw new Error('Pickup and vehicle type are required');
    }

    const pickupCoordinates = await mapService.getCoordinates(pickup);

    const captains = await captainService.getCaptainsInRadius({
        lat: pickupCoordinates.lat,
        lng: pickupCoordinates.lng,
        radius,
        vehicleType
    });

    return {
        pickupCoordinates,
        captains
    };
};

module.exports.acceptRide = async ({
    rideId,
    captain
}) => {
    if (!rideId || !captain) {
        throw new Error('Ride id and captain are required');
    }

    const ride = await rideModel.findOneAndUpdate(
        {
            _id: rideId,
            status: 'pending'
        },
        {
            captain,
            status: 'accepted'
        },
        {
            new: true
        }
    )
        .populate('user')
        .populate('captain')
        .select('+otp');

    if (!ride) {
        throw new Error('Ride not found or already accepted');
    }

    return ride;
};

module.exports.startRide = async ({
    rideId,
    captain,
    otp
}) => {
    if (!rideId || !captain || !otp) {
        throw new Error('Ride id, captain and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain,
        status: 'accepted'
    }).select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    ride.status = 'ongoing';

    await ride.save();

    return await rideModel.findById(ride._id)
        .populate('user')
        .populate('captain');
};

module.exports.endRide = async ({
    rideId,
    captain
}) => {
    if (!rideId || !captain) {
        throw new Error('Ride id and captain are required');
    }

    const ride = await rideModel.findOneAndUpdate(
        {
            _id: rideId,
            captain,
            status: 'ongoing'
        },
        {
            status: 'completed'
        },
        {
            new: true
        }
    )
        .populate('user')
        .populate('captain');

    if (!ride) {
        throw new Error('Ride not found or not ongoing');
    }

    return ride;
};