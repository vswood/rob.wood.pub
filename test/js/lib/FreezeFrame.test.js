// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import FreezeFrame from '../../../src/js/lib/FreezeFrame.js';

describe('FreezeFrame', () => {
  let target;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="target" style="height: 100px; overflow-y: scroll;">
        <div style="height: 500px;">
          <script>console.log('test');</script>
          <p>Content</p>
        </div>
      </div>
    `;
    target = document.getElementById('target');
    // jsdom doesn't implement scrollTo
    target.scrollTo = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should create an instance with default options', () => {
    const freezeFrame = new FreezeFrame();
    expect(freezeFrame).toBeDefined();
    // Default target should be 'body', we can check properties but they are private.
  });

  it('should initialize with provided options', () => {
    const freezeFrame = new FreezeFrame({
      target,
      activeKeys: ['Enter'],
      cloneId: 'test-clone-id',
      extraClass: 'test-class',
    });
    expect(freezeFrame).toBeDefined();
  });

  describe('freezeViewport', () => {
    it('should replace target with clone and apply styles', () => {
      const freezeFrame = new FreezeFrame({ target });
      freezeFrame.freezeViewport();

      const clone = document.getElementById('viewport-overlay-clone');
      expect(clone).not.toBeNull();
      expect(document.getElementById('target')).toBeNull(); // Replaced

      expect(clone.style.position).toBe('fixed');
      expect(clone.style.zIndex).toBe('999999');
      expect(clone.inert).toBe(true);

      // Scripts should be removed
      expect(clone.querySelectorAll('script').length).toBe(0);
    });

    it('should add extraClass after a timeout', () => {
      vi.useFakeTimers();
      const freezeFrame = new FreezeFrame({ target, extraClass: 'extra-test-class' });
      freezeFrame.freezeViewport();

      const clone = document.getElementById('viewport-overlay-clone');
      expect(clone.classList.contains('extra-test-class')).toBe(false);

      vi.advanceTimersByTime(150);
      expect(clone.classList.contains('extra-test-class')).toBe(true);
      vi.useRealTimers();
    });

    it('should disable scroll methods', () => {
      const freezeFrame = new FreezeFrame({ target });
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      freezeFrame.freezeViewport();

      expect(addEventListenerSpy).toHaveBeenCalledWith('wheel', freezeFrame, { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', freezeFrame, { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', freezeFrame);
    });

    it('should not freeze if already frozen', () => {
      const freezeFrame = new FreezeFrame({ target });
      freezeFrame.freezeViewport();
      const originalClone = document.getElementById('viewport-overlay-clone');

      freezeFrame.freezeViewport();
      const newClone = document.getElementById('viewport-overlay-clone');
      expect(originalClone).toBe(newClone);
    });
  });

  describe('unfreezeViewport', () => {
    it('should restore target from clone and apply styles', () => {
      const freezeFrame = new FreezeFrame({ target });
      freezeFrame.freezeViewport();

      // Now unfreeze
      freezeFrame.unfreezeViewport();

      const clone = document.getElementById('viewport-overlay-clone');
      expect(clone).toBeNull();

      const restoredTarget = document.getElementById('target');
      expect(restoredTarget).not.toBeNull();
      expect(restoredTarget).toBe(target);
    });

    it('should enable scroll methods', () => {
      const freezeFrame = new FreezeFrame({ target });
      freezeFrame.freezeViewport();

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      freezeFrame.unfreezeViewport();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('wheel', freezeFrame);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', freezeFrame);
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', freezeFrame);
    });

    it('should remove extraClass from target after a timeout', () => {
      vi.useFakeTimers();
      const freezeFrame = new FreezeFrame({ target, extraClass: 'extra-test-class' });
      freezeFrame.freezeViewport();
      freezeFrame.unfreezeViewport();

      const restoredTarget = document.getElementById('target');
      // Should add the class back before removing it
      expect(restoredTarget.classList.contains('extra-test-class')).toBe(true);

      vi.advanceTimersByTime(150);
      expect(restoredTarget.classList.contains('extra-test-class')).toBe(false);
      vi.useRealTimers();
    });

    it('should not unfreeze if not frozen', () => {
      const freezeFrame = new FreezeFrame({ target });
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      freezeFrame.unfreezeViewport();
      expect(removeEventListenerSpy).not.toHaveBeenCalled();
    });
  });

  describe('toggleViewportFreeze', () => {
    it('should freeze when unfrozen and unfreeze when frozen', () => {
      const freezeFrame = new FreezeFrame({ target });
      const freezeSpy = vi.spyOn(freezeFrame, 'freezeViewport');
      const unfreezeSpy = vi.spyOn(freezeFrame, 'unfreezeViewport');

      freezeFrame.toggleViewportFreeze();
      expect(freezeSpy).toHaveBeenCalled();

      freezeFrame.toggleViewportFreeze();
      expect(unfreezeSpy).toHaveBeenCalled();
    });
  });

  describe('event handlers', () => {
    let freezeFrame;

    beforeEach(() => {
      freezeFrame = new FreezeFrame({ target });
    });

    it('handleEvent should dispatch to specific handlers', () => {
      const wheelHandlerSpy = vi.spyOn(freezeFrame, 'wheelHandler');
      const event = new Event('wheel');
      freezeFrame.handleEvent(event);
      expect(wheelHandlerSpy).toHaveBeenCalledWith(event);
    });

    it('wheelHandler should prevent default', () => {
      const event = new Event('wheel', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      freezeFrame.wheelHandler(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('touchmoveHandler should prevent default', () => {
      const event = new Event('touchmove', { cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      freezeFrame.touchmoveHandler(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('keydownHandler should prevent default for active keys', () => {
      // In FreezeFrame, the current implementation checks if (this.#keys[e.key]),
      // which works if activeKeys is an object mapping keys to truthy values.
      freezeFrame = new FreezeFrame({ target, activeKeys: { ArrowUp: true } });

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      freezeFrame.keydownHandler(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('keydownHandler should not prevent default for inactive keys', () => {
      freezeFrame = new FreezeFrame({ target, activeKeys: { ArrowUp: true } });

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      freezeFrame.keydownHandler(event);
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

});
