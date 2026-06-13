// --- 1. CONFIGURATION & STATE ---
let currentMode = 'study'; // Can be: 'study', 'short', or 'long'
let TOTAL_SESSION_TIME = 25 * 60; 
let timeLeft = TOTAL_SESSION_TIME; 
let timerId = null;     
let isRunning = false;  

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const plantStage = document.getElementById('plant-stage');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const tokenCountDisplay = document.getElementById('token-count');
const minutesCountDisplay = document.getElementById('minutes-count');
const progressBar = document.getElementById('progress-bar');
const motivationText = document.getElementById('motivation-text');

// Mode Tab Buttons
const modeStudyBtn = document.getElementById('mode-study');
const modeShortBtn = document.getElementById('mode-short');
const modeLongBtn = document.getElementById('mode-long');

// Mindfulness Quotes Array (Combats student burnout!)
const quotes = [
    "Breathing in, I calm body and mind. Breathing out, I smile.",
    "Progress, not perfection. Every single minute of focus counts.",
    "Do not sacrifice your mental health for a grade. Balance is power.",
    "Your worth is not defined by your productivity. Take it one breath at a time.",
    "Taking a break is part of the work. Allow your brain space to bloom.",
    "Deep breath in... hold it... release. You are exactly where you need to be."
];

// Load saved stats
let tokens = localStorage.getItem('zenBloomTokens') || 0;
let totalMinutes = localStorage.getItem('zenBloomMinutes') || 0;
tokenCountDisplay.innerText = tokens;
minutesCountDisplay.innerText = totalMinutes;

// Sound Synthesizer Chime
function playSound(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'success') {
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // High C
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E
        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.6);
    } else if (type === 'warning') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // Low buzz
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
}

// --- 2. THE SYSTEM LOGIC ---

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

    // Update Progress Bar
    const percentageLeft = (timeLeft / TOTAL_SESSION_TIME) * 100;
    progressBar.style.width = `${percentageLeft}%`;

    // Dynamic Emojis based on current active mode
    if (currentMode === 'study') {
        if (timeLeft > 15 * 60) plantStage.innerText = '🌰';
        else if (timeLeft > 5 * 60) plantStage.innerText = '🌱';
        else plantStage.innerText = '🌳';
    } else if (currentMode === 'short') {
        plantStage.innerText = '☕'; // Coffee/tea cup resting
    } else {
        plantStage.innerText = '🛋️'; // Cozy couch resting
    }
}

// NEW: Mode Switcher Function
function switchMode(mode) {
    if (isRunning) {
        Swal.fire({
            title: 'Session in Progress',
            text: 'Please reset the active timer before switching modes!',
            icon: 'info',
            confirmButtonColor: '#7CA982'
        });
        return;
    }

    currentMode = mode;
    
    // Reset all tab button styles
    [modeStudyBtn, modeShortBtn, modeLongBtn].forEach(btn => {
        btn.className = "text-gray-500 py-2 rounded-lg hover:text-gray-700 transition-all";
    });

    // Apply active styles to selected mode and update times
    if (mode === 'study') {
        TOTAL_SESSION_TIME = 25 * 60;
        modeStudyBtn.className = "bg-white text-[#2A3439] py-2 rounded-lg shadow-sm transition-all font-bold";
        progressBar.style.backgroundColor = "#7CA982";
    } else if (mode === 'short') {
        TOTAL_SESSION_TIME = 5 * 60;
        modeShortBtn.className = "bg-white text-[#2A3439] py-2 rounded-lg shadow-sm transition-all font-bold";
        progressBar.style.backgroundColor = "#3490dc"; // Soft Blue for break
    } else if (mode === 'long') {
        TOTAL_SESSION_TIME = 15 * 60;
        modeLongBtn.className = "bg-white text-[#2A3439] py-2 rounded-lg shadow-sm transition-all font-bold";
        progressBar.style.backgroundColor = "#9561e2"; // Soft Purple for long rest
    }

    timeLeft = TOTAL_SESSION_TIME;
    updateDisplay();
}

function startTimer() {
    if (isRunning) return; 
    isRunning = true;
    plantStage.classList.add('breathing');
    
    // Select a random mindful quote when starting
    motivationText.innerText = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerId); 
            isRunning = false;
            plantStage.classList.remove('breathing');
            
            playSound('success');
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
            
            // Only reward tokens and minutes if they were in STUDY mode
            if (currentMode === 'study') {
                tokens++;
                totalMinutes = Number(totalMinutes) + 25;
                localStorage.setItem('zenBloomTokens', tokens);
                localStorage.setItem('zenBloomMinutes', totalMinutes);
                tokenCountDisplay.innerText = tokens;
                minutesCountDisplay.innerText = totalMinutes;

                Swal.fire({
                    title: 'Spectacular Blooming!',
                    text: 'Your tree fully matured. You earned 1 Token and 25 Focus Minutes.',
                    icon: 'success',
                    confirmButtonColor: '#7CA982'
                });
            } else {
                Swal.fire({
                    title: 'Recharge Complete!',
                    text: 'Your mind is rested and your energy is restored. Ready to focus?',
                    icon: 'success',
                    confirmButtonColor: '#7CA982'
                });
            }

            timeLeft = TOTAL_SESSION_TIME;
            updateDisplay();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = TOTAL_SESSION_TIME; 
    updateDisplay();
    plantStage.classList.remove('breathing');
}

// --- 3. TAB DETECTION (ANTI-DISTRACTION) ---
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRunning) {
        clearInterval(timerId); 
        isRunning = false;
        plantStage.classList.remove('breathing');
        playSound('warning');

        Swal.fire({
            title: '⚠️ Focus Interrupted!',
            text: 'ZenBloom detected you switched tabs. Focus paused! Return to preserve your growth streak.',
            icon: 'error',
            confirmButtonColor: '#e3342f'
        });
    }
});

// --- 4. LISTENERS ---
modeStudyBtn.addEventListener('click', () => switchMode('study'));
modeShortBtn.addEventListener('click', () => switchMode('short'));
modeLongBtn.addEventListener('click', () => switchMode('long'));

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);

// Boot up
updateDisplay();
