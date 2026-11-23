import '@fontsource-variable/bricolage-grotesque/wght.css';
import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './styles.css';

import { initScroll, initReveals, initMagnetic, initNav, initTransitions, initFilm } from './modules/motion';
import { runLoader, initHero } from './modules/hero';
import { initTurntable } from './modules/turntable';
import { initMood } from './modules/mood';
import { initForm } from './modules/form';
import { initSpecs } from './modules/specs';

// Everything that does not depend on the loader runs at once, so content is usable immediately.
initScroll();
initNav();
initMood();
initForm();
initSpecs();
initMagnetic();
initTransitions();

// Pinned scenes are created top-to-bottom (ScrollTrigger measures pin spacing in order),
// and only behind the loader, so their setup cost never lands mid-animation.
runLoader(() => {
  initHero();
  initFilm();
  initTurntable();
  initReveals();
});
