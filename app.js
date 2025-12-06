// Основные переменные
let userData = {
    yellowCoins: 1000,
    currentCharacter: 'Психика',
    characterLevel: 'basic',
    characterExperience: 0,
    characterExperienceToNext: 100,
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
        hunger: 100,
        thirst: 100,
        happiness: 100,
        energy: 100,
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
        experience: 0,
        deathPercentage: 0
    },
    notifications: []
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

// Система заданий
const quests = {
    basic: [
        { id: 1, type: 'playTime', target: 5 * 60 * 60, description: '5 часов в игре', reward: 500 },
        { id: 2, type: 'spins', target: 10, description: '10 спинов колеса', reward: 300 },
        { id: 3, type: 'workSessions', target: 3, description: '3 работы', reward: 200 },
        { id: 4, type: 'earningsBasic', target: 5000, description: '5,000 Желткоинов', reward: 1000 },
        { id: 5, type: 'earningsBasic', target: 15000, description: '15,000 Желткоинов', reward: 2000 },
        { id: 6, type: 'clicks', target: 500, description: '500 кликов', reward: 400 }
    ]
};

// Магазин тамагочи (дорогие цены)
const tamagotchiShop = {
    food: [
        { id: 'apple', name: '🍎 Яблоко', price: 1000, description: 'Вкусное и полезное', effect: { hunger: 20, happiness: 5 } },
        { id: 'burger', name: '🍔 Бургер', price: 2500, description: 'Сытная еда', effect: { hunger: 40, happiness: 10, energy: -5 } },
        { id: 'pizza', name: '🍕 Пицца', price: 5000, description: 'Любимое лакомство', effect: { hunger: 60, happiness: 20 } },
        { id: 'salad', name: '🥗 Салат', price: 2000, description: 'Здоровое питание', effect: { hunger: 30, health: 10 } }
    ],
    drinks: [
        { id: 'water', name: '💧 Вода', price: 800, description: 'Чистая вода', effect: { thirst: 30 } },
        { id: 'juice', name: '🧃 Сок', price: 1500, description: 'Свежевыжатый сок', effect: { thirst: 40, happiness: 10 } },
        { id: 'cola', name: '🥤 Кола', price: 3000, description: 'Газировка', effect: { thirst: 50, happiness: 15, energy: 10 } },
        { id: 'milk', name: '🥛 Молоко', price: 2000, description: 'Полезно для костей', effect: { thirst: 35, health: 5 } }
    ],
    toys: [
        { id: 'ball', name: '⚽ Мяч', price: 3000, description: 'Для активных игр', effect: { happiness: 25, energy: -10 } },
        { id: 'gamepad', name: '🎮 Геймпад', price: 8000, description: 'Видеоигры', effect: { happiness: 40, energy: -15 } },
        { id: 'book', name: '📚 Книга', price: 2500, description: 'Развивает интеллект', effect: { happiness: 15, experience: 10 } },
        { id: 'tv', name: '📺 Телевизор', price: 15000, description: 'Мультики', effect: { happiness: 50 } }
    ],
    upgrades: [
        { id: 'house', name: '🏠 Домик', price: 50000, description: 'Уютный дом для питомца', effect: { happiness: 30, health: 20 } },
        { id: 'bed', name: '🛏️ Кровать', price: 25000, description: 'Мягкая кровать', effect: { energy: 40, happiness: 15 } },
        { id: 'pool', name: '🏊 Бассейн', price: 80000, description: 'Для купания', effect: { happiness: 50, thirst: 30 } }
    ]
};

// Инициализация приложения
function initApp() {
    console.log('🚀 Запуск приложения...');
    loadUserData();
    initTelegramWebApp();
    setupEventListeners();
    applyTheme(userData.currentTheme);
    startPlayTimeTracker();
    startTimers();
    startTamagotchiTimer();
    updateUI();
    updateTamagotchiUI();
    updateTamagotchiImage();
    updateDevButtons();
}

function initTelegramWebApp() {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
        
        const tgUser = Telegram.WebApp.initDataUnsafe?.user;
        if (tgUser) {
            document.getElementById('currentCharacterName').textContent = 
                tgUser.first_name || tgUser.username || 'Игрок';
        }
        
        Telegram.WebApp.setHeaderColor('#2D1B47');
        Telegram.WebApp.setBackgroundColor('#1A102C');
    }
}

function loadUserData() {
    const savedData = localStorage.getItem('yellowcoin_user');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            userData = { ...userData, ...parsed };
            checkTamagotchiAlive();
        } catch (e) {
            console.log('Ошибка загрузки данных');
        }
    }
}

// ПРОСТОЙ И НАДЕЖНЫЙ СПОСОБ НАСТРОЙКИ КНОПОК
function setupEventListeners() {
    console.log('🔄 Настройка обработчиков...');
    
    // 1. Кнопки на главном экране (самый простой способ)
    setTimeout(() => {
        // Казино
        const casinoElement = document.querySelector('.menu-card.casino');
        if (casinoElement) {
            casinoElement.onclick = () => {
                console.log('🎰 Казино кликнуто');
                showScreen('casinoScreen');
            };
        }
        
        // Работа
        const workElement = document.querySelector('.menu-card.work');
        if (workElement) {
            workElement.onclick = () => {
                console.log('💼 Работа кликнута');
                startWork();
            };
        }
        
        // Задания
        const questsElement = document.querySelector('.menu-card.quests');
        if (questsElement) {
            questsElement.onclick = () => {
                console.log('📋 Задания кликнуты');
                showScreen('questsScreen');
            };
        }
        
        // Магазин
        const shopElement = document.querySelector('.menu-card.tamagotchi-shop');
        if (shopElement) {
            shopElement.onclick = () => {
                console.log('🛍️ Магазин кликнут');
                showScreen('tamagotchiShopScreen');
            };
        }
        
        // Настройки
        const settingsElement = document.querySelector('.menu-card.settings');
        if (settingsElement) {
            settingsElement.onclick = () => {
                console.log('⚙️ Настройки кликнуты');
                showScreen('settingsScreen');
            };
        }
    }, 100);
    
    // 2. Кнопка "Жми!" в работе
    setTimeout(() => {
        const workClickBtn = document.getElementById('workClickBtn');
        if (workClickBtn) {
            workClickBtn.onclick = handleWorkClick;
        }
    }, 100);
    
    // 3. Кнопки "Назад"
    setTimeout(() => {
        const backBtns = document.querySelectorAll('.back-btn');
        backBtns.forEach(btn => {
            btn.onclick = function() {
                if (this.closest('#workScreen')) {
                    exitWork();
                } else {
                    showScreen('mainScreen');
                }
            };
        });
    }, 100);
    
    // 4. Кнопка "Спин" в казино
    setTimeout(() => {
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn) {
            spinBtn.onclick = spinWheel;
        }
    }, 100);
    
    // 5. Колесо казино
    setTimeout(() => {
        const wheel = document.getElementById('wheel');
        if (wheel) {
            wheel.addEventListener('transitionend', handleWheelSpinEnd);
        }
    }, 100);
    
    // 6. Кнопка сброса КД
    setTimeout(() => {
        const resetCdBtn = document.querySelector('.cdr-btn');
        if (resetCdBtn) {
            resetCdBtn.onclick = resetAllCooldowns;
        }
    }, 100);
    
    // 7. Кнопки тем
    setTimeout(() => {
        const themeBtns = document.querySelectorAll('.theme-btn');
        themeBtns.forEach(btn => {
            btn.onclick = function() {
                const theme = this.getAttribute('data-theme');
                changeTheme(theme);
            };
        });
    }, 100);
    
    // 8. Кнопка сброса прогресса
    setTimeout(() => {
        const resetProgressBtn = document.querySelector('.reset-btn');
        if (resetProgressBtn) {
            resetProgressBtn.onclick = resetProgress;
        }
    }, 100);
    
    // 9. Кнопки категорий магазина
    setTimeout(() => {
        const shopCategoryBtns = document.querySelectorAll('.shop-category-btn');
        shopCategoryBtns.forEach(btn => {
            btn.onclick = function() {
                shopCategoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const category = this.getAttribute('data-category');
                updateShopItems(category);
            };
        });
    }, 100);
    
    // 10. Кнопки тамагочи (кормить, поить и т.д.)
    setTimeout(() => {
        // Эти кнопки уже имеют onclick в HTML, но на всякий случай:
        window.feedTamagotchi = feedTamagotchi;
        window.waterTamagotchi = waterTamagotchi;
        window.playTamagotchi = playTamagotchi;
        window.sleepTamagotchi = sleepTamagotchi;
    }, 100);
    
    // 11. Кнопки разработки
    setTimeout(() => {
        window.addCoins = addCoins;
        window.levelUp = levelUp;
        window.completeAllQuests = completeAllQuests;
        window.fillTamagotchi = fillTamagotchi;
        window.evolveTamagotchi = evolveTamagotchi;
    }, 100);
    
    console.log('✅ Обработчики настроены');
}

function startPlayTimeTracker() {
    if (!userData.lastPlayTime) {
        userData.lastPlayTime = Date.now();
    }
    
    playTimeTimer = setInterval(() => {
        const now = Date.now();
        const timePassed = Math.floor((now - userData.lastPlayTime) / 1000);
        userData.totalPlayTime += timePassed;
        userData.questProgress.playTime += timePassed;
        userData.lastPlayTime = now;
        checkQuestsCompletion();
        saveUserData();
        updateUI();
    }, 60000);
}

function startTimers() {
    spinCooldownTimer = setInterval(() => {
        updateSpinCooldown();
        updateCooldownDisplays();
        checkSleepTimer();
    }, 1000);
    
    setInterval(() => {
        updateUI();
    }, 1000);
}

function startTamagotchiTimer() {
    tamagotchiTimer = setInterval(() => {
        updateTamagotchiStats();
        checkTamagotchiNeeds();
        updateTamagotchiUI();
        updateTamagotchiImage();
        saveUserData();
    }, 60000);
}

// Навигация
function showScreen(screenId) {
    console.log('📱 Переход на экран:', screenId);
    
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    if (screenId === 'questsScreen') {
        updateQuestsScreen();
    } else if (screenId === 'tamagotchiShopScreen') {
        updateShopItems('food');
        const shopBalance = document.getElementById('shopBalance');
        if (shopBalance) {
            shopBalance.textContent = userData.yellowCoins.toLocaleString() + ' 🟡';
        }
    }
    
    updateUI();
}

// Тема
function changeTheme(themeName) {
    userData.currentTheme = themeName;
    applyTheme(themeName);
    saveUserData();
    showNotification(`Тема: ${getThemeName(themeName)}`);
}

function applyTheme(themeName) {
    document.body.classList.remove('theme-dark', 'theme-purple', 'theme-blue', 'theme-green');
    document.body.classList.add(`theme-${themeName}`);
}

function getThemeName(themeName) {
    const themes = {
        'dark': 'Темная',
        'purple': 'Фиолетовая', 
        'blue': 'Синяя',
        'green': 'Зеленая'
    };
    return themes[themeName] || 'Темная';
}

// Сброс прогресса
function resetProgress() {
    if (!confirm('Сбросить весь прогресс?')) return;
    
    userData = {
        yellowCoins: 1000,
        currentCharacter: 'Психика',
        characterLevel: 'basic',
        characterExperience: 0,
        characterExperienceToNext: 100,
        completedQuests: 0,
        totalSpins: 0,
        totalEarnings: 0,
        workRecord: 0,
        totalClicks: 0,
        totalWorkSessions: 0,
        totalPlayTime: 0,
        lastWorkTime: null,
        lastSpinTime: null,
        lastPlayTime: Date.now(),
        currentTheme: userData.currentTheme,
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
            hunger: 100,
            thirst: 100,
            happiness: 100,
            energy: 100,
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
            experience: 0,
            deathPercentage: 0
        },
        notifications: []
    };
    
    saveUserData();
    updateUI();
    updateTamagotchiUI();
    updateTamagotchiImage();
    showNotification('Прогресс сброшен!');
    showScreen('mainScreen');
}

// КАЗИНО
function spinWheel() {
    console.log('🎰 Крутим колесо...');
    if (isSpinning) return;
    
    const now = Date.now();
    if (userData.lastSpinTime && (now - userData.lastSpinTime) < 5 * 60 * 1000) {
        const timeLeft = 5 * 60 * 1000 - (now - userData.lastSpinTime);
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        showNotification(`Спин через: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        return;
    }
    
    if (userData.yellowCoins < 600) {
        showNotification('Недостаточно 🟡');
        return;
    }
    
    userData.yellowCoins -= 600;
    userData.totalSpins++;
    userData.questProgress.spins++;
    userData.lastSpinTime = now;
    isSpinning = true;
    
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.classList.add('spinning');
        spinBtn.disabled = true;
    }
    
    const result = calculateSpinResult();
    currentSpinResult = result;
    
    const wheel = document.getElementById('wheel');
    const baseDegrees = 1800;
    const sectorAngle = 90;
    const targetAngle = baseDegrees + (result.multiplier * sectorAngle);
    const finalAngle = targetAngle + (Math.random() * 20 - 10);
    
    if (wheel) {
        wheel.style.transform = `rotate(${finalAngle}deg)`;
    }
    
    checkQuestsCompletion();
    saveUserData();
    updateUI();
}

function calculateSpinResult() {
    const random = Math.random();
    if (random < 0.25) return { multiplier: 0, text: '0', type: 'lose' };
    if (random < 0.5) return { multiplier: 2, text: 'X2', type: 'win' };
    if (random < 0.75) return { multiplier: 3, text: 'X3', type: 'win' };
    return { multiplier: 4, text: 'X4', type: 'win' };
}

function handleWheelSpinEnd() {
    if (!isSpinning) return;
    
    if (currentSpinResult.multiplier > 0) {
        const winAmount = 600 * currentSpinResult.multiplier;
        userData.yellowCoins += winAmount;
        userData.totalEarnings += winAmount;
        updateEarningsProgress(winAmount);
        showNotification(`🎉 Выигрыш: ${winAmount} 🟡`);
    } else {
        showNotification('😔 Вы проиграли! Потеряно 600 🟡');
    }
    
    isSpinning = false;
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) {
        spinBtn.classList.remove('spinning');
        spinBtn.disabled = false;
    }
    
    checkQuestsCompletion();
    saveUserData();
    updateUI();
}

function updateEarningsProgress(amount) {
    userData.questProgress.earningsBasic += amount;
    userData.questProgress.earningsMedium += amount;
    userData.questProgress.earningsPro += amount;
}

function updateSpinCooldown() {
    const cooldownInfo = document.getElementById('cooldownInfo');
    const casinoTimer = document.getElementById('casinoTimer');
    
    if (!userData.lastSpinTime) {
        if (cooldownInfo) cooldownInfo.style.display = 'none';
        if (casinoTimer) {
            casinoTimer.textContent = 'Доступно';
            casinoTimer.style.background = 'var(--success)';
        }
        return;
    }
    
    const now = Date.now();
    const timeLeft = 5 * 60 * 1000 - (now - userData.lastSpinTime);
    
    if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (cooldownInfo) {
            cooldownInfo.style.display = 'block';
            document.getElementById('cooldownTimer').textContent = timerText;
        }
        if (casinoTimer) {
            casinoTimer.textContent = timerText;
            casinoTimer.style.background = 'var(--danger)';
        }
    } else {
        if (cooldownInfo) cooldownInfo.style.display = 'none';
        if (casinoTimer) {
            casinoTimer.textContent = 'Доступно';
            casinoTimer.style.background = 'var(--success)';
        }
        const spinBtn = document.getElementById('spinBtn');
        if (spinBtn && !isSpinning) spinBtn.disabled = false;
    }
}

// РАБОТА
function startWork() {
    console.log('💼 Начинаем работу...');
    const now = Date.now();
    
    if (userData.lastWorkTime && (now - userData.lastWorkTime) < 60 * 60 * 1000) {
        const nextWork = userData.lastWorkTime + 60 * 60 * 1000;
        const minutesLeft = Math.ceil((nextWork - now) / (60 * 1000));
        showNotification(`Работа через ${minutesLeft} минут`);
        return;
    }
    
    showScreen('workScreen');
    startWorkGame();
}

function startWorkGame() {
    workClicks = 0;
    workTimeLeft = 30;
    isWorkActive = true;
    
    updateWorkDisplay();
    workTimer = setInterval(updateWorkTimer, 1000);
}

function updateWorkTimer() {
    workTimeLeft--;
    updateWorkDisplay();
    
    if (workTimeLeft <= 0) {
        finishWork();
    }
}

function updateWorkDisplay() {
    const timerElement = document.getElementById('workTimer');
    const clickElement = document.getElementById('clickCount');
    const timerFillElement = document.getElementById('timerFill');
    const earningsElement = document.getElementById('currentEarnings');
    
    if (timerElement) timerElement.textContent = workTimeLeft;
    if (clickElement) clickElement.textContent = workClicks;
    
    if (timerFillElement) {
        const progress = (30 - workTimeLeft) / 30 * 100;
        timerFillElement.style.background = 
            `conic-gradient(var(--accent) ${progress}%, transparent ${progress}%)`;
    }
    
    if (earningsElement) {
        const earnings = calculateWorkEarnings();
        earningsElement.textContent = earnings;
    }
}

function handleWorkClick() {
    if (!isWorkActive) return;
    
    workClicks++;
    userData.totalClicks++;
    userData.questProgress.clicks++;
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    updateWorkDisplay();
    checkQuestsCompletion();
    saveUserData();
}

function calculateWorkEarnings() {
    return Math.min(80, Math.floor(workClicks / 2));
}

function finishWork() {
    clearInterval(workTimer);
    isWorkActive = false;
    
    const earnings = calculateWorkEarnings();
    userData.yellowCoins += earnings;
    userData.totalEarnings += earnings;
    userData.totalWorkSessions++;
    userData.questProgress.workSessions++;
    userData.lastWorkTime = Date.now();
    
    if (workClicks > userData.workRecord) {
        userData.workRecord = workClicks;
    }
    
    updateEarningsProgress(earnings);
    checkQuestsCompletion();
    saveUserData();
    
    showNotification(`Заработано: ${earnings} 🟡`);
    showScreen('mainScreen');
    updateUI();
}

function exitWork() {
    if (isWorkActive) {
        clearInterval(workTimer);
        isWorkActive = false;
        
        const earnings = calculateWorkEarnings();
        if (earnings > 0) {
            userData.yellowCoins += earnings;
            userData.totalEarnings += earnings;
            updateEarningsProgress(earnings);
            showNotification(`Досрочный выход: +${earnings} 🟡`);
            saveUserData();
        }
    }
    showScreen('mainScreen');
}

// Сброс всех КД
function resetAllCooldowns() {
    if (userData.yellowCoins < 20000) {
        showNotification('Недостаточно 🟡 для сброса КД!');
        return;
    }
    
    if (!confirm('Сбросить все КД за 20,000 🟡?')) return;
    
    userData.lastSpinTime = null;
    userData.lastWorkTime = null;
    userData.yellowCoins -= 20000;
    
    updateCooldownDisplays();
    updateUI();
    saveUserData();
    
    showNotification('✅ Все КД сброшены!');
    
    if (isWorkActive) {
        clearInterval(workTimer);
        isWorkActive = false;
        showScreen('mainScreen');
        showNotification('Текущая сессия работы завершена');
    }
}

// ТАМАГОЧИ СИСТЕМА
function updateTamagotchiStats() {
    if (!userData.tamagotchi.isAlive) return;
    
    const now = Date.now();
    const hoursSinceFed = (now - userData.tamagotchi.lastFed) / (1000 * 60 * 60);
    const hoursSinceWatered = (now - userData.tamagotchi.lastWatered) / (1000 * 60 * 60);
    const hoursSincePlayed = (now - userData.tamagotchi.lastPlayed) / (1000 * 60 * 60);
    const hoursSinceSleep = (now - userData.tamagotchi.lastSleep) / (1000 * 60 * 60);
    
    userData.tamagotchi.hunger -= hoursSinceFed * 2;
    userData.tamagotchi.thirst -= hoursSinceWatered * 3;
    userData.tamagotchi.happiness -= hoursSincePlayed * 1.5;
    userData.tamagotchi.energy -= hoursSinceSleep * 1;
    
    userData.tamagotchi.hunger = Math.max(0, Math.min(100, userData.tamagotchi.hunger));
    userData.tamagotchi.thirst = Math.max(0, Math.min(100, userData.tamagotchi.thirst));
    userData.tamagotchi.happiness = Math.max(0, Math.min(100, userData.tamagotchi.happiness));
    userData.tamagotchi.energy = Math.max(0, Math.min(100, userData.tamagotchi.energy));
    
    updateTamagotchiHealth();
    checkTamagotchiAlive();
}

function updateTamagotchiHealth() {
    let healthScore = 0;
    healthScore += userData.tamagotchi.hunger * 0.25;
    healthScore += userData.tamagotchi.thirst * 0.25;
    healthScore += userData.tamagotchi.happiness * 0.25;
    healthScore += userData.tamagotchi.energy * 0.25;
    userData.tamagotchi.health = Math.max(0, Math.min(100, healthScore));
    
    userData.tamagotchi.deathPercentage = Math.max(0, 100 - userData.tamagotchi.health);
}

function checkTamagotchiAlive() {
    if (userData.tamagotchi.health <= 0) {
        userData.tamagotchi.isAlive = false;
        userData.tamagotchi.deathPercentage = 100;
    }
}

function checkTamagotchiNeeds() {
    if (!userData.tamagotchi.isAlive) return;
    
    if (userData.tamagotchi.hunger < 20) {
        addNotification('🍖 Ваш питомец очень голоден!');
    }
    if (userData.tamagotchi.thirst < 20) {
        addNotification('💧 Ваш питомец хочет пить!');
    }
    if (userData.tamagotchi.happiness < 20) {
        addNotification('😔 Ваш питомец грустит!');
    }
    if (userData.tamagotchi.energy < 20) {
        addNotification('💤 Ваш питомец хочет спать!');
    }
    if (userData.tamagotchi.deathPercentage > 70) {
        addNotification('💀 Питомец близок к смерти! Срочно помогите ему!');
    }
}

function addNotification(message) {
    userData.notifications.push({
        message: message,
        time: Date.now(),
        read: false
    });
    saveUserData();
}

// ДОРОГИЕ ФУНКЦИИ ТАМАГОЧИ
function feedTamagotchi() {
    console.log('🍖 Кормим питомца...');
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
    updateTamagotchiUI();
    saveUserData();
}

function waterTamagotchi() {
    console.log('💧 Поим питомца...');
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
    updateTamagotchiUI();
    saveUserData();
}

function playTamagotchi() {
    console.log('🎮 Играем с питомцем...');
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
    updateTamagotchiUI();
    saveUserData();
}

function sleepTamagotchi() {
    console.log('💤 Укладываем питомца спать...');
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
            updateTamagotchiUI();
            saveUserData();
            checkSleepTimer();
        }
    }, 1000);
}

function checkSleepTimer() {
    const sleepBtns = document.querySelectorAll('.tamagotchi-btn');
    sleepBtns.forEach(btn => {
        if (btn.textContent.includes('💤')) {
            if (sleepTimer) {
                const minutes = Math.floor(sleepTimeLeft / 60);
                const seconds = sleepTimeLeft % 60;
                btn.textContent = `💤 ${minutes}:${seconds.toString().padStart(2, '0')}`;
                btn.disabled = true;
            } else {
                btn.textContent = '💤 Спать';
                btn.disabled = false;
            }
        }
    });
}

function checkLevelUp() {
    const oldLevel = userData.tamagotchi.level;
    
    if (userData.tamagotchi.experience >= 100 && userData.tamagotchi.level === 'basic') {
        userData.tamagotchi.level = 'medium';
        userData.tamagotchi.name = 'Эсо';
        showNotification('🎉 Питомец достиг среднего уровня! Теперь он Эсо!');
    } else if (userData.tamagotchi.experience >= 300 && userData.tamagotchi.level === 'medium') {
        userData.tamagotchi.level = 'pro';
        userData.tamagotchi.name = 'Лоя';
        showNotification('🏆 Питомец достиг профи уровня! Теперь он Лоя!');
    }
    
    if (oldLevel !== userData.tamagotchi.level) {
        updateTamagotchiImage();
    }
}

function updateTamagotchiImage() {
    const imgElement = document.getElementById('tamagotchiImg');
    const imageContainer = document.getElementById('tamagotchiImage');
    
    if (!userData.tamagotchi.isAlive) {
        imgElement.src = 'dima.png';
        imageContainer.classList.add('dead');
        return;
    }
    
    imageContainer.classList.remove('dead');
    
    if (userData.tamagotchi.level === 'basic') {
        imgElement.src = 'dima.png';
    } else if (userData.tamagotchi.level === 'medium') {
        imgElement.src = 'eso.png';
    } else if (userData.tamagotchi.level === 'pro') {
        imgElement.src = 'loya.png';
    }
}

function updateTamagotchiUI() {
    const statusElement = document.getElementById('tamagotchiStatus');
    const deathBar = document.getElementById('deathBar');
    
    if (statusElement) {
        if (!userData.tamagotchi.isAlive) {
            statusElement.textContent = '💀 Мертв';
            statusElement.className = 'tamagotchi-status dead';
            if (deathBar) {
                deathBar.style.width = '100%';
            }
            return;
        }
        
        let status = '😊 Счастлив';
        let statusClass = 'tamagotchi-status';
        
        if (userData.tamagotchi.hunger < 30) {
            status = '🍖 Голоден';
            statusClass += ' hungry';
        } else if (userData.tamagotchi.thirst < 30) {
            status = '💧 Жаждет';
            statusClass += ' thirsty';
        } else if (userData.tamagotchi.happiness < 30) {
            status = '😔 Грустит';
            statusClass += ' sad';
        } else if (userData.tamagotchi.energy < 30) {
            status = '💤 Устал';
            statusClass += ' sleepy';
        }
        
        statusElement.textContent = status;
        statusElement.className = statusClass;
    }
    
    if (deathBar) {
        deathBar.style.width = `${userData.tamagotchi.deathPercentage}%`;
        if (userData.tamagotchi.deathPercentage > 70) {
            deathBar.style.background = 'var(--danger)';
        } else if (userData.tamagotchi.deathPercentage > 40) {
            deathBar.style.background = 'var(--warning)';
        } else {
            deathBar.style.background = 'var(--success)';
        }
        
        const deathPercentageText = document.getElementById('deathPercentageText');
        if (deathPercentageText) {
            deathPercentageText.textContent = `${Math.round(userData.tamagotchi.deathPercentage)}% до смерти`;
        }
    }
    
    updateProgressBar('hungerBar', userData.tamagotchi.hunger);
    updateProgressBar('thirstBar', userData.tamagotchi.thirst);
    updateProgressBar('happinessBar', userData.tamagotchi.happiness);
    updateProgressBar('energyBar', userData.tamagotchi.energy);
}

function updateProgressBar(barId, value) {
    const bar = document.getElementById(barId);
    if (bar) {
        bar.style.width = `${value}%`;
        if (value < 30) {
            bar.style.background = 'var(--danger)';
        } else if (value < 60) {
            bar.style.background = 'var(--warning)';
        } else {
            bar.style.background = 'var(--success)';
        }
    }
}

// МАГАЗИН
function updateShopItems(category = 'food') {
    const shopItemsElement = document.getElementById('shopItems');
    const shopBalance = document.getElementById('shopBalance');
    if (!shopItemsElement) return;
    
    if (shopBalance) {
        shopBalance.textContent = userData.yellowCoins.toLocaleString() + ' 🟡';
    }
    
    shopItemsElement.innerHTML = '';
    const items = tamagotchiShop[category] || [];
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.innerHTML = `
            <div class="shop-item-header">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">${item.price} 🟡</div>
            </div>
            <div class="shop-item-desc">${item.description}</div>
            <div class="shop-item-effects">
                Эффекты: ${getItemEffectsText(item.effect)}
            </div>
            <button class="shop-buy-btn" onclick="buyTamagotchiItem('${item.id}', '${category}')" 
                    ${userData.yellowCoins < item.price ? 'disabled' : ''}>
                Купить
            </button>
        `;
        shopItemsElement.appendChild(itemElement);
    });
}

function getItemEffectsText(effects) {
    const parts = [];
    if (effects.hunger) parts.push(`Голод: ${effects.hunger > 0 ? '+' : ''}${effects.hunger}`);
    if (effects.thirst) parts.push(`Жажда: ${effects.thirst > 0 ? '+' : ''}${effects.thirst}`);
    if (effects.happiness) parts.push(`Счастье: ${effects.happiness > 0 ? '+' : ''}${effects.happiness}`);
    if (effects.energy) parts.push(`Энергия: ${effects.energy > 0 ? '+' : ''}${effects.energy}`);
    if (effects.health) parts.push(`Здоровье: ${effects.health > 0 ? '+' : ''}${effects.health}`);
    if (effects.experience) parts.push(`Опыт: ${effects.experience > 0 ? '+' : ''}${effects.experience}`);
    return parts.join(', ');
}

function buyTamagotchiItem(itemId, category) {
    const item = tamagotchiShop[category].find(i => i.id === itemId);
    if (!item) return;
    
    if (userData.yellowCoins < item.price) {
        showNotification('Недостаточно 🟡!');
        return;
    }
    
    userData.yellowCoins -= item.price;
    
    if (item.effect.hunger) {
        userData.tamagotchi.hunger = Math.min(100, userData.tamagotchi.hunger + item.effect.hunger);
    }
    if (item.effect.thirst) {
        userData.tamagotchi.thirst = Math.min(100, userData.tamagotchi.thirst + item.effect.thirst);
    }
    if (item.effect.happiness) {
        userData.tamagotchi.happiness = Math.min(100, userData.tamagotchi.happiness + item.effect.happiness);
    }
    if (item.effect.energy) {
        userData.tamagotchi.energy = Math.min(100, userData.tamagotchi.energy + item.effect.energy);
    }
    if (item.effect.health) {
        userData.tamagotchi.health = Math.min(100, userData.tamagotchi.health + item.effect.health);
    }
    if (item.effect.experience) {
        userData.tamagotchi.experience += item.effect.experience;
        checkLevelUp();
    }
    
    if (!userData.tamagotchi.inventory[category]) {
        userData.tamagotchi.inventory[category] = [];
    }
    userData.tamagotchi.inventory[category].push(item);
    
    showNotification(`✅ Куплено: ${item.name} за ${item.price} 🟡`);
    updateUI();
    updateTamagotchiUI();
    saveUserData();
    
    updateShopItems(category);
}

// СИСТЕМА ЗАДАНИЙ
function checkQuestsCompletion() {
    const currentQuests = getCurrentQuests();
    currentQuests.forEach(quest => {
        if (isQuestCompleted(quest) && !isQuestClaimed(quest.id)) {
            completeQuest(quest);
        }
    });
}

function getCurrentQuests() {
    return quests.basic;
}

function isQuestCompleted(quest) {
    const progress = userData.questProgress[quest.type] || 0;
    return progress >= quest.target;
}

function isQuestClaimed(questId) {
    return userData.completedQuests >= questId;
}

function completeQuest(quest) {
    userData.yellowCoins += quest.reward;
    userData.totalEarnings += quest.reward;
    userData.completedQuests = Math.max(userData.completedQuests, quest.id);
    
    updateEarningsProgress(quest.reward);
    showNotification(`✅ Задание! +${quest.reward} 🟡`);
    saveUserData();
    updateUI();
}

function updateQuestsScreen() {
    const questsList = document.getElementById('questsList');
    if (!questsList) return;

    questsList.innerHTML = '';
    const currentQuests = getCurrentQuests();

    currentQuests.forEach(quest => {
        let progress = userData.questProgress[quest.type] || 0;
        let target = quest.target;
        
        if (quest.type === 'playTime') {
            progress = Math.floor(progress / 3600);
            target = Math.floor(target / 3600);
        }
        
        const isCompleted = isQuestCompleted(quest);
        const isClaimed = isQuestClaimed(quest.id);

        const questElement = document.createElement('div');
        questElement.className = `quest-item ${isCompleted ? 'completed' : ''}`;
        questElement.innerHTML = `
            <div class="quest-header">
                <div class="quest-title">${quest.description}</div>
                <div class="quest-reward">+${quest.reward}</div>
            </div>
            <div class="quest-description">
                Прогресс: ${progress}/${target}${quest.type === 'playTime' ? 'ч' : ''}
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(100, (progress / target) * 100)}%"></div>
            </div>
            ${isClaimed ? '<div class="quest-status">✅</div>' : ''}
        `;

        questsList.appendChild(questElement);
    });
    
    const overallProgress = document.getElementById('overallQuestProgress');
    const currentLevelProgress = document.getElementById('currentLevelProgress');
    const levelProgressBar = document.getElementById('levelProgressBar');
    
    if (overallProgress) {
        overallProgress.textContent = `${userData.completedQuests}/15`;
    }
    
    if (currentLevelProgress) {
        currentLevelProgress.textContent = userData.completedQuests;
    }
    
    if (levelProgressBar) {
        levelProgressBar.style.width = `${Math.min(100, (userData.completedQuests / 15) * 100)}%`;
    }
}

// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
function updateUI() {
    updateMainScreen();
    updateCasinoScreen();
    updateWorkScreen();
    updateWorkCooldown();
    updateCooldownDisplays();
    updateDevButtons();
}

function updateMainScreen() {
    const balanceDisplay = document.getElementById('balanceDisplay');
    if (balanceDisplay) {
        balanceDisplay.textContent = userData.yellowCoins.toLocaleString() + ' 🟡';
    }
    
    const characterName = document.getElementById('currentCharacterName');
    if (characterName && !window.Telegram?.WebApp?.initDataUnsafe?.user) {
        characterName.textContent = userData.currentCharacter;
    }
    
    const characterAvatar = document.getElementById('currentCharacterAvatar');
    if (characterAvatar) {
        characterAvatar.textContent = userData.currentCharacter === 'Психика' ? '🧠' : '🌟';
    }
    
    const characterLevel = document.getElementById('characterLevel');
    if (characterLevel) {
        const levelText = userData.characterLevel === 'basic' ? 'Базовый' : 
                         userData.characterLevel === 'medium' ? 'Средний' : 'Профессионал';
        characterLevel.textContent = levelText;
    }
    
    const characterExperienceBar = document.getElementById('characterExperienceBar');
    const characterExperienceText = document.getElementById('characterExperienceText');
    if (characterExperienceBar && characterExperienceText) {
        const expPercentage = (userData.characterExperience / userData.characterExperienceToNext) * 100;
        characterExperienceBar.style.width = `${Math.min(100, expPercentage)}%`;
        characterExperienceText.textContent = `${userData.characterExperience}/${userData.characterExperienceToNext}`;
    }
    
    const questsProgress = document.getElementById('questsProgress');
    const questProgressBar = document.getElementById('questProgressBar');
    if (questsProgress && questProgressBar) {
        questsProgress.textContent = `${userData.completedQuests}/15`;
        questProgressBar.style.width = `${Math.min(100, (userData.completedQuests / 15) * 100)}%`;
    }
    
    const totalSpins = document.getElementById('totalSpins');
    if (totalSpins) totalSpins.textContent = userData.totalSpins;
    
    const totalEarnings = document.getElementById('totalEarnings');
    if (totalEarnings) totalEarnings.textContent = userData.totalEarnings.toLocaleString();
    
    const completedQuests = document.getElementById('completedQuests');
    if (completedQuests) completedQuests.textContent = userData.completedQuests;
}

function updateCasinoScreen() {
    const casinoBalance = document.getElementById('casinoBalance');
    if (casinoBalance) {
        casinoBalance.textContent = userData.yellowCoins.toLocaleString() + ' 🟡';
    }
}

function updateWorkScreen() {
    const workBalance = document.getElementById('workBalance');
    if (workBalance) {
        workBalance.textContent = userData.yellowCoins.toLocaleString() + ' 🟡';
    }
    
    const workRecord = document.querySelector('#workRecord');
    if (workRecord) {
        workRecord.textContent = userData.workRecord + ' кликов';
    }
}

function updateWorkCooldown() {
    const badge = document.getElementById('workTimerBadge');
    if (!badge) return;
    
    const now = Date.now();
    
    if (!userData.lastWorkTime || (now - userData.lastWorkTime) >= 60 * 60 * 1000) {
        badge.textContent = 'Доступно';
        badge.style.background = 'var(--success)';
    } else {
        const nextWork = userData.lastWorkTime + 60 * 60 * 1000;
        const minutesLeft = Math.ceil((nextWork - now) / (60 * 1000));
        badge.textContent = `Через ${minutesLeft}м`;
        badge.style.background = 'var(--danger)';
    }
}

function updateCooldownDisplays() {
    const casinoCdElement = document.getElementById('casinoCdStatus');
    const workCdElement = document.getElementById('workCdStatus');
    
    if (!casinoCdElement || !workCdElement) return;
    
    const now = Date.now();
    let casinoCdText = 'Доступно';
    if (userData.lastSpinTime) {
        const timeLeft = 5 * 60 * 1000 - (now - userData.lastSpinTime);
        if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            casinoCdText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    casinoCdElement.textContent = casinoCdText;
    
    let workCdText = 'Доступно';
    if (userData.lastWorkTime) {
        const timeLeft = 60 * 60 * 1000 - (now - userData.lastWorkTime);
        if (timeLeft > 0) {
            const minutes = Math.ceil(timeLeft / (60 * 1000));
            workCdText = `${minutes} мин`;
        }
    }
    workCdElement.textContent = workCdText;
    
    const resetBtn = document.querySelector('.cdr-btn');
    if (resetBtn) {
        const hasEnoughCoins = userData.yellowCoins >= 20000;
        const hasAnyCooldown = (userData.lastSpinTime && (now - userData.lastSpinTime) < 5 * 60 * 1000) || 
                              (userData.lastWorkTime && (now - userData.lastWorkTime) < 60 * 60 * 1000);
        
        resetBtn.disabled = !hasEnoughCoins || !hasAnyCooldown;
    }
}

// УВЕДОМЛЕНИЯ
function showNotification(message) {
    console.log('🔔 Уведомление:', message);
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    if (!notification || !text) return;
    
    text.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

// СОХРАНЕНИЕ ДАННЫХ
function saveUserData() {
    try {
        localStorage.setItem('yellowcoin_user', JSON.stringify(userData));
    } catch (e) {
        console.log('Ошибка сохранения:', e);
    }
}

// КНОПКИ РАЗРАБОТКИ
function updateDevButtons() {
    let devContainer = document.getElementById('devButtonsContainer');
    if (!devContainer) {
        devContainer = document.createElement('div');
        devContainer.id = 'devButtonsContainer';
        devContainer.style.position = 'fixed';
        devContainer.style.bottom = '70px';
        devContainer.style.right = '10px';
        devContainer.style.zIndex = '9999';
        devContainer.style.display = 'flex';
        devContainer.style.flexDirection = 'column';
        devContainer.style.gap = '5px';
        devContainer.style.pointerEvents = 'auto';
        document.body.appendChild(devContainer);
    }
    
    devContainer.innerHTML = '';
    
    const devButtons = [
        {
            text: '💰 +100К',
            onClick: () => addCoins(100000),
            color: '#FFD700'
        },
        {
            text: '⬆️ Уровень',
            onClick: levelUp,
            color: '#4CAF50'
        },
        {
            text: '✅ Квесты',
            onClick: completeAllQuests,
            color: '#2196F3'
        },
        {
            text: '🐱 Наполнить',
            onClick: fillTamagotchi,
            color: '#FF9800'
        },
        {
            text: '🌟 Эволюция',
            onClick: evolveTamagotchi,
            color: '#9C27B0'
        }
    ];
    
    devButtons.forEach(button => {
        const btn = document.createElement('button');
        btn.textContent = button.text;
        btn.style.background = button.color;
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '50%';
        btn.style.width = '40px';
        btn.style.height = '40px';
        btn.style.fontSize = '12px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.margin = '0';
        btn.style.padding = '0';
        btn.onclick = button.onClick;
        devContainer.appendChild(btn);
    });
    
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '👁️';
    toggleBtn.style.background = '#333';
    toggleBtn.style.color = 'white';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '50%';
    toggleBtn.style.width = '30px';
    toggleBtn.style.height = '30px';
    toggleBtn.style.fontSize = '10px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    toggleBtn.style.marginTop = '5px';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.justifyContent = 'center';
    
    let buttonsVisible = true;
    toggleBtn.onclick = () => {
        buttonsVisible = !buttonsVisible;
        devContainer.style.opacity = buttonsVisible ? '1' : '0.3';
    };
    
    devContainer.appendChild(toggleBtn);
}

// Функции для кнопок разработки
function addCoins(amount) {
    userData.yellowCoins += amount;
    userData.totalEarnings += amount;
    showNotification(`💰 Добавлено ${amount.toLocaleString()} желткоинов!`);
    saveUserData();
    updateUI();
}

function levelUp() {
    if (userData.characterLevel === 'basic') {
        userData.characterLevel = 'medium';
        userData.characterExperience = 0;
        userData.characterExperienceToNext = 200;
        showNotification('⬆️ Уровень повышен до Среднего!');
    } else if (userData.characterLevel === 'medium') {
        userData.characterLevel = 'pro';
        userData.characterExperience = 0;
        userData.characterExperienceToNext = 300;
        showNotification('⬆️ Уровень повышен до Профессионала!');
    } else {
        userData.characterExperience += 50;
        showNotification('📈 Опыт увеличен на 50!');
    }
    saveUserData();
    updateUI();
}

function completeAllQuests() {
    userData.completedQuests = 15;
    const totalReward = quests.basic.reduce((sum, quest) => sum + quest.reward, 0);
    userData.yellowCoins += totalReward;
    userData.totalEarnings += totalReward;
    
    userData.questProgress = {
        playTime: 5 * 60 * 60,
        spins: 10,
        workSessions: 3,
        earningsBasic: 15000,
        earningsMedium: 15000,
        earningsPro: 15000,
        clicks: 500
    };
    
    showNotification('✅ Все задания выполнены!');
    saveUserData();
    updateUI();
    updateQuestsScreen();
}

function fillTamagotchi() {
    userData.tamagotchi.hunger = 100;
    userData.tamagotchi.thirst = 100;
    userData.tamagotchi.happiness = 100;
    userData.tamagotchi.energy = 100;
    userData.tamagotchi.health = 100;
    userData.tamagotchi.deathPercentage = 0;
    userData.tamagotchi.isAlive = true;
    
    userData.tamagotchi.lastFed = Date.now();
    userData.tamagotchi.lastWatered = Date.now();
    userData.tamagotchi.lastPlayed = Date.now();
    userData.tamagotchi.lastSleep = Date.now();
    
    showNotification('🐱 Питомец полностью восстановлен!');
    saveUserData();
    updateTamagotchiUI();
}

function evolveTamagotchi() {
    if (userData.tamagotchi.level === 'basic') {
        userData.tamagotchi.level = 'medium';
        userData.tamagotchi.name = 'Эсо';
        userData.tamagotchi.experience = 100;
    } else if (userData.tamagotchi.level === 'medium') {
        userData.tamagotchi.level = 'pro';
        userData.tamagotchi.name = 'Лоя';
        userData.tamagotchi.experience = 300;
    } else {
        userData.tamagotchi.experience += 100;
    }
    
    showNotification('🌟 Питомец эволюционировал!');
    saveUserData();
    updateTamagotchiUI();
    updateTamagotchiImage();
}

// ЗАПУСК ПРИЛОЖЕНИЯ
console.log('📦 Скрипт загружен, запускаем инициализацию...');
document.addEventListener('DOMContentLoaded', initApp);
