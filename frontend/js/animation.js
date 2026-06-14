export default function Animation() {
    const me = {};
  
    const textReveal = (classToBeAdded, classOfElement) => {
      const windowInnerHeight = window.innerHeight;
      const element = document.querySelector(classOfElement);

      if (!element) return;
  
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
      if (!element) return;
      if (element.classList.contains(classToBeAdded)) {
        document.removeEventListener('scroll', me.handleScroll);
      }
    };
  
    return me;
  }