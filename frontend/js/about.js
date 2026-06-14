import Animation from './animation.js';

document.addEventListener('DOMContentLoaded', () => {
  const animationMain = Animation();

  document.addEventListener('scroll', () =>
    animationMain.handleScroll('visible', '.pt-portal-title'),
  );
});
