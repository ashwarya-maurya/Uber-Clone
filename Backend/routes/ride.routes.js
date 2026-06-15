const express = require('express');
const router = express.Router();
const { query, body } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/get-fare',
    authMiddleware.authUser,
    [
        query('pickup')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Pickup must be at least 3 characters long'),
        query('destination')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Destination must be at least 3 characters long')
    ],
    rideController.getFare
);

router.post('/create',
    authMiddleware.authUser,
    [
        body('pickup')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Pickup must be at least 3 characters long'),
        body('destination')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Destination must be at least 3 characters long'),
        body('vehicleType')
            .isIn(['Bike', 'Car', 'Auto'])
            .withMessage('Invalid vehicle type')
    ],
    rideController.createRide
);

router.get('/nearby-captains',
    authMiddleware.authUser,
    [
        query('pickup')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Pickup must be at least 3 characters long'),
        query('vehicleType')
            .isIn(['Bike', 'Car', 'Auto'])
            .withMessage('Invalid vehicle type'),
        query('radius')
            .optional()
            .isFloat({ min: 1 })
            .withMessage('Radius must be at least 1 km')
    ],
    rideController.getNearbyCaptains
);

router.post('/accept',
    authMiddleware.authCaptain,
    [
        body('rideId')
            .isMongoId()
            .withMessage('Invalid ride id')
    ],
    rideController.acceptRide
);

router.post('/start',
    authMiddleware.authCaptain,
    [
        body('rideId')
            .isMongoId()
            .withMessage('Invalid ride id'),
        body('otp')
            .isString()
            .isLength({ min: 6, max: 6 })
            .withMessage('Invalid OTP')
    ],
    rideController.startRide
);

router.post('/end',
    authMiddleware.authCaptain,
    [
        body('rideId')
            .isMongoId()
            .withMessage('Invalid ride id')
    ],
    rideController.endRide
);

module.exports = router;