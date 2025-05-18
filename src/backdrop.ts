export function backdropSvg() {
  let svg = document.querySelector(".tour-highlight-svg") as SVGElement;
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "tour-highlight-svg");
    svg.style.position = "fixed";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100vw";
    svg.style.height = "100vh";
    svg.style.zIndex = "1000";
    document.body.appendChild(svg);
  }
  let path = svg.querySelector("path") as SVGPathElement;
  if (!path) {
    path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "rgba(0, 0, 0, 0.7)");
    path.setAttribute("fill-rule", "evenodd");
    path.style.transition = "d 0.4s ease";
    svg.appendChild(path);
  }
  return { svg, path };
}

export function handleBackdropSvg(target: Element, padding: number, animate: boolean): SVGElement {
  const { svg, path } = backdropSvg();
  const rect = target.getBoundingClientRect();
  // Calculate target position with padding
  const x = rect.left - padding;
  const y = rect.top - padding;
  const width = rect.width + padding * 2;
  const height = rect.height + padding * 2;
  // Outer and Inner Path (cutout effect)
  const outerPath = `M 0 0 H ${window.innerWidth} V ${window.innerHeight} H 0 Z`;
  const innerPath = `M ${x} ${y} h ${width} v ${height} h -${width} Z`;

  const updatePath = () => {
    path.setAttribute("d", `${outerPath} ${innerPath}`);
  };
  if (!animate) {
    updatePath();
  } else {
    requestAnimationFrame(updatePath);
  }
  svg.appendChild(path);
  return svg;
}
