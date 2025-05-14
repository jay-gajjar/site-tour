// Main library exports - these are packaged in your distributable
export class SiteTour {
  options = {
    steps: [],
    padding: 10,
    disableClose: false,
  };

  state = {
    activeSelector: "",
  };

  api: {
    backdrop: HTMLElement | null;
  } = {
    backdrop: null,
  };

  constructor(options: any) {
    this.options = {
      ...this.options,
      ...options,
    };
    this.initializeEventListeners();
  }

  start() {
    console.log(this.options);
    if (this.options.steps?.length) {
      this.highlightElement(this.options.steps[0]);
    }
  }

  highlightStepsSequentially(steps: string[], index = 0) {
    if (index >= steps.length) {
      this.destroy(); // Remove the highlight at the end
      return;
    }

    this.highlightElement(steps[index]);

    setTimeout(() => {
      this.fadeOutHighlight();
      setTimeout(() => {
        this.highlightStepsSequentially(steps, index + 1);
      }, 500); // Wait for fade-out before showing next
    }, 2000); // 2 seconds delay per step
  }

  fadeOutHighlight() {
    const svg = document.querySelector(".highlight") as HTMLElement;
    if (svg) {
      svg.style.opacity = "0";
    }
  }

  highlightElement(selector: string) {
    this.state.activeSelector = selector;
    this.createOrUpdateHighlight();
  }

  destroy() {
    const svg = document.querySelector(".highlight");
    if (svg) {
      svg.remove();
    }
    document.body.removeEventListener("click", this.bodyClickEvent);
    window.removeEventListener("resize", this.createOrUpdateHighlight.bind(this));
    window.removeEventListener("scroll", this.createOrUpdateHighlight.bind(this));
  }

  createOrUpdateHighlight() {
    if (!this.state.activeSelector) return;

    const target = document.querySelector(this.state.activeSelector);
    if (!target) {
      console.error("Target element not found");
      return;
    }

    let svg: any = document.querySelector(".highlight");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "highlight");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.style.position = "fixed";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "100vw";
      svg.style.height = "100vh";
      if (this.options.disableClose) {
        svg.style.pointerEvents = "none";
      }
      svg.style.zIndex = "1000";
      document.body.appendChild(svg);
    }

    // Clear existing content
    svg.innerHTML = "";

    // Calculate target position with padding
    const rect = target.getBoundingClientRect();
    const padding = this.options.padding;
    const x = rect.left - padding;
    const y = rect.top - padding;
    const width = rect.width + padding * 2;
    const height = rect.height + padding * 2;

    // Create the path using evenodd fill rule
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "rgba(0, 0, 0, 0.7)");
    path.setAttribute("fill-rule", "evenodd");

    // Outer and Inner Path (cutout effect)
    const outerPath = `M 0 0 H ${window.innerWidth} V ${window.innerHeight} H 0 Z`;
    const innerPath = `M ${x} ${y} h ${width} v ${height} h -${width} Z`;

    // Combine paths using evenodd for cutout
    path.setAttribute("d", `${outerPath} ${innerPath}`);
    svg.appendChild(path);
    this.api.backdrop = svg;
    svg.style.opacity = "1";
  }

  bodyClickEvent = (event: any) => {
    const target = event.target as HTMLElement;
    // Check if the click was on a highlight SVG
    if (target.parentElement?.matches(".highlight")) {
      if (!this.options.disableClose) {
        this.destroy();
      }
    }
  };

  // Event delegation for handling multiple highlights
  initializeEventListeners() {
    document.body.addEventListener("click", this.bodyClickEvent);
    window.addEventListener("resize", this.createOrUpdateHighlight.bind(this));
    window.addEventListener("scroll", this.createOrUpdateHighlight.bind(this));
  }
}
