import { Transition } from '@mantine/core';
import { useEffect, useState } from 'react';

/**
 * Composant d'animation réutilisable pour animer l'apparition et la disparition des éléments
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les éléments enfants à animer
 * @param {boolean} props.show - Si l'élément doit être affiché
 * @param {number} props.delay - Délai avant l'animation (en ms)
 * @param {string} props.transition - Type de transition (fade, slide-up, slide-down, slide-left, slide-right)
 * @param {number} props.duration - Durée de l'animation (en ms)
 * @param {string} props.timingFunction - Fonction de timing pour l'animation (ease, linear, etc.)
 */
const AnimatedComponent = ({
  children,
  show = true,
  delay = 0,
  transition = 'fade',
  duration = 300,
  timingFunction = 'ease',
  ...props
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(show);
    }, delay);

    return () => clearTimeout(timer);
  }, [show, delay]);

  const getTransition = () => {
    switch (transition) {
      case 'slide-up':
        return 'slide-up';
      case 'slide-down':
        return 'slide-down';
      case 'slide-left':
        return 'slide-left';
      case 'slide-right':
        return 'slide-right';
      case 'scale':
        return 'scale';
      case 'pop':
        return 'pop';
      default:
        return 'fade';
    }
  };

  return (
    <Transition
      mounted={mounted}
      transition={getTransition()}
      duration={duration}
      timingFunction={timingFunction}
    >
      {(styles) => (
        <div style={{ ...styles, ...props.style }}>
          {children}
        </div>
      )}
    </Transition>
  );
};

/**
 * Composant de dévoilement progressif pour animer une liste d'éléments avec un délai entre chaque élément
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.items - Les éléments à animer
 * @param {Function} props.renderItem - Fonction de rendu pour chaque élément
 * @param {number} props.staggerDelay - Délai entre chaque élément (en ms)
 * @param {string} props.transition - Type de transition
 * @param {number} props.duration - Durée de l'animation
 */
export const StaggeredAnimation = ({
  items = [],
  renderItem,
  staggerDelay = 100,
  transition = 'fade',
  duration = 300,
  ...props
}) => {
  return (
    <>
      {items.map((item, index) => (
        <AnimatedComponent
          key={item.id || index}
          delay={index * staggerDelay}
          transition={transition}
          duration={duration}
          {...props}
        >
          {renderItem(item, index)}
        </AnimatedComponent>
      ))}
    </>
  );
};

export default AnimatedComponent;
