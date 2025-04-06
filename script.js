// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const colorBox = document.getElementById('colorBox');
    const colorName = document.getElementById('colorName');
    const colorRGB = document.getElementById('colorRGB');
    const changeColorBtn = document.getElementById('changeColor');
    const autoChangeBtn = document.getElementById('autoChange');
    const copyHexBtn = document.getElementById('copyHex');
    const copyRGBBtn = document.getElementById('copyRGB');
    const saveColorBtn = document.getElementById('saveColor');
    const animationSpeed = document.getElementById('animationSpeed');
    const colorMode = document.getElementById('colorMode');
    const savedColorsGrid = document.querySelector('.saved-colors-grid');

    // State
    let autoChangeInterval = null;
    let currentColor = { r: 255, g: 255, b: 255 };
    let savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];

    // Error handling for missing elements
    if (!colorBox || !colorName || !colorRGB || !changeColorBtn) {
        console.error('Required DOM elements not found');
        return;
    }

    // Function to generate random color based on mode
    function generateRandomColor() {
        const mode = colorMode.value;
        let r, g, b;

        switch (mode) {
            case 'pastel':
                r = Math.floor(Math.random() * 56) + 200;
                g = Math.floor(Math.random() * 56) + 200;
                b = Math.floor(Math.random() * 56) + 200;
                break;
            case 'dark':
                r = Math.floor(Math.random() * 128);
                g = Math.floor(Math.random() * 128);
                b = Math.floor(Math.random() * 128);
                break;
            case 'bright':
                r = Math.floor(Math.random() * 128) + 128;
                g = Math.floor(Math.random() * 128) + 128;
                b = Math.floor(Math.random() * 128) + 128;
                break;
            default: // random
                r = Math.floor(Math.random() * 256);
                g = Math.floor(Math.random() * 256);
                b = Math.floor(Math.random() * 256);
        }

        return { r, g, b };
    }

    // Function to convert RGB to Hex
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    // Function to copy text to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show feedback
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = 'Copied!';
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = event.target.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
            tooltip.style.top = `${rect.top - 30}px`;
            
            // Remove tooltip after animation
            setTimeout(() => {
                tooltip.remove();
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    // Function to save color
    function saveColor() {
        const hexColor = rgbToHex(currentColor.r, currentColor.g, currentColor.b);
        if (!savedColors.includes(hexColor)) {
            savedColors.push(hexColor);
            localStorage.setItem('savedColors', JSON.stringify(savedColors));
            updateSavedColors();
            
            // Animate save button
            saveColorBtn.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                saveColorBtn.style.animation = '';
            }, 500);
        }
    }

    // Function to update saved colors display
    function updateSavedColors() {
        savedColorsGrid.innerHTML = '';
        savedColors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'saved-color-item';
            colorItem.style.backgroundColor = color;
            
            const colorValue = document.createElement('div');
            colorValue.className = 'color-value';
            colorValue.textContent = color;
            
            colorItem.appendChild(colorValue);
            colorItem.addEventListener('click', () => {
                const rgb = hexToRgb(color);
                updateColorDisplay(rgb);
            });
            
            savedColorsGrid.appendChild(colorItem);
        });
    }

    // Function to convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Function to update the color display
    function updateColorDisplay(color = null) {
        try {
            if (!color) {
                color = generateRandomColor();
            }
            currentColor = color;
            
            const hexColor = rgbToHex(color.r, color.g, color.b);
            const speed = (100 - animationSpeed.value) * 20; // Convert to milliseconds
            
            // Update color box with smooth transition
            colorBox.style.transition = `background-color ${speed}ms ease`;
            colorBox.style.backgroundColor = hexColor;
            
            // Update color information
            colorName.textContent = hexColor.toUpperCase();
            colorRGB.textContent = `rgb(${color.r}, ${color.g}, ${color.b})`;
            
            // Update body background color with a complementary color
            document.body.style.transition = `background-color ${speed}ms ease`;
            document.body.style.backgroundColor = `rgba(${255 - color.r}, ${255 - color.g}, ${255 - color.b}, 0.1)`;
        } catch (error) {
            console.error('Error updating color display:', error);
        }
    }

    // Event Listeners
    changeColorBtn.addEventListener('click', () => {
        updateColorDisplay();
    });

    autoChangeBtn.addEventListener('click', () => {
        if (autoChangeInterval) {
            clearInterval(autoChangeInterval);
            autoChangeInterval = null;
            autoChangeBtn.innerHTML = '<i class="fas fa-sync"></i> Auto Change';
        } else {
            const speed = (100 - animationSpeed.value) * 20;
            autoChangeInterval = setInterval(updateColorDisplay, speed);
            autoChangeBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        }
    });

    copyHexBtn.addEventListener('click', () => {
        copyToClipboard(colorName.textContent);
    });

    copyRGBBtn.addEventListener('click', () => {
        copyToClipboard(colorRGB.textContent);
    });

    saveColorBtn.addEventListener('click', saveColor);

    animationSpeed.addEventListener('input', () => {
        if (autoChangeInterval) {
            clearInterval(autoChangeInterval);
            const speed = (100 - animationSpeed.value) * 20;
            autoChangeInterval = setInterval(updateColorDisplay, speed);
        }
    });

    colorMode.addEventListener('change', () => {
        if (autoChangeInterval) {
            clearInterval(autoChangeInterval);
            autoChangeInterval = null;
            autoChangeBtn.innerHTML = '<i class="fas fa-sync"></i> Auto Change';
        }
        updateColorDisplay();
    });

    // Initialize
    updateColorDisplay();
    updateSavedColors();
}); 