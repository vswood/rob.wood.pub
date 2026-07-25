import FullscreenManager from '../lib/FullscreenManager.js'

/**
 * Initializes full-screen manager for small viewport devices.
 * @param {Object} options Configuration options.
 * @returns {FullscreenManager}
 */
export default function initFullscreen(options = {}) {
  const fullscreenManager = new FullscreenManager(options)
  fullscreenManager.init()
  window.fullscreenManager = fullscreenManager
  return fullscreenManager
}
