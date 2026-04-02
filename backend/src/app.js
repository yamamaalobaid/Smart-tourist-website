"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_mongo_1 = __importDefault(require("./config/database.mongo"));
const seedDatabaseFixed_1 = require("./seeders/seedDatabaseFixed");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const placeRoutes_1 = __importDefault(require("./routes/placeRoutes"));
const favoriteRoutes_1 = __importDefault(require("./routes/favoriteRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const itineraryRoutes_1 = __importDefault(require("./routes/itineraryRoutes"));
const travelAssistantRoutes_1 = __importDefault(require("./routes/travelAssistantRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught exception:', err && (err.stack || err));
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled rejection:', reason && (reason.stack || reason));
    process.exit(1);
});
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Register routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/places', placeRoutes_1.default);
app.use('/api/favorites', favoriteRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/itineraries', itineraryRoutes_1.default);
app.use('/api/utility', travelAssistantRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.get('/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));
app.get('/', (_req, res) => res.json({ message: 'Welcome to Damascus Tourism API', version: '1.0.0' }));
// Error handler
app.use((err, _req, res, _next) => {
    console.error('ERROR:', err && (err.stack || err));
    res.status(500).json({ success: false, message: 'Internal server error' });
});
// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
async function startServer() {
    try {
        await (0, database_mongo_1.default)();
        const env = process.env.NODE_ENV || 'development';
        if (env === 'development' && process.env.SEED_DATABASE === 'true') {
            console.log('[app] seeding database (if enabled)');
            await (0, seedDatabaseFixed_1.seedDatabase)();
            console.log('[app] seeding complete');
        }
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server listening on http://localhost:${PORT}`);
        });
        server.on('error', (err) => {
            console.error('[app] server error', err);
            process.exit(1);
        });
        // keep process alive in some environments
        if (server && server.ref)
            server.ref();
        process.stdin && process.stdin.resume();
    }
    catch (err) {
        console.error('[app] failed to start', err && (err.stack || err));
        process.exit(1);
    }
}
startServer();
exports.default = app;
