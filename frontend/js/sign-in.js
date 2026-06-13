function SignInMain() {
  const me = {};

  const textReveal = (classToBeAdded, classOfElement) => {
    const windowInnerHeight = window.innerHeight;
    const element = document.querySelector(classOfElement);

    if (element.getBoundingClientRect().top <= windowInnerHeight) {
      if (!element.classList.contains(classToBeAdded)) {
        element.classList.add(classToBeAdded);
        console.log('Scrolled into view');
      }
    }
  };

  me.handleScroll = (classToBeAdded, classOfElement) => {
    textReveal(classToBeAdded, classOfElement);
    const element = document.querySelector(classOfElement);
    if (element.classList.contains(classToBeAdded)) {
      document.removeEventListener('scroll', me.handleScroll);
    }
  };

  return me;
}

document.addEventListener('DOMContentLoaded', () => {
  const signInMain = SignInMain();

  document.addEventListener('scroll', () =>
    signInMain.handleScroll('visible', '.why-us'),
  );
  document.addEventListener('scroll', () =>
    signInMain.handleScroll('visible', '.sign-in'),
  );
});
