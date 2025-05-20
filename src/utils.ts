import { TourOption } from "./tour";

export function scrollToViewAndWait(target: Element): Promise<void> {
  return new Promise(resolve => {
    const isInView = isElementInView(target);
    if (isInView) {
      resolve();
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          observer.disconnect();
          setTimeout(resolve, 100);
        }
      },
      {
        root: null,
        threshold: 0.1,
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
  tourSteps: [],
  padding: 10,
  position: "right",
  preventClose: false,
};
