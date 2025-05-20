import { handleBackdropSvg } from "./backdrop";
import { DEFAULT_OPTIONS, scrollToViewAndWait } from "./utils";
import { calculatePosition, clearState, createPopover, updatePopoverContent } from "./popover";
import "./site-tour.css";

export interface TourOption {
  tourSteps: TourStep[];
  position?: Position;
  padding?: number;
  preventClose?: boolean;
  onFinishTour?: () => void;
}

export interface TourStep {
  selector: string;
  title: string;
  content: string;
  position?: Position;
  nextBtnText?: string;
  prevBtnText?: string;
  hidePrev?: boolean;
}

export type Position = "top" | "bottom" | "right" | "left";

export class SiteTour {
  private options: TourOption = DEFAULT_OPTIONS;
  private listenersInitialized = false;
  private popoverElement: HTMLElement;
  private isHighlighting: boolean;
  private activeElement: Element;
  private backdrop!: SVGElement;
  private currentIndex = 0;

  constructor(options: TourOption) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  get currentStep(): TourStep {
    if (!this.options.tourSteps?.length) {
      return null;
    }
    return this.options.tourSteps[this.currentIndex];
  }

  get hasNextStep(): boolean {
    if (!this.options.tourSteps?.length) {
      return null;
    }
    return this.currentIndex < this.options.tourSteps.length - 1;
  }

  get hasPrevStep(): boolean {
    if (!this.options.tourSteps?.length) {
      return null;
    }
    return this.currentIndex > 0;
  }

  start() {
    if (this.options.tourSteps?.length) {
      this.currentIndex = 0;
      this.initializeEventListeners();
      this.showStep(this.currentIndex);
    } else {
      console.error("Please provide tourSteps to begin...!");
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

  private setActiveElement() {
    const step = this.options.tourSteps[this.currentIndex];
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
    if (this.currentIndex < this.options.tourSteps.length - 1) {
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

  private destroy() {
    this.resetHighlightState();
    document.body.removeEventListener("click", this.bodyClickEvent);
    window.removeEventListener("resize", this.updateHighlight);
    window.removeEventListener("scroll", this.updateHighlight);
    this.backdrop?.remove();
    this.popoverElement?.remove();
    clearState();
    this.listenersInitialized = false;
    this.currentIndex = 0;
    this.isHighlighting = false;
    this.activeElement = null;
  }

  private async highlightElement() {
    await this.highlightSelector();
    this.appendPopover();
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

  private createOrUpdatePopover() {
    this.popoverElement = createPopover(this.handleNextClick.bind(this), this.handlePrevClick.bind(this));
    updatePopoverContent(this.currentIndex, this.options.tourSteps);
    this.positionPopover();
  }

  private positionPopover = () => {
    const { topPosition, leftPosition } = calculatePosition(
      this.activeElement,
      this.currentStep?.position ?? this.options.position
    );
    // Apply the final calculated positions
    this.popoverElement.style.top = `${topPosition}px`;
    this.popoverElement.style.left = `${leftPosition}px`;
    return;
  };

  private handlePrevClick() {
    if (!this.hasPrevStep) {
      return;
    }
    this.prev();
  }

  private handleNextClick() {
    if (!this.hasNextStep) {
      if (this.options.onFinishTour) {
        this.options.onFinishTour();
      }
      this.destroy();
      return;
    }
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
      if (!this.options.preventClose) {
        this.destroy();
      }
    }
  };

  private appendPopover() {
    this.createOrUpdatePopover();
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
