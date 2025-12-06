// bot.js - Вебхук для Telegram Bot
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();

const TOKEN = '7956310646:AAGotWsx5pVVmMskeTIOtnYMj68jZYDiFmk';
const bot = new TelegramBot(TOKEN, { polling: true });

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    
    const welcomeMessage = `🎮 <b>Добро пожаловать в Желткоин Игру, ${firstName || 'Игрок'}!</b>\n\n` +
                          `💰 <b>Ваш стартовый баланс:</b> 1,000 🟡\n` +
                          `🐱 <b>Ваш питомец:</b> Дима (базовый уровень)\n\n` +
                          `📱 <b>Как играть:</b>\n` +
                          `• 🎰 <b>Казино:</b> Крутите колесо за 600 🟡\n` +
                          `• 💼 <b>Работа:</b> Кликайте чтобы заработать\n` +
                          `• 🐱 <b>Питомец:</b> Ухаживайте за ним\n` +
                          `• 📋 <b>Задания:</b> Выполняйте для наград\n\n` +
                          `🔔 <b>Уведомления:</b> Я буду сообщать если питомцу нужна помощь!\n\n` +
                          `<i>Нажмите кнопку ниже чтобы открыть игру</i>`;
    
    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[
                {
                    text: "🎮 Открыть игру",
                    web_app: { url: "https://ваш-сайт.com" }
                }
            ]]
        }
    });
});

// Команда /status - проверить состояние питомца
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Здесь нужно подключиться к вашей базе данных
    // Пример: const userData = await getUserData(chatId);
    
    const statusMessage = `📊 <b>Статус питомца:</b>\n\n` +
                         `🍖 Голод: 75%\n` +
                         `💧 Жажда: 80%\n` +
                         `🎮 Счастье: 65%\n` +
                         `💤 Энергия: 90%\n` +
                         `❤️ Здоровье: 78%\n\n` +
                         `⭐ Уровень: Базовый\n` +
                         `💰 Баланс: 1,250 🟡\n\n` +
                         `<i>Откройте игру для полной информации</i>`;
    
    bot.sendMessage(chatId, statusMessage, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[
                {
                    text: "📱 Открыть игру",
                    web_app: { url: "https://ваш-сайт.com" }
                }
            ]]
        }
    });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `❓ <b>Помощь по игре:</b>\n\n` +
                       `<b>Основные команды:</b>\n` +
                       `/start - Начать игру\n` +
                       `/status - Статус питомца\n` +
                       `/help - Эта справка\n\n` +
                       `<b>В игре:</b>\n` +
                       `🎰 <b>Казино</b> - Крутите колесо фортуны\n` +
                       `💼 <b>Работа</b> - Зарабатывайте кликами\n` +
                       `🐱 <b>Питомец</b> - Ухаживайте за тамагочи\n` +
                       `🛍️ <b>Магазин</b> - Покупайте еду и игрушки\n\n` +
                       `<b>Уведомления:</b>\n` +
                       `Я буду присылать уведомления когда питомцу нужна помощь!`;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
});

app.listen(3000, () => {
    console.log('Telegram Bot запущен на порту 3000');
});
