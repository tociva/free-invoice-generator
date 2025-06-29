import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CloudDataService {

  // eslint-disable-next-line class-methods-use-this
  async trackRouteChange(path: string) {
    await fetch(`/assets/tracking/route-${encodeURIComponent(path)}.json`)['catch']((error) => {
      console.error('Error tracking route change:', error);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async trackEvent(eventName: string) {
    await fetch(`/assets/tracking/event-${encodeURIComponent(eventName)}.json`)['catch']((error) => {
      console.error('Error tracking event:', error);
    });
  }
}
