/**
 * Dual-Handle Range Slider Component
 * A customizable, accessible range slider with two handles for selecting min/max values.
 * 
 * @version 1.0.0
 * @author Marc Marcet
 * @license MIT
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root.createRangeSlider = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

/**
 * Creates and initializes a dual-handle range slider.
 * @param {HTMLElement} container - The container element for the slider.
 * @param {object} config - Configuration for the slider.
 * @param {number} config.min - The minimum possible value.
 * @param {number} config.max - The maximum possible value.
 * @param {number} config.step - The increment step.
 * @param {number} config.minValue - The initial minimum value.
 * @param {number} config.maxValue - The initial maximum value.
 * @param {string} [config.labelPrefix=''] - A prefix for the value labels (e.g., '$').
 * @param {string} [config.labelSuffix=''] - A suffix for the value labels (e.g., '€', '%').
 * @returns {{sliderElement: HTMLElement, getValues: function(): {min: number, max: number}}}
 */
function createRangeSlider(container, config) {
    // --- Validate Configuration ---
    const {
        min = 0,
        max = 100,
        step = 1,
        minValue: initialMin = 25,
        maxValue: initialMax = 75,
        labelPrefix = '',
        labelSuffix = ''
    } = config;

    if (min >= max || step <= 0) {
        console.error("Invalid range slider config:", config);
        return;
    }

    // --- State ---
    let currentMinValue = Math.max(min, Math.min(initialMin, max));
    let currentMaxValue = Math.max(min, Math.min(initialMax, max));
    if (currentMinValue > currentMaxValue) {
        [currentMinValue, currentMaxValue] = [currentMaxValue, currentMinValue];
    }

    // --- Create DOM Elements ---
    container.innerHTML = `
        <div class="range-slider-labels">
            <span class="range-slider-label-min"></span>
            <span class="range-slider-label-max"></span>
        </div>
        <div class="range-slider-track"></div>
        <div class="range-slider-fill"></div>
        <div class="range-slider-handle" id="handle-min" role="slider" tabindex="0"></div>
        <div class="range-slider-handle" id="handle-max" role="slider" tabindex="0"></div>
        <div class="range-slider-inputs">
            <input type="hidden" name="min-value">
            <input type="hidden" name="max-value">
        </div>
    `;
    container.classList.add('range-slider-container');

    // --- Element References ---
    const sliderElement = container;
    const track = sliderElement.querySelector('.range-slider-track');
    const fill = sliderElement.querySelector('.range-slider-fill');
    const handleMin = sliderElement.querySelector('#handle-min');
    const handleMax = sliderElement.querySelector('#handle-max');
    const labelMin = sliderElement.querySelector('.range-slider-label-min');
    const labelMax = sliderElement.querySelector('.range-slider-label-max');
    const inputMin = sliderElement.querySelector('input[name="min-value"]');
    const inputMax = sliderElement.querySelector('input[name="max-value"]');

    // --- Helper Functions ---

    /** Converts a value to a percentage position. */
    const valueToPercent = (value) => ((value - min) / (max - min)) * 100;

    /** Updates the UI elements based on the current values. */
    const updateUI = () => {
        const percentMin = valueToPercent(currentMinValue);
        const percentMax = valueToPercent(currentMaxValue);

        // Update handles
        handleMin.style.left = `${percentMin}%`;
        handleMax.style.left = `${percentMax}%`;

        // Update fill bar
        fill.style.left = `${percentMin}%`;
        fill.style.width = `${percentMax - percentMin}%`;

        // Update labels
        labelMin.textContent = labelPrefix + currentMinValue + labelSuffix;
        labelMax.textContent = labelPrefix + currentMaxValue + labelSuffix;
        labelMin.style.left = `${percentMin}%`;
        labelMax.style.left = `${percentMax}%`;

        // Update ARIA attributes
        handleMin.setAttribute('aria-valuenow', currentMinValue);
        handleMax.setAttribute('aria-valuenow', currentMaxValue);

        // Update hidden inputs
        inputMin.value = currentMinValue;
        inputMax.value = currentMaxValue;
    };

    /** Sets ARIA attributes that don't change. */
    const setupAriaAttributes = () => {
        const commonAttrs = {
            'aria-valuemin': min,
            'aria-valuemax': max,
        };
        Object.assign(handleMin, commonAttrs);
        Object.assign(handleMax, commonAttrs);
        handleMin.setAttribute('aria-label', 'Minimum value');
        handleMax.setAttribute('aria-label', 'Maximum value');
    };

    /** Dispatches a custom event with the current values. */
    const dispatchRangeChange = () => {
        const event = new CustomEvent('rangeChange', {
            bubbles: true,
            detail: { min: currentMinValue, max: currentMaxValue }
        });
        sliderElement.dispatchEvent(event);
    };

    /**
     * Calculates a new value from a pointer event, respecting step and bounds.
     * @param {PointerEvent} e - The pointer event.
     * @returns {number} The calculated and snapped value.
     */
    const getValueFromPointer = (e) => {
        const rect = track.getBoundingClientRect();
        const pointerX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (pointerX / rect.width) * 100));
        const rawValue = min + (percent / 100) * (max - min);
        // Snap to the nearest step
        return Math.round(rawValue / step) * step;
    };

    // --- Event Handlers ---

    /** Handles pointer down events on the handles. */
    const onPointerDown = (e) => {
        e.preventDefault();
        e.target.setPointerCapture(e.pointerId);
        e.target.classList.add('active');

        const onPointerMove = (moveEvent) => {
            const newValue = getValueFromPointer(moveEvent);
            if (e.target === handleMin) {
                currentMinValue = Math.min(newValue, currentMaxValue - step);
            } else {
                currentMaxValue = Math.max(newValue, currentMinValue + step);
            }
            updateUI();
        };

        const onPointerUp = () => {
            e.target.releasePointerCapture(e.pointerId);
            e.target.classList.remove('active');
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            dispatchRangeChange();
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    /** Handles keyboard events for accessibility. */
    const onKeyDown = (e) => {
        const handle = e.target;
        let value = Number(handle.getAttribute('aria-valuenow'));
        const isMinHandle = handle === handleMin;

        const keyActions = {
            'ArrowLeft': () => value -= step,
            'ArrowRight': () => value += step,
            'PageDown': () => value -= step * 10,
            'PageUp': () => value += step * 10,
            'Home': () => value = min,
            'End': () => value = max,
        };

        if (keyActions[e.key]) {
            e.preventDefault();
            value = keyActions[e.key]();
            value = Math.max(min, Math.min(value, max)); // Clamp within global min/max

            if (isMinHandle) {
                currentMinValue = Math.min(value, currentMaxValue - step);
            } else {
                currentMaxValue = Math.max(value, currentMinValue + step);
            }
            
            updateUI();
            dispatchRangeChange();
        }
    };

    // --- Initialization ---
    setupAriaAttributes();
    updateUI();

    // Attach event listeners
    handleMin.addEventListener('pointerdown', onPointerDown);
    handleMax.addEventListener('pointerdown', onPointerDown);
    handleMin.addEventListener('keydown', onKeyDown);
    handleMax.addEventListener('keydown', onKeyDown);

    // --- Public API ---
    return {
        sliderElement,
        getValues: () => ({ min: currentMinValue, max: currentMaxValue }),
    };
}

/**
 * Auto-initialization: Automatically creates sliders for elements with data-range-slider attribute
 */
function autoInitializeSliders() {
    const elements = document.querySelectorAll('[data-range-slider]');
    
    elements.forEach(element => {
        // Skip if already initialized
        if (element.classList.contains('range-slider-container')) return;
        
        // Extract configuration from data attributes
        const config = {
            min: parseFloat(element.dataset.min || 0),
            max: parseFloat(element.dataset.max || 100),
            step: parseFloat(element.dataset.step || 1),
            minValue: parseFloat(element.dataset.minValue || 25),
            maxValue: parseFloat(element.dataset.maxValue || 75),
            labelPrefix: element.dataset.labelPrefix || '',
            labelSuffix: element.dataset.labelSuffix || ''
        };
        
        // Create the slider
        const slider = createRangeSlider(element, config);
        
        // Store reference for potential later access
        element._rangeSlider = slider;
        
        // Auto-dispatch events if callback is specified
        const callback = element.dataset.onChange;
        if (callback && typeof window[callback] === 'function') {
            slider.sliderElement.addEventListener('rangeChange', (e) => {
                window[callback](e.detail, element);
            });
        }
    });
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitializeSliders);
    } else {
        autoInitializeSliders();
    }
}

// Return the createRangeSlider function for module exports
return createRangeSlider;

}));
