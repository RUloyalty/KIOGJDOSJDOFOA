// Основные переменные
let userData = {
    yellowCoins: 1000,
    currentCharacter: 'Игрок',
    characterLevel: 'basic',
    completedQuests: 0,
    totalSpins: 0,
    totalEarnings: 0,
    workRecord: 0,
    totalClicks: 0,
    totalWorkSessions: 0,
    totalPlayTime: 0,
    lastWorkTime: null,
    lastSpinTime: null,
    lastPlayTime: null,
    currentTheme: 'dark',
    questProgress: {
        playTime: 0,
        spins: 0,
        workSessions: 0,
        earningsBasic: 0,
        earningsMedium: 0,
        earningsPro: 0,
        clicks: 0
    },
    tamagotchi: {
        name: 'Дима',
        level: 'basic',
        hunger: 80,
        thirst: 80,
        happiness: 80,
        energy: 80,
        lastFed: Date.now(),
        lastWatered: Date.now(),
        lastPlayed: Date.now(),
        lastSleep: Date.now(),
        isAlive: true,
        inventory: {
            food: [],
            drinks: [],
            toys: [],
            upgrades: []
        },
        health: 100,
        experience: 0
    },
    notifications: [],
    telegramUserId: null,
    lastTelegramNotification: 0,
    lastCriticalNotification: 0
};

// Состояние игры
let isSpinning = false;
let currentSpinResult = null;
let workClicks = 0;
let workTimeLeft = 30;
let workTimer;
let isWorkActive = false;
let spinCooldownTimer;
let playTimeTimer;
let tamagotchiTimer;
let sleepTimer;
let sleepTimeLeft = 0;
let notificationCheckTimer;

// Инициализация приложения
function initApp() {
    console.log('🚀 Запуск игры...');
    loadUserData();
    initTelegramWebApp();
    setupEventListeners();
    applyTheme(userData.currentTheme);
    startPlayTimeTracker();
    startTimers();
    startTamagotchiTimer();
    startNotificationChecker();
    updateUI();
    updateTamagotchiUI();
    updateTamagotchiImage();
}

function initTelegramWebApp() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
        
        // Используем данные из Telegram
        const tgUser = Telegram.WebApp.initDataUnsafe?.user;
        if (tgUser) {
            userData.currentCharacter = tgUser.first_name || tgUser.username || 'Игрок';
            userData.telegramUserId = tgUser.id;
            
            // Показываем приветствие при первом входе
            if (!userData.hasSeenWelcome) {
                showTelegramWelcome(tgUser.first_name || 'Игрок');
                userData.hasSeenWelcome = true;
                saveUserData();
            }
        }
        
        Telegram.WebApp.setHeaderColor('#2D1B47');
        Telegram.WebApp.setBackgroundColor('#1A102C');
        document.body.classList.add('telegram-background');
        
        // Настраиваем кнопку обратной связи
        setupTelegramButtons();
    }
}

function setupTelegramButtons() {
    if (window.Telegram && Telegram.WebApp) {
        // Основная кнопка
        Telegram.WebApp.MainButton.setText("💬 Написать разработчику");
        Telegram.WebApp.MainButton.onClick(() => {
            // Открываем чат с разработчиком
            window.open('https://t.me/userloya', '_blank');
        });
        Telegram.WebApp.MainButton.show();
        
        // Кнопка настроек вверху
        Telegram.WebApp.SettingsButton.show();
        Telegram.WebApp.SettingsButton.onClick(() => {
            showScreen('settingsScreen');
        });
    }
}

function showTelegramWelcome(name) {
    const welcomeMessage = `🎮 <b>Добро пожаловать в Желткоин Игру, ${name}!</b>\n\n` +
                          `💰 <b>Ваш стартовый баланс:</b> 1,000 🟡\n` +
                          `🐱 <b>Ваш питомец:</b> Дима (базовый уровень)\n\n` +
                          `📱 <b>Как играть:</b>\n` +
                          `• 🎰 <b>Казино:</b> Крутите колесо за 600 🟡\n` +
                          `• 💼 <b>Работа:</b> Кликайте чтобы заработать\n` +
                          `• 🐱 <b>Питомец:</b> Ухаживайте за ним\n` +
                          `• 📋 <b>Задания:</b> Выполняйте для наград\n\n` +
                          `🔔 <b>Уведомления:</b> Игра будет уведомлять если питомцу нужна помощь!\n\n` +
                          `<i>Удачи в игре! 🎉</i>`;
    
    showNotificationLong(welcomeMessage, 5000);
}

function showNotificationLong(message, duration = 3000) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    if (!notification || !text) return;
    
    // Парсим HTML теги для форматирования
    const formattedMessage = message
        .replace(/<b>/g, '')
        .replace(/<\/b>/g, '')
        .replace(/<i>/g, '')
        .replace(/<\/i>/g, '');
    
    text.innerHTML = formattedMessage;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, duration);
}

// Система уведомлений для питомца
function startNotificationChecker() {
    notificationCheckTimer = setInterval(() => {
        checkTamagotchiNeeds();
    }, 60000); // Проверяем каждую минуту
}

function checkTamagotchiNeeds() {
    if (!userData.tamagotchi.isAlive) return;
    
    let needNotification = false;
    let notificationMessage = '';
    let isCritical = false;
    
    if (userData.tamagotchi.hunger < 20) {
        needNotification = true;
        notificationMessage = '🍖 Питомец голоден! Покормите его в игре.';
        isCritical = userData.tamagotchi.hunger < 10;
    }
    if (userData.tamagotchi.thirst < 20) {
        needNotification = true;
        notificationMessage = '💧 Питомец хочет пить! Напоите его в игре.';
        isCritical = userData.tamagotchi.thirst < 10;
    }
    if (userData.tamagotchi.happiness < 20) {
        needNotification = true;
        notificationMessage = '😔 Питомец грустит! Поиграйте с ним в игре.';
        isCritical = userData.tamagotchi.happiness < 10;
    }
    if (userData.tamagotchi.energy < 20) {
        needNotification = true;
        notificationMessage = '💤 Питомец устал! Уложите его спать в игре.';
        isCritical = userData.tamagotchi.energy < 10;
    }
    
    // Проверяем критическое состояние
    if (userData.tamagotchi.health < 30) {
        needNotification = true;
        notificationMessage = `🚨 Питомец в опасности! Здоровье: ${Math.round(userData.tamagotchi.health)}%`;
        isCritical = true;
    }
    
    // Отправляем уведомление в игре
    if (needNotification && notificationMessage) {
        addNotification(notificationMessage);
        
        // Для критических состояний показываем специальное уведомление
        if (isCritical) {
            showCriticalNotification(notificationMessage);
        }
    }
}

function showCriticalNotification(message) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    if (!notification || !text) return;
    
    text.textContent = message;
    notification.style.background = 'var(--danger)';
    notification.classList.remove('hidden');
    
    // Мигающая анимация для критических уведомлений
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
        notification.style.opacity = notification.style.opacity === '0.7' ? '1' : '0.7';
        blinkCount++;
        
        if (blinkCount >= 6) {
            clearInterval(blinkInterval);
            notification.style.opacity = '1';
            
            setTimeout(() => {
                notification.classList.add('hidden');
                notification.style.background = 'var(--success)';
            }, 3000);
        }
    }, 500);
}

// Функции взаимодействия с питомцем с улучшенными уведомлениями
function feedTamagotchi() {
    if (!userData.tamagotchi.isAlive) {
        showNotification('💀 Питомец умер! Возродите его в магазине.');
        return;
    }
    
    if (userData.yellowCoins < 1000) {
        showNotification('Недостаточно 🟡 для еды! Нужно 1,000 🟡');
        return;
    }
    
    userData.yellowCoins -= 1000;
    userData.tamagotchi.hunger = Math.min(100, userData.tamagotchi.hunger + 30);
    userData.tamagotchi.lastFed = Date.now();
    userData.tamagotchi.happiness = Math.min(100, userData.tamagotchi.happiness + 5);
    
    showNotification('🍖 Питомец покормлен за 1,000 🟡!');
    
    // Позитивная реакция питомца
    if (userData.tamagotchi.hunger > 70) {
        showPositiveFeedback('Питомец доволен! Голод устранен!');
    }
    
    updateTamagotchiUI();
    saveUserData();
}

function waterTamagotchi() {
    if (!userData.tamagotchi.isAlive) {
        showNotification('💀 Питомец умер! Возродите его в магазине.');
        return;
    }
    
    if (userData.yellowCoins < 800) {
        showNotification('Недостаточно 🟡 для воды! Нужно 800 🟡');
        return;
    }
    
    userData.yellowCoins -= 800;
    userData.tamagotchi.thirst = Math.min(100, userData.tamagotchi.thirst + 40);
    userData.tamagotchi.lastWatered = Date.now();
    
    showNotification('💧 Питомец напоен за 800 🟡!');
    
    if (userData.tamagotchi.thirst > 70) {
        showPositiveFeedback('Питомец благодарен! Жажда утолена!');
    }
    
    updateTamagotchiUI();
    saveUserData();
}

function playTamagotchi() {
    if (!userData.tamagotchi.isAlive) {
        showNotification('💀 Питомец умер! Возродите его в магазине.');
        return;
    }
    
    if (userData.tamagotchi.energy < 20) {
        showNotification('😴 Питомец слишком устал для игр!');
        return;
    }
    
    if (userData.yellowCoins < 500) {
        showNotification('Недостаточно 🟡 для игры! Нужно 500 🟡');
        return;
    }
    
    userData.yellowCoins -= 500;
    userData.tamagotchi.happiness = Math.min(100, userData.tamagotchi.happiness + 25);
    userData.tamagotchi.energy = Math.max(0, userData.tamagotchi.energy - 15);
    userData.tamagotchi.lastPlayed = Date.now();
    userData.tamagotchi.experience += 5;
    checkLevelUp();
    
    showNotification('🎮 Питомец поиграл за 500 🟡 и стал счастливее!');
    
    if (userData.tamagotchi.happiness > 70) {
        showPositiveFeedback('Питомец счастлив! +5 опыта!');
    }
    
    updateTamagotchiUI();
    saveUserData();
}

function sleepTamagotchi() {
    if (!userData.tamagotchi.isAlive) {
        showNotification('💀 Питомец умер! Возродите его в магазине.');
        return;
    }
    
    if (sleepTimer) {
        showNotification('😴 Питомец уже спит!');
        return;
    }
    
    if (userData.yellowCoins < 2000) {
        showNotification('Недостаточно 🟡 для сна! Нужно 2,000 🟡');
        return;
    }
    
    userData.yellowCoins -= 2000;
    showNotification('💤 Питомец лег спать на 10 минут за 2,000 🟡...');
    
    sleepTimeLeft = 600;
    sleepTimer = setInterval(() => {
        sleepTimeLeft--;
        checkSleepTimer();
        
        if (sleepTimeLeft <= 0) {
            clearInterval(sleepTimer);
            sleepTimer = null;
            userData.tamagotchi.energy = 100;
            userData.tamagotchi.lastSleep = Date.now();
            showNotification('💤 Питомец выспался! Энергия восстановлена!');
            showPositiveFeedback('Питомец полон энергии!');
            updateTamagotchiUI();
            saveUserData();
            checkSleepTimer();
        }
    }, 1000);
}

function showPositiveFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'positive-feedback';
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--success);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 16px;
        z-index: 1001;
        animation: floatUp 2s ease forwards;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Добавляем анимацию в CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        20% { 
            opacity: 1;
            transform: translate(-50%, -60%) scale(1);
        }
        80% { 
            opacity: 1;
            transform: translate(-50%, -60%) scale(1);
        }
        100% { 
            opacity: 0;
            transform: translate(-50%, -70%) scale(0.9);
        }
    }
    
    .positive-feedback {
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// Система экстренных напоминаний
function setupEmergencyReminders() {
    // Проверяем состояние питомца каждые 30 минут
    setInterval(() => {
        if (!userData.tamagotchi.isAlive) return;
        
        const now = Date.now();
        const hoursSinceFed = (now - userData.tamagotchi.lastFed) / (1000 * 60 * 60);
        const hoursSinceWatered = (now - userData.tamagotchi.lastWatered) / (1000 * 60 * 60);
        const hoursSincePlayed = (now - userData.tamagotchi.lastPlayed) / (1000 * 60 * 60);
        
        let reminderMessage = '';
        
        if (hoursSinceFed > 24) {
            reminderMessage = '🍖 Питомца не кормили больше суток!';
        } else if (hoursSinceWatered > 24) {
            reminderMessage = '💧 Питомца не поили больше суток!';
        } else if (hoursSincePlayed > 24) {
            reminderMessage = '🎮 С питомцем не играли больше суток!';
        }
        
        if (reminderMessage && !document.hidden) {
            showNotificationLong(`⚠️ Напоминание: ${reminderMessage}\n\nЗайдите в игру чтобы позаботиться о питомце!`, 5000);
        }
    }, 30 * 60 * 1000); // 30 минут
}

// Запускаем напоминания при старте
setTimeout(setupEmergencyReminders, 10000);

// Остальной код остается таким же, но добавьте эти функции:
// ... (остальной код из предыдущей версии)

// Добавляем кнопку помощи в настройки
function updateSettingsScreen() {
    const settingsContainer = document.querySelector('.settings-container');
    if (settingsContainer && !document.querySelector('.help-section')) {
        const helpSection = document.createElement('div');
        helpSection.className = 'settings-section help-section';
        helpSection.innerHTML = `
            <h3>❓ Помощь и поддержка</h3>
            <div class="help-actions">
                <button class="help-btn" onclick="showHelp()">
                    📖 Как играть
                </button>
                <button class="help-btn" onclick="contactDeveloper()">
                    💬 Написать разработчику
                </button>
                <button class="help-btn" onclick="showEmergencyGuide()">
                    🚨 Экстренная помощь питомцу
                </button>
            </div>
        `;
        
        settingsContainer.insertBefore(helpSection, settingsContainer.querySelector('.danger-zone'));
        
        // Добавляем стили
        const helpStyle = document.createElement('style');
        helpStyle.textContent = `
            .help-section {
                border: 2px solid var(--primary);
                border-radius: 12px;
                padding: 16px;
                background: rgba(138, 43, 226, 0.1);
            }
            
            .help-actions {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .help-btn {
                background: var(--dark);
                border: 2px solid var(--primary);
                border-radius: 12px;
                padding: 14px;
                color: var(--light);
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .help-btn:active {
                transform: scale(0.98);
                background: var(--primary);
            }
        `;
        document.head.appendChild(helpStyle);
    }
}

// Функции помощи
function showHelp() {
    const helpMessage = `🎮 <b>Помощь по игре:</b>\n\n` +
                       `<b>Основные функции:</b>\n` +
                       `🎰 <b>Казино</b> - Крутите колесо за 600 🟡\n` +
                       `💼 <b>Работа</b> - Зарабатывайте кликами (до 80 🟡)\n` +
                       `🐱 <b>Питомец</b> - Ухаживайте за тамагочи\n` +
                       `🛍️ <b>Магазин</b> - Покупайте еду и игрушки\n\n` +
                       `<b>Уход за питомцем:</b>\n` +
                       `🍖 <b>Кормить</b> - 1,000 🟡 (+30 голода)\n` +
                       `💧 <b>Поить</b> - 800 🟡 (+40 жажды)\n` +
                       `🎮 <b>Играть</b> - 500 🟡 (+25 счастья)\n` +
                       `💤 <b>Спать</b> - 2,000 🟡 (10 минут)\n\n` +
                       `<b>Уровни питомца:</b>\n` +
                       `1. Дима (базовый)\n` +
                       `2. Эсо (средний, 100 опыта)\n` +
                       `3. Лоя (профи, 300 опыта)`;
    
    showNotificationLong(helpMessage, 7000);
    showScreen('mainScreen');
}

function contactDeveloper() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.openTelegramLink('https://t.me/userloya');
    } else {
        window.open('https://t.me/userloya', '_blank');
    }
}

function showEmergencyGuide() {
    const emergencyMessage = `🚨 <b>Экстренная помощь питомцу:</b>\n\n` +
                            `<b>Если питомец:</b>\n` +
                            `🍖 <b>Голоден</b> - Немедленно покормите (1,000 🟡)\n` +
                            `💧 <b>Жаждет</b> - Срочно напоите (800 🟡)\n` +
                            `😔 <b>Грустит</b> - Поиграйте с ним (500 🟡)\n` +
                            `💤 <b>Устал</b> - Уложите спать (2,000 🟡)\n\n` +
                            `<b>Критическое состояние:</b>\n` +
                            `• Здоровье ниже 30% - СРОЧНО ухаживайте!\n` +
                            `• Если питомец умер - Возродите в магазине\n\n` +
                            `<i>Регулярно проверяйте показатели питомца!</i>`;
    
    showNotificationLong(emergencyMessage, 8000);
    showScreen('mainScreen');
}

// Обновляем функцию showScreen чтобы добавлять помощь
const originalShowScreen = showScreen;
showScreen = function(screenId) {
    originalShowScreen(screenId);
    
    if (screenId === 'settingsScreen') {
        setTimeout(updateSettingsScreen, 100);
    }
};

// Добавляем вибрацию для важных уведомлений
function vibrateNotification() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Обновляем функцию showNotification
function showNotification(message) {
    vibrateNotification();
    
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    if (!notification || !text) return;
    
    text.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}
