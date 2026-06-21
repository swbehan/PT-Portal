export default function Animation() {
  const me = {};

  const textReveal = (classToBeAdded, classOfElement) => {
    const windowInnerHeight = window.innerHeight;
    const element = document.querySelector(classOfElement);

    if (!element) return;

    if (element.getBoundingClientRect().top <= windowInnerHeight) {
      if (!element.classList.contains(classToBeAdded)) {
        element.classList.add(classToBeAdded);
      }
    }
  };

  me.handleScroll = (classToBeAdded, classOfElement) => {
    textReveal(classToBeAdded, classOfElement);
  };

  return me;
}
