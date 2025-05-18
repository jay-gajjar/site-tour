import { TourOption } from "tour.types";

export function scrollToViewAndWait(target: Element): Promise<void> {
  return new Promise(resolve => {
    const isInView = isElementInView(target);
    if (isInView) {
      resolve(); // Already in view, no need to scroll
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          observer.disconnect();
          setTimeout(resolve, 100); // Small delay to ensure full visibility
        }
      },
      {
        root: null,
        threshold: 0.1, // 10% of element must be visible
      }
    );

    observer.observe(target);
  });
}

export function isElementInView(target: Element): boolean {
  const rect = target.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= window.innerHeight;
}

export const DEFAULT_OPTIONS: TourOption = {
  steps: [],
  padding: 10,
  disableClose: false,
};
