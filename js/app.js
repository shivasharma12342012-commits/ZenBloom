// --- 1. SETUP VARIABLES ---
const TOTAL_SESSION_TIME = 25 * 60; // 25 minutes exactly
let timeLeft = TOTAL_SESSION_TIME; 
let timerId = null;     
let isRunning = false;  

// Grab elements from the screen
const timerDisplay = document.getElementById('timer-display');
const plantStage = document.getElementById('plant-stage');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const tokenCountDisplay = document.getElementById('token-count');
const minutesCountDisplay = document.getElementById('minutes-count');
const progressBar = document.getElementById('progress-bar');

// Load saved stats!
let tokens = localStorage.getItem('zenBloomTokens') || 0;
let totalMinutes = localStorage.getItem('zenBloomMinutes') || 0;

// Show saved stats on the screen immediately
tokenCountDisplay.innerText = tokens;
minutesCountDisplay.innerText = totalMinutes;

// Create a simple success chime using the browser's built-in audio
function playSuccessSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // High C note
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5); // Play for half a second
}

// --- 2. THE CLOCK ENGINE ---
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // Format the time text
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    timerDisplay.innerText = `${minutes}:${formattedSeconds}`;

    // Calculate and update the progress bar width
    const percentageLeft = (timeLeft / TOTAL_SESSION_TIME) * 100;
    progressBar.style.width = `${percentageLeft}%`;

    // Plant evolution logic
    if (timeLeft > 15 * 60) {
        plantStage.innerText = '🌰';
    } else if (timeLeft > 5 * 60) {
        plantStage.innerText = '🌱';
    } else {
        plantStage.innerText = '🌳';
    }
}

function startTimer() {
    if (isRunning) return; 
    
    isRunning = true;
    plantStage.classList.add('breathing'); 

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        // WHEN THE USER WINS:
        if (timeLeft <= 0) {
            clearInterval(timerId); 
            isRunning = false;
            plantStage.classList.remove('breathing');
            
            // 1. Play Sound & Confetti
            playSuccessSound();
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
            
            // 2. Update and save stats
            tokens++;
            totalMinutes = Number(totalMinutes) + 25; // Add 25 minutes to their lifetime score
            
            localStorage.setItem('zenBloomTokens', tokens);
            localStorage.setItem('zenBloomMinutes', totalMinutes);
            
            tokenCountDisplay.innerText = tokens;
            minutesCountDisplay.innerText = totalMinutes;

            // 3. Show SweetAlert
            Swal.fire({
                title: 'Amazing Focus!',
                text: 'Your tree fully grew! You earned a token and 25 focus minutes.',
                icon: 'success',
                confirmButtonColor: '#7CA982'
            });

            // Reset for the next round
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

// --- 3. THE STRICT MODE: TAB DETECTION ---
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRunning) {
        clearInterval(timerId); 
        isRunning = false;
        plantStage.classList.remove('breathing');

        Swal.fire({
            title: 'Hey! Stay Focused!',
            text: 'Your plant paused growing because you left the tab. Return to your studies to keep it alive!',
            icon: 'error', // Changed to 'error' to make it feel more urgent!
            confirmButtonColor: '#e3342f' // Red button to match the warning
        });
    }
});

// --- 4. BUTTON CLICKS ---
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);

// Initialize display
updateDisplay();