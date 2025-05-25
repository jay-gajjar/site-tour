
# Site Tour

A customizable, step by step guided walkthrough/tour system for websites.


## Installation

Install site-tour with npm

```bash
  npm install site-tour
```

Install via CDN

```javascript
<script src="https://cdn.jsdelivr.net/npm/site-tour@latest/dist/site-tour.iife.js"></script>
```

## Usage

**Add default Styling**

```css
// import in global style 
@import 'site-tour/dist/site-tour.css';

OR 

// add it via CDN
<link href="https://cdn.jsdelivr.net/npm/site-tour@latest/dist/site-tour.css" rel="stylesheet" type="text/css" />
```

```ts
import { SiteTour, TourOption } from 'site-tour';

const config: TourOption = {
  steps: [
    {
      selector: '.start-button',
      title: 'Start Here',
      content: 'Click this button to begin.',
    },
    {
      selector: '#settings',
      title: 'Settings Panel',
      content: 'This is where you can change your preferences.',
      position: 'right',
      nextBtnText: 'Continue',
      prevBtnText: 'Go Back',
    },
  ],
  padding: 10,
  preventClose: true,
  onFinishTour: () => {
    console.log('Tour complete!');
  },
};

const tour = new SiteTour(config);
tour.start();
```

```ts
// if library is imported via CDN

const tour = window.siteTour;
const siteTour = new tour.SiteTour(...configs: TourOption);
siteTour.start();
```

## Configuration Options

**`TourOptions`**

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `steps` | TourStep[] | **Required**. Array of steps in the tour. |
| `position` | "top" \| "bottom" \| "right" \| "left" | Popover position. Default is 'right'. |
| `padding` | number | Space (in pixels) around the target element. |
| `preventClose` | boolean | Prevent closing the tour by clicking outside or pressing ESC. |
| `onFinishTour` | () => void | Callback function triggered after the last step is completed. |

**`TourStep`**

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `selector`      | string | **Required**. Target element to highlight. |
| `title`      | string | **Required**. Title of the popover. |
| `content`      | string | **Required**. Body content of the popover. |
| `position` | "top" \| "bottom" \| "right" \| "left" | 	Step-specific popover position (overrides global `position`). |
| `nextBtnText`      | string | Text for the “Next” button. |
| `prevBtnText`      | string | Text for the “Previous” button. |
| `hidePrev`      | string | 	Hides the “Previous” button on this step. |

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://choosealicense.com/licenses/mit/) 

