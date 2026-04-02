"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
async function main() {
    try {
        const res = await (0, node_fetch_1.default)('http://localhost:5000/api/auth/login-debug', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'tourist@gmail.com', password: 'password123' }),
        });
        const text = await res.text();
        console.log('STATUS', res.status);
        console.log('BODY', text);
    }
    catch (e) {
        console.error('fetch error', e);
    }
}
main();
