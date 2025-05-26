import { isElementInView } from "./utils";
import { Position, TourStep } from "./tour";

let popoverElement: HTMLElement;
let popoverHTML: HTMLElement;
export function createPopover(next: () => void, prev: () => void): HTMLElement {
  const popover = document.querySelector(".tour-popover");
  if (!popover) {
    popoverElement = document.createElement("div");
    popoverElement.classList.add("tour-popover");
    popoverElement.innerHTML = `
        <div class="tour-popover-container">
          <div class="tour-header"></div>
          <div class="tour-content"></div>
          <div class="tour-footer">
            <button class="tour-btn tour-prev-btn">\u2190 Prev</button>
            <button class="tour-btn tour-next-btn">Next \u2192</button>
          </div>
        </div>
      `;
    document.body.appendChild(popoverElement);
    popoverHTML = popoverElement.querySelector(".tour-popover-container");
    const prevButton = popoverHTML.querySelector(".tour-prev-btn");
    const nextButton = popoverHTML.querySelector(".tour-next-btn");

    // remove listeners
    prevButton?.removeEventListener("click", prev);
    nextButton?.removeEventListener("click", next);

    // Add new event listeners
    prevButton?.addEventListener("click", prev);
    nextButton?.addEventListener("click", next);
  }
  return popoverElement;
}

export function updatePopoverContent(currentIndex: number, steps: TourStep[]) {
  const currentStep = steps[currentIndex];
  if (!currentStep) {
    return;
  }
  popoverElement.querySelector(".tour-header")!.innerHTML = currentStep.title || "Step " + (currentIndex + 1);
  popoverElement.querySelector(".tour-content")!.innerHTML = currentStep.content || "This is a popover";
  const prevButton = popoverHTML.querySelector(".tour-prev-btn") as HTMLButtonElement;
  const nextButton = popoverHTML.querySelector(".tour-next-btn") as HTMLButtonElement;
  const nextText = currentIndex === steps.length - 1 ? "Done" : `Next \u2192`;
  nextButton.innerHTML = nextText;
  if (currentStep?.nextBtnText || currentStep?.prevBtnText) {
    prevButton.innerHTML = currentStep?.prevBtnText ?? `\u2190 Prev`;
    nextButton.innerHTML = currentStep?.nextBtnText ?? nextText;
  }
  if (prevButton) {
    prevButton.disabled = currentIndex === 0;
    prevButton.style.opacity = currentStep.hidePrev ? "0" : prevButton.disabled ? "0.7" : "1";
  }
}

export function calculatePosition(
  activeEl: Element,
  position: Position
): {
  topPosition: number;
  leftPosition: number;
} {
  if (!popoverElement) {
    return null;
  }
  const targetRect = activeEl.getBoundingClientRect();
  let topPosition = 0;
  let leftPosition = 0;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let preferredPosition: Position = position;
  // Reset arrow classes
  const popoverHTML = popoverElement.querySelector(".tour-popover-container");
  popoverHTML.classList.remove("tour-arrow-top", "tour-arrow-bottom", "tour-arrow-left", "tour-arrow-right");
  // Check if activeElement is out of viewport (scrolled up or down)
  if (targetRect.top < 0) {
    preferredPosition = "bottom"; // If scrolled up, show below with top arrow
  } else if (targetRect.bottom > viewportHeight) {
    preferredPosition = "top"; // If scrolled down, show above with bottom arrow
  }
  // Attempt preferred position
  const tryPosition = (pos: Position) => {
    // Reset arrow classes
    popoverHTML.classList.remove("tour-arrow-top", "tour-arrow-bottom", "tour-arrow-left", "tour-arrow-right");
    switch (pos) {
      case "top":
        topPosition = targetRect.top - popoverElement.offsetHeight - 20;
        leftPosition = targetRect.left + targetRect.width / 2 - popoverElement.offsetWidth / 2;
        popoverHTML.classList.add("tour-arrow-bottom");
        break;
      case "bottom":
        topPosition = targetRect.bottom + 20;
        leftPosition = targetRect.left + targetRect.width / 2 - popoverElement.offsetWidth / 2;
        popoverHTML.classList.add("tour-arrow-top");
        break;
      case "left":
        leftPosition = targetRect.left - popoverElement.offsetWidth - 20;
        topPosition = targetRect.top + targetRect.height / 2 - popoverElement.offsetHeight / 2;
        popoverHTML.classList.add("tour-arrow-right");
        break;
      case "right":
        leftPosition = targetRect.right + 20;
        topPosition = targetRect.top + targetRect.height / 2 - popoverElement.offsetHeight / 2;
        popoverHTML.classList.add("tour-arrow-left");
        break;
    }
  };

  // Try the preferred position first
  tryPosition(preferredPosition);

  const isOutViewPort = !isElementInView(activeEl);
  const isOverflows =
    topPosition < 0 ||
    topPosition + popoverElement.offsetHeight > viewportHeight ||
    leftPosition < 0 ||
    leftPosition + popoverElement.offsetWidth > viewportWidth;
  // Auto-adjust if it overflows
  if (isOverflows && !isOutViewPort) {
    const allPositions: Position[] = ["top", "bottom", "right", "left"];
    const positions = allPositions.filter(p => p !== preferredPosition);
    for (const pos of positions) {
      tryPosition(pos);
      if (
        topPosition >= 0 &&
        topPosition + popoverElement.offsetHeight <= viewportHeight &&
        leftPosition >= 0 &&
        leftPosition + popoverElement.offsetWidth <= viewportWidth
      ) {
        break;
      }
    }
  }

  // Ensure within viewport (final check)
  topPosition = Math.max(10, Math.min(topPosition, viewportHeight - popoverElement.offsetHeight - 10));
  leftPosition = Math.max(10, Math.min(leftPosition, viewportWidth - popoverElement.offsetWidth - 10));

  return { topPosition, leftPosition };
}

export function clearState() {
  popoverElement = null;
  popoverHTML = null;
}
