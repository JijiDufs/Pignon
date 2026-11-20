import type { Transition, Variants } from "motion/react";

/**
 * Motion vocabulary. One easing curve, three durations. Motion answers an action or a change
 * of data and explains what happened: where a panel came from, which business the camera went to.
 * See DESIGN.md, "Mouvement".
 */

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Hover, press, toggles */
export const vif: Transition = { duration: 0.16, ease: EASE };
/** Sheets, panels, things changing place */
export const souple: Transition = { duration: 0.42, ease: EASE };
/** The rare long move: a sheet unfolding, an object coming forward */
export const rebond: Transition = { duration: 0.6, ease: EASE };
/** Fades and colour changes */
export const fondu: Transition = { duration: 0.2, ease: EASE };

/** Something found, unlocked, reserved or signed settles into place. */
export const allumage: Variants = {
  eteint: { opacity: 0, y: 6 },
  allume: { opacity: 1, y: 0 },
};
export const allumageTransition: Transition = { duration: 0.42, ease: EASE };

/** Content appearing after an action (opening a panel, switching a tab). Not for scroll reveals. */
export const apparition: Variants = {
  cache: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: souple },
};

/** Parent of a list revealed after an action: children use `apparition`. At most six items feel staggered. */
export const cascade = (stagger = 0.05, delay = 0): Variants => ({
  cache: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
