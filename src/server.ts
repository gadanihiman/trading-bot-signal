import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-body';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = new Koa();
const router = new Router();

// Get variables from environment
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL as string;
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
// const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID as string;

// Middleware untuk parsing JSON body
app.use(bodyParser());

// Route untuk menerima sinyal trading dari TradingView
router.post('/webhook', async (ctx) => {
    const data = ctx.request.body;

    // Filter untuk pair BTC/USDT dan ETH/USDT di Bybit
    if (data.symbol === 'BYBIT:BTCUSDT' || data.symbol === 'BYBIT:ETHUSDT') {
        const message = `${data.message} for ${data.symbol} at price ${data.price}`;

        // Send to Discord
        try {
            await axios.post(DISCORD_WEBHOOK_URL, {
                content: message
            });
            console.log('Message sent to Discord');
        } catch (error) {
            console.error('Error sending to Discord', error);
        }

        // // Send to Telegram
        // try {
        //     await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        //         chat_id: TELEGRAM_CHAT_ID,
        //         text: message
        //     });
        //     console.log('Message sent to Telegram');
        // } catch (error) {
        //     console.error('Error sending to Telegram', error);
        // }

        ctx.body = { status: 'success' };
    } else {
        ctx.status = 400;
        ctx.body = { status: 'ignored', message: 'Symbol not supported' };
    }
});

// Register routes
app.use(router.routes()).use(router.allowedMethods());

// Menjalankan server
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
