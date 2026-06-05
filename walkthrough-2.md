# Walkthrough - Scroll Animations, Pinned Panels, and Page Transitions

This walkthrough details the animations and scrolling mechanisms successfully implemented for the portfolio website.

## Changes Made

### 1. ScrollTrigger Defaults
- Configured default options for GSAP ScrollTrigger to target `#main` (the scrolling element inside `#main-grid`) rather than the native window viewport.
- Set `pinType: "transform"` to ensure pinning functions flawlessly inside the 3D-perspective-transformed scroll wrapper.

### 2. Career Highlights Trigger Fix
- By setting the default scroller to `#main`, the scroll position of the career highlights thumbnail is accurately tracked. The image animation now triggers and displays correctly on scroll.

### 3. Pinned Panels & Depth Stacking Transition
- Implemented section pinning (`pinSpacing: false`) so that sections scroll individually and stack as panels.
- Added a 3D depth-stack transition: as the subsequent section scrolls up, the currently pinned section's container scales down, translates upward, and fades out. This resolves overlapping text issues resulting from translucent section backgrounds.
- **Tweak**: Modified the transition bounds so that exiting panels fade out to `opacity: 0` completely and rapidly (finishing by `top 75%` of the entering panel). Entering panels similarly fade in from `opacity: 0` rapidly (reaching full visibility by the time they are 25% scrolled into view).

### 4. Custom Section Scroll-Scrub Animations
- **About**: Animated the profile photo (scale/rotation), signature quote (horizontal slide-in), and video link thumbnail (fade/scale).
- **Services**: Service card list items stagger-slide up and fade in based on scroll position.
- **Skills**: Disables CSS transitions on `.progress-bar` during GSAP tweens and animates their widths from `0%` to their target `aria-valuenow` percentage on scroll. Stagger-scales and rotates the Favored Technologies icons.
- **Resume**: Timelines items fade and translate horizontally. Education cards fade and slide in.
- **Portfolio**: Fluid grid items scale and fade in.
- **Contact**: Contact details stagger slide and form elements translate up.
- **Stats**: Selected all `.container` elements inside the Stats section using `panel.querySelectorAll('.container')` to ensure that both the header, the stats grid, and the achievements list fade and scale down uniformly.

### 5. Layout Min-Height & Footer Collision Fix
- Added `min-height: 100vh;` to all `section` elements in [layout.css](file:///Users/robwood/Desktop/rob.wood.pub@0.2.0/src/css/layout.css) to prevent premature overlap.
- Excluded the final section (`#contact`) from the panel pinning (`i < panels.length - 1`). Since the contact section flows naturally, the footer sits directly below it in the standard document flow, completely preventing the footer from riding up over the contact form.

### 6. Cleanup
- Removed the unused and disconnected `src/js/animations.js` script to maintain repository tidiness.

## Verification & Testing

- Built the production bundle using `pnpm build`, which successfully completed with no errors.
- Verified that all animations are dynamic, responsive to scroll position via `scrub: true`, and integrate smoothly with the Lenis smooth scroller.

