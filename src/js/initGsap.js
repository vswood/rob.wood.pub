import gsap from 'gsap'

export default async function initGsap(plugins) {
  if(plugins.includes('ScrollTrigger')) {
    const ScrollTrigger = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)
  }
  if(plugins.includes('ScrollSmoother')) {
    const ScrollSmoother = await import('gsap/ScrollSmoother')
    gsap.registerPlugin(ScrollSmoother)
  }
  if(plugins.includes('ScrollToPlugin')) {
    const ScrollToPlugin = await import('gsap/ScrollToPlugin')
    gsap.registerPlugin(ScrollToPlugin)
  }
  if(plugins.includes('SplitText')) {
    const SplitText = await import( 'gsap/SplitText')
    gsap.registerPlugin(SplitText)
  }
}

