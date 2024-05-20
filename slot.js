const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
let balance = 1010; // Initial balance
let autoSpinActive = false; // Flag to control auto-spin
let intervalId = null; // Store interval ID for clearing
let spinCost = 10; 
let soundEnabled = false; // Sound is on by default

// Sound elements loaded
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');

// Function to play sound based on the sound id
function playSound(soundElement) {
    if (soundEnabled && soundElement) {
        soundElement.play();
    }
}

// Function to clear matches before a new spin
function clearMatches() {
    document.querySelectorAll('.slot').forEach(slot => {
        slot.classList.remove('match'); // Remove the match class to reset styles
    });
}

function toggleSound() {
    const backgroundSound = document.getElementById('backgroundSound');
    const toggleButton = document.getElementById('toggleSoundButton');
    
    if (soundEnabled) {
        backgroundSound.pause(); // Pause the sound
        toggleButton.textContent = ''; // Clear existing content
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-volume-high');
        toggleButton.appendChild(icon); // Append the icon element
        soundEnabled = false;
    } else {
        backgroundSound.play(); // Play the sound
        toggleButton.textContent = ''; // Clear existing content
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-volume-xmark');
        toggleButton.appendChild(icon); // Append the icon element
        soundEnabled = true;
    }
}
// Event listener for the sound toggle button
document.getElementById('toggleSoundButton').addEventListener('click', toggleSound);


// Function to randomize slot images
function randomizeSlots() {
    clearMatches(); // Clear all previous matches before setting new images
    playSound(spinSound); // Play spin sound
    let slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        let image = images[Math.floor(Math.random() * images.length)];
        slot.style.backgroundImage = `url(${image})`; // Set the background image
        slot.dataset.image = image; // Store the image name in a data attribute for comparison
    });
    setTimeout(updateGame, 500); // Delay the update to allow images to show before checking
}

// Function to simulate a spin with a delay, deducting the cost of each spin
function spinWithDelay() {
    if (balance >= spinCost) { // Check if sufficient balance is available
        balance -= spinCost; // Deduct the cost of one spin
        setTimeout(randomizeSlots, 500); // Add a delay of 500 milliseconds (0.5 seconds)
        updateBalanceDisplay(); // Update the balance display immediately after deduction
    } else {
        alert("Insufficient balance for a spin."); // Alert user about insufficient balance
    }
}

// Function to update game state and check for wins
function updateGame() {
    let slots = document.querySelectorAll('.slot');
    let grid = [[], [], []];
    let columns = [[], [], []];
    let diagonals = [[], []];

    slots.forEach(function(slot, index) {
        let row = Math.floor(index / 3);
        let col = index % 3;
        let image = slot.dataset.image;
        grid[row].push(image);
        columns[col].push(image);

        if (row === col) {
            diagonals[0].push(image);
        }
        if (row + col === 2) {
            diagonals[1].push(image);
        }
    });

    checkWin(grid, 20, 'row');
    checkWin(columns, 20, 'col');
    checkWin(diagonals, 30, 'diag');
}

// Function to check winning conditions and update balance accordingly
function checkWin(lines, baseReward, type) {
    lines.forEach((line, index) => {
        if (line.every(val => val === line[0])) {
            let reward = baseReward + (spinCost - 10) * 2; // Calculate scaled reward
            balance += reward;
            playSound(winSound); // Play win sound if there is a win
            highlightWin(line, index, type);
        }
    });
}

// Function to highlight winning slots
function highlightWin(line, index, type) {
    clearMatches();
    setTimeout(() => {
        document.querySelectorAll('.slot').forEach((slot, slotIndex) => {
            let row = Math.floor(slotIndex / 3);
            let col = slotIndex % 3;
            if (type === 'row' && row === index) {
                slot.classList.add('match');
            } else if (type === 'col' && col === index) {
                slot.classList.add('match');
            } else if (type === 'diag') {
                if ((index === 0 && row === col) || (index === 1 && row + col === 2)) {
                    slot.classList.add('match');
                }
            }
        });
    }, 50);
}

// Function to update the balance display
function updateBalanceDisplay() {
    document.getElementById('balanceDisplay').textContent = `Balance: $${balance}`;
}

// Event listeners for buttons
document.getElementById('spinButton').addEventListener('click', spinWithDelay);
// Event listener for auto spin button to toggle auto-spin
document.getElementById('autoSpinButton').addEventListener('click', function() {
    if (!autoSpinActive) {
        const spinModal = document.getElementById('spinModal');
        spinModal.style.display = 'block'; // Display the modal
    } else {
        clearInterval(intervalId); // Stop auto-spin if already active
        autoSpinActive = false;
        updateAutoSpinButtonText(); // Update button text
    }
});
// Function to update the "Auto Spin" button text
function updateAutoSpinButtonText() {
    const button = document.getElementById('autoSpinButton');
    if (autoSpinActive) {
        button.textContent = `${remainingSpins}`; // Display remaining spins
    } else {
        button.innerHTML = '<i class="fa-solid fa-a"></i>'; // Reset button content to include the icon
    }
}

// Event listeners for spin buttons inside the modal
document.querySelectorAll('#spinModal button').forEach(button => {
    button.addEventListener('click', function() {
        const numberOfSpins = parseInt(this.dataset.spins, 10); // Get the number of spins from data attribute
        startAutoSpin(numberOfSpins); // Start auto-spin with selected number of spins
        const spinModal = document.getElementById('spinModal');
        spinModal.style.display = 'none'; // Hide the modal after selection
    });
});

// Function to start auto-spin with the selected number of spins
function startAutoSpin(numberOfSpins) {
    if (!autoSpinActive) {
        remainingSpins = numberOfSpins; // Initialize remaining spins
        updateAutoSpinButtonText(); // Update button text
        let count = 0;
        intervalId = setInterval(() => {
            if (count >= numberOfSpins || balance < spinCost) {
                clearInterval(intervalId);
                autoSpinActive = false;
                updateAutoSpinButtonText(); // Update button text
                alert("Auto-spin stopped.");
                return;
            }
            spinWithDelay();
            count++;
            remainingSpins--; // Decrease remaining spins
            updateAutoSpinButtonText(); // Update button text
        }, 2800);
        autoSpinActive = true;
    } else {
        clearInterval(intervalId);
        autoSpinActive = false;
        updateAutoSpinButtonText(); // Update button text
    }
}

// Event listener for opening the popup div
document.getElementById('setCostButton').addEventListener('click', function() {
    const costModal = document.getElementById('costModal');
    costModal.style.display = 'block'; // Display the popup div
});

// Event listeners for spin cost buttons inside the popup div
document.querySelectorAll('#costModal button').forEach(button => {
    button.addEventListener('click', function() {
        const newCost = parseInt(this.dataset.cost, 10); // Get the cost from data attribute
        spinCost = newCost;
        updateSpinCostDisplay(); // Update the spin cost display
        alert("Spin cost updated to $" + spinCost);
        updateBalanceDisplay();
        const costModal = document.getElementById('costModal');
        costModal.style.display = 'none'; // Hide the popup div
        
        // Delay between spins
        const numberOfSpins = 1; // Change this number if you want to spin multiple times
        const delayBetweenSpins = 1000; // Adjust the delay time (in milliseconds)
        let count = 0;
        const spinInterval = setInterval(() => {
            if (count >= numberOfSpins) {
                clearInterval(spinInterval);
                return;
            }
            spinWithDelay();
            count++;
        }, delayBetweenSpins);
    });
});

// Function to update the spin cost display
function updateSpinCostDisplay() {
    document.getElementById('spinCostDisplay').textContent = `Cost per Spin: $${spinCost}`;
}

// Initialize with a delayed spin
window.onload = function() {
    spinWithDelay(); // Existing function to initiate a spin
    if (soundEnabled) {
        document.getElementById('backgroundSound').play();
    }

    const videoOverlay = document.getElementById('videoOverlay');
    const mainContent = document.getElementById('mainContent');
    const forestVideo = document.getElementById('forestVideo');
    const loadingText = document.getElementById('loadingText');

    // Show "Loading..." text while the video is loading
    forestVideo.addEventListener('loadedmetadata', function() {
        loadingText.style.display = 'none'; // Hide the text when the video is loaded
    });

    setTimeout(() => {
        videoOverlay.style.display = 'none'; // Hide the video overlay
        mainContent.style.display = 'block'; // Display the main content
    }, 5000); // 5000 milliseconds = 5 seconds
};