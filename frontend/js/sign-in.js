import Animation from './animation.js';

document.addEventListener('DOMContentLoaded', () => {
  const animationMain = Animation();

  document.addEventListener('scroll', () =>
    animationMain.handleScroll('visible', '.why-us'),
  );
  document.addEventListener('scroll', () =>
    animationMain.handleScroll('visible', '.sign-in'),
  );
  document.addEventListener('scroll', () =>
    animationMain.handleScroll('visible', '.what-is-pt-portal'),
  );
});
