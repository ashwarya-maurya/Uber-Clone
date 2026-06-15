const socketIo = require('socket.io');
const userModel = require('./models/user.models');
const captainModel = require('./models/captain.models');

let io;

module.exports.initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, {
                    socketId: socket.id
                });
            }

            if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    status: 'active'
                });
            }
        });

        socket.on('update-location-captain', async (data) => {
            const { captainId, location } = data;

            if (!location || !location.lat || !location.lng) {
                return;
            }

            await captainModel.findByIdAndUpdate(captainId, {
                location: {
                    lat: location.lat,
                    lng: location.lng
                },
                status: 'active'
            });
        });

        socket.on('disconnect', async () => {
            await captainModel.findOneAndUpdate(
                { socketId: socket.id },
                {
                    socketId: null,
                    status: 'inactive'
                }
            );

            await userModel.findOneAndUpdate(
                { socketId: socket.id },
                { socketId: null }
            );

            console.log('Socket disconnected:', socket.id);
        });
    });
};

module.exports.sendMessageToSocketId = (socketId, event, data) => {
    if (io && socketId) {
        io.to(socketId).emit(event, data);
    }
};