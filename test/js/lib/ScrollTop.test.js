// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import ScrollTop from '../../../src/js/lib/ScrollTop.js'

describe('ScrollTop', () => {
  let button;
  let scroller;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="scroller"></div>
      <button id="button"></button>
    `;
    button = document.querySelector('#button');
    scroller = document.querySelector('#scroller');

    // Mock scrollTo on scroller
    scroller.scrollTo = vi.fn();
    // Mock blur on button
    button.blur = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('attaches event listeners on initialization', () => {
    const buttonAddEventListenerSpy = vi.spyOn(button, 'addEventListener');
    const scrollerAddEventListenerSpy = vi.spyOn(scroller, 'addEventListener');
    const windowAddEventListenerSpy = vi.spyOn(window, 'addEventListener');

    const scrollTop = new ScrollTop('#button', '#scroller');

    expect(buttonAddEventListenerSpy).toHaveBeenCalledWith('click', scrollTop);
    expect(scrollerAddEventListenerSpy).toHaveBeenCalledWith('scroll', scrollTop);
    expect(windowAddEventListenerSpy).toHaveBeenCalledWith('window:loaded', scrollTop);
  });

  it('handles click events correctly', () => {
    new ScrollTop('#button', '#scroller');

    // Simulate click event
    const event = new Event('click');
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    button.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(scroller.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    });
    expect(button.blur).toHaveBeenCalled();
  });

  it('handles scroll events correctly', () => {
    new ScrollTop('#button', '#scroller');

    // Scroller hasn't scrolled enough yet
    const event1 = new Event('scroll');
    Object.defineProperty(event1, 'target', { value: { scrollTop: 50 } });
    scroller.dispatchEvent(event1);

    expect(button.classList.contains('active')).toBe(false);

    // Scroller scrolled enough
    const event2 = new Event('scroll');
    Object.defineProperty(event2, 'target', { value: { scrollTop: 150 } });
    scroller.dispatchEvent(event2);

    expect(button.classList.contains('active')).toBe(true);
  });

  it('handles window:loaded events correctly', () => {
    new ScrollTop('#button', '#scroller');

    // Initial state: not enough scroll
    const event1 = new Event('window:loaded');
    Object.defineProperty(event1, 'target', { value: { scrollTop: 0 } });
    window.dispatchEvent(event1);

    expect(button.classList.contains('active')).toBe(false);

    // Event with enough scroll
    const event2 = new Event('window:loaded');
    Object.defineProperty(event2, 'target', { value: { scrollTop: 101 } });
    window.dispatchEvent(event2);

    expect(button.classList.contains('active')).toBe(true);
  });
});
