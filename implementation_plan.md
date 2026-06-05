# Implementation Plan - Scroll Animations, Pinned Panels, and Page Transitions

This plan details the implementation of scroll-driven animations using GSAP ScrollTrigger, resolving the career highlights image trigger, fixing the pinned panels stacking behavior, and adding new scroll-scrub animations across the rest of the website sections.

## User Review Required

> [!IMPORTANT]
> The website's scrolling is managed by a custom overflow container (`#main`) and is enhanced by Lenis.
> To support GSAP ScrollTrigger pinning inside this transformed layout without breaking layout bounds or page structures, we will configure ScrollTrigger defaults to use `#main` as the scroller and `pinType: "transform"`.

> [!NOTE]
> When sections are pinned with `pinSpacing: false`, the next sections scroll over them. Because the sections have semi-translucent backgrounds, stacking them would cause the underlying pinned section's text to show through.
> To address this, we will add a beautiful, premium visual transition: as the next section scrolls up over the current section, the current section's container will scale down, fade, and translate upward, creating a 3D depth stack effect.

## Proposed Changes

### GSAP Initialization and Page Section Stacking

#### [MODIFY] [initGsap.js](file:///Users/robwood/Desktop/rob.wood.pub@0.2.0/src/js/initGsap.js)
- Update `initScrollTrigger` to configure ScrollTrigger defaults with `scroller: "#main"` and `pinType: "transform"`.
- Implement `initSectionStacking` to pin all sections as they hit the bottom of the viewport, with a scroll-scrub transition that fades/scales down the pinned section as the next section scrolls over it.
- Initialize section-specific animations for About, Services, Skills, Resume, Portfolio, and Contact.

### Additional Scroll-Scrub Animations

#### [MODIFY] [initGsap.js](file:///Users/robwood/Desktop/rob.wood.pub@0.2.0/src/js/initGsap.js)
- **About Section**:
  - Animating `.profile-image-container img` to scale and rotate slightly.
  - Animating `.philosophy-quote` to slide in horizontally.
  - Scaling and fading the video thumbnail (`.video-link`).
- **Services Section**:
  - Animating `.service-item` cards to stagger-slide up and fade in.
- **Skills Section**:
  - Animating `.progress-bar` width from `0%` to their target `aria-valuenow` percentage.
  - Animating `.tech-item` icons to scale and rotate with stagger.
- **Resume Section**:
  - Stagger animating `.timeline-item` elements (fade and translate-x).
  - Stagger animating `.education-card` elements.
- **Portfolio Section**:
  - Animating `.portfolio-image` or portfolio cards to scale and fade as they enter.
- **Contact Section**:
  - Animating `.contact-details` items and form wrapper to slide up.

#### [DELETE] [animations.js](file:///Users/robwood/Desktop/rob.wood.pub@0.2.0/src/js/animations.js)
- Remove the unused `animations.js` file to keep the codebase clean.

## Verification Plan

### Automated Tests
- Run `pnpm build` to verify there are no compilation or bundle errors.

### Manual Verification
- Deploy/run the local server using `pnpm dev`.
- Scroll through the page and verify:
  - The Career Highlights image animation triggers and fades/scales in cleanly.
  - Pinned panels stack correctly with the fade/scale depth transition.
  - Staggered and scrubbed animations of progress bars, timeline, portfolio, and other sections behave correctly.
