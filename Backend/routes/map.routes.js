const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const mapController = require('../controllers/map.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/get-coordinates',
    authMiddleware.authUser,
    [
        query('address')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Address must be at least 3 characters long')
    ],
    mapController.getCoordinates
);

router.get('/get-suggestions',
    authMiddleware.authUser,
    [
        query('input')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Input must be at least 3 characters long')
    ],
    mapController.getSuggestions
);

router.get('/get-distance-time',
    authMiddleware.authUser,
    [
        query('origin')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Origin must be at least 3 characters long'),
        query('destination')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Destination must be at least 3 characters long')
    ],
    mapController.getDistanceTime
);

router.get('/get-address',
    authMiddleware.authUser,
    [
        query('lat')
            .isFloat()
            .withMessage('Latitude must be a valid number'),
        query('lng')
            .isFloat()
            .withMessage('Longitude must be a valid number')
    ],
    mapController.getAddressFromCoordinates
);

module.exports = router;