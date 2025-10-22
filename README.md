# Dual-Handle Range Slider

A lightweight, accessible dual-handle range slider component built with vanilla HTML, CSS, and JavaScript.

## Installation

### GitHub Download
1. Go to the [GitHub repository](https://github.com/marc-marcet/dual-handle-range-slider)
2. Download the latest release or clone the repository
3. Copy these files to your project:
   - `range-slider.js`
   - `range-slider.css`

### Include in your HTML
```html
<link rel="stylesheet" href="range-slider.css">
<script src="range-slider.js"></script>
```

## Usage

Add the `data-range-slider` attribute to any div and configure with data attributes:

```html
<div data-range-slider 
    data-min="0" 
    data-max="1000" 
    data-min-value="100" 
    data-max-value="500" 
    data-label-prefix="$"
    data-on-change="handlePriceChange">
</div>

<!-- With suffix -->
<div data-range-slider 
    data-min="0" 
    data-max="100" 
    data-min-value="20" 
    data-max-value="80" 
    data-label-suffix="kg">
</div>

<script src="range-slider.js"></script>
<script>
    function handlePriceChange(values, element) {
        console.log('Price range:', values); // {min: 100, max: 500}
    }
</script>
```

## Advanced Usage

### Manual Initialization
```javascript
const slider = createRangeSlider(document.getElementById('my-slider'), {
    min: 0,
    max: 100,
    minValue: 25,
    maxValue: 75,
    labelPrefix: '$',
    labelSuffix: ' USD'
});

slider.sliderElement.addEventListener('rangeChange', (e) => {
    console.log('Values:', e.detail); // {min: 25, max: 75}
});
```

### Getting Values from Auto-Initialized Sliders
```javascript
const element = document.querySelector('[data-range-slider]');
const values = element._rangeSlider.getValues();
console.log(values); // {min: 100, max: 500}
```

## Data Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-range-slider` | - | - | **Required** - Enables auto-initialization |
| `data-min` | number | 0 | Minimum possible value |
| `data-max` | number | 100 | Maximum possible value |
| `data-step` | number | 1 | Increment/decrement step |
| `data-min-value` | number | 25 | Initial minimum value |
| `data-max-value` | number | 75 | Initial maximum value |
| `data-label-prefix` | string | '' | Prefix for labels (e.g., '$', '€') |
| `data-label-suffix` | string | '' | Suffix for labels (e.g., '€', '%', 'kg') |
| `data-on-change` | string | - | Name of global function to call on change |

## Styling

Customize the appearance by modifying the CSS:

```css
.range-slider-track {
    background-color: #e4e6eb; /* Track background */
}

.range-slider-fill {
    background-color: #1877f2; /* Active range color */
}

.range-slider-handle {
    background-color: #fff;    /* Handle background */
    border: 2px solid #1877f2; /* Handle border */
}
```