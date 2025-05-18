import { Step, TourOption } from "./tour.types";
import { handleBackdropSvg } from "./backdrop";
import { DEFAULT_OPTIONS, scrollToViewAndWait } from "./utils";
import { calculatePosition, createPopover } from "./popover";

export class SiteTour {
  private options: TourOption = DEFAULT_OPTIONS;
  private listenersInitialized = false;
  private popoverElement: HTMLElement;
  private isHighlighting: boolean;
  private activeElement: Element;
  private backdrop!: SVGElement;
  private currentIndex = 0;

  constructor(options: any) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  get currentStep(): Step {
    if (!this.options.steps?.length) {
      return null;
    }
    return this.options.steps[this.currentIndex];
  }

  start() {
    if (this.options.steps?.length) {
      this.currentIndex = 0;
      this.initializeEventListeners();
      this.showStep(this.currentIndex);
    }
  }

  private showStep(index?: number) {
    this.initRender();
    if (index !== undefined) {
      this.currentIndex = index;
      this.setActiveElement();
    }
    this.highlightElement();
  }

  setActiveElement() {
    const step = this.options.steps[this.currentIndex];
    if (!step) return;
    const target = document.querySelector(step.selector);
    if (!target) {
      console.error("Target element not found");
      return;
    }
    this.resetHighlightState();
    target.classList.add("highlight-active");
    this.activeElement = target;
  }

  next() {
    if (this.isHighlighting) {
      return;
    }
    if (this.currentIndex < this.options.steps.length - 1) {
      this.currentIndex = this.currentIndex + 1;
      this.setActiveElement();
      this.showStep();
    }
  }

  prev() {
    if (this.isHighlighting) {
      return;
    }
    if (this.currentIndex > 0) {
      this.currentIndex = this.currentIndex - 1;
      this.setActiveElement();
      this.showStep();
    }
  }

  private initializeEventListeners() {
    if (!this.listenersInitialized) {
      document.body.addEventListener("click", this.bodyClickEvent);
      window.addEventListener("resize", this.updateHighlight);
      window.addEventListener("scroll", this.updateHighlight);
      this.listenersInitialized = true;
    }
  }

  destroy() {
    this.backdrop?.remove();
    this.popoverElement?.remove();
    document.body.removeEventListener("click", this.bodyClickEvent);
    window.removeEventListener("resize", this.updateHighlight);
    window.removeEventListener("scroll", this.updateHighlight);
    this.listenersInitialized = false;
    this.currentIndex = 0;
    this.resetHighlightState();
    this.isHighlighting = false;
    this.activeElement = null;
  }

  private async highlightElement() {
    await this.highlightSelector();
    this.appendTooltip();
    this.isHighlighting = false;
  }

  // Reset for new highlight step (call this for next/prev)
  private resetHighlightState() {
    document.querySelectorAll(".highlight-active").forEach(el => el.classList.remove("highlight-active"));
  }

  private async highlightSelector() {
    if (this.isHighlighting) {
      await scrollToViewAndWait(this.activeElement);
    }
    this.handleOverlay();
  }

  private handleOverlay() {
    this.backdrop = handleBackdropSvg(this.activeElement, this.options.padding, this.isHighlighting);
  }

  private createOrUpdateTooltip() {
    this.popoverElement = createPopover(this.handleNextClick.bind(this), this.handlePrevClick.bind(this));
    this.popoverElement.querySelector(".tour-header")!.innerHTML =
      this.currentStep.title || "Step " + (this.currentIndex + 1);
    this.popoverElement.querySelector(".tour-content")!.innerHTML = this.currentStep.content || "This is a tooltip";
    this.positionPopover();
  }

  positionPopover = () => {
    const { topPosition, leftPosition } = calculatePosition(this.activeElement);
    // Apply the final calculated positions
    this.popoverElement.style.top = `${topPosition}px`;
    this.popoverElement.style.left = `${leftPosition}px`;
    return;
  };

  private handlePrevClick() {
    this.prev();
  }

  private handleNextClick() {
    this.next();
  }

  private updateHighlight = () => {
    if (!this.activeElement) {
      console.error("Target element not found");
      return;
    }
    this.handleOverlay();
    this.positionPopover();
  };

  private bodyClickEvent = (event: any) => {
    const target = event.target as HTMLElement;
    // Check if the click was on a highlight SVG
    if (target.parentElement?.matches(".tour-highlight-svg")) {
      if (!this.options.disableClose) {
        this.destroy();
      }
    }
  };

  private appendTooltip() {
    this.createOrUpdateTooltip();
    if (this.popoverElement) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.popoverElement.style.opacity = "1";
          this.popoverElement.style.transform = "scale(1)";
        }, 150);
      });
    }
  }

  private initRender() {
    this.isHighlighting = true;
    if (this.popoverElement) {
      this.popoverElement.style.transition = "none";
      this.popoverElement.style.opacity = "0";
      this.popoverElement.style.transform = "scale(0.95)";
    }
  }
}
