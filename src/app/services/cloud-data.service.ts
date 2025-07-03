import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CloudDataService {

  // eslint-disable-next-line class-methods-use-this
  async trackRouteChange(path: string) {
    try {
      const [basePath, query = ''] = path.split('?');
      const finalPath = `${basePath}.html${query ? `?${query}` : ''}`;
      await fetch(`/cloud-data/route${finalPath}`);
    } catch (error) {
      console.error('Error tracking route change:', error);
    }
  }
  

  // eslint-disable-next-line class-methods-use-this
  async trackEvent(eventName: string) {
    await fetch(`/cloud-data/event/${encodeURIComponent(eventName)}.html`)['catch']((error) => {
      console.error('Error tracking event:', error);
    });
  }
}
