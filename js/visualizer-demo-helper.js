// Simple helper script for visualizer demo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Demo helper script loaded');

    // Add event listener for starting visualization immediately
    setTimeout(() => {
        const startButton = document.querySelector('#start-visualization');
        if (startButton) {
            console.log('Auto-starting visualization...');
            startButton.click();
        }
    }, 1000);

    // Switch between visualization modes automatically
    let currentModeIndex = 0;
    const modes = ['brainwaves', 'emotions', 'heartbeat', 'coherence'];

    function switchMode() {
        currentModeIndex = (currentModeIndex + 1) % modes.length;
        const modeButton = document.querySelector(`[data-mode="${modes[currentModeIndex]}"]`);
        if (modeButton) {
            console.log(`Switching to ${modes[currentModeIndex]} mode`);
            modeButton.click();
        }
    }

    // Switch modes every 10 seconds
    setInterval(switchMode, 10000);
});