import initHelpHero from 'helphero';

export class HelpHeroService {
  helpHeroClient = initHelpHero('9yZMlWWMsDS');
  on = this.helpHeroClient.on;
  setIdentity = this.helpHeroClient.identify;
  anonymous = this.helpHeroClient.anonymous;
  setProperty = this.helpHeroClient.update;
  startTour = this.helpHeroClient.startTour;
}

