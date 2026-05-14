export default function scrollSmoother(content) {
  return `
  <div id="smooth-wrapper">
    <div id="smooth-content">
    ${content}
    </div>
  </div>
  `
}
