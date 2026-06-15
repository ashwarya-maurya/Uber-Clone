const { validationResult } = require('express-validator');
const rideService = require('../services/ride.services');
const socketService = require('../socket');

module.exports.getFare = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { pickup, destination } = req.query;

        const fare = await rideService.getFare(pickup, destination);

        res.status(200).json(fare);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.createRide = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { pickup, destination, vehicleType } = req.body;

        const ride = await rideService.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType
        });

        const nearbyCaptains = await rideService.getNearbyCaptains({
            pickup,
            vehicleType,
            radius: 5
        });

        nearbyCaptains.captains.forEach((captain) => {
            socketService.sendMessageToSocketId(
                captain.socketId,
                'new-ride',
                {
                    ride,
                    pickupCoordinates: nearbyCaptains.pickupCoordinates
                }
            );
        });

        res.status(201).json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getNearbyCaptains = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { pickup, vehicleType, radius } = req.query;

        const nearbyCaptains = await rideService.getNearbyCaptains({
            pickup,
            vehicleType,
            radius: radius ? Number(radius) : 5
        });

        res.status(200).json(nearbyCaptains);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.acceptRide = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { rideId } = req.body;

        const ride = await rideService.acceptRide({
            rideId,
            captain: req.captain._id
        });

        socketService.sendMessageToSocketId(
            ride.user.socketId,
            'ride-accepted',
            ride
        );

        res.status(200).json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.startRide = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { rideId, otp } = req.body;

        const ride = await rideService.startRide({
            rideId,
            captain: req.captain._id,
            otp
        });

        socketService.sendMessageToSocketId(
            ride.user.socketId,
            'ride-started',
            ride
        );

        res.status(200).json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.endRide = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { rideId } = req.body;

        const ride = await rideService.endRide({
            rideId,
            captain: req.captain._id
        });

        socketService.sendMessageToSocketId(
            ride.user.socketId,
            'ride-ended',
            ride
        );

        res.status(200).json(ride);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};