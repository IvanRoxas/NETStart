import { ProjectBlueprint } from './types';
import { webCalculatorBlueprint } from './web-calculator';

import { aboutMeBlueprint } from './about-me';
import { birthdayInvitationBlueprint } from './birthday-invitation';
import { photoGalleryBlueprint } from './photo-gallery';
import { signupFormBlueprint } from './signup-form';

export const projects: ProjectBlueprint[] = [
  webCalculatorBlueprint,
  aboutMeBlueprint,
  birthdayInvitationBlueprint,
  photoGalleryBlueprint,
  signupFormBlueprint
];
