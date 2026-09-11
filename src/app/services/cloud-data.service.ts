import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CloudDataService {
  private trackingIframe: HTMLIFrameElement | null = null;

  private getOrCreateIframe(): HTMLIFrameElement {
    if (this.trackingIframe && document.body.contains(this.trackingIframe)) {
      return this.trackingIframe;
    }
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);
    this.trackingIframe = iframe;
    return iframe;
  }

  private loadInHiddenIframe(url: string): void {
    const iframe = this.getOrCreateIframe();
    iframe.src = url;
  }

  trackRouteChange(path: string): void {
    try {
      const [basePath, query = ''] = path.split('?');
      const finalPath = `${basePath}.html${query ? `?${query}` : ''}`;
      this.loadInHiddenIframe(`/cloud-data/url/route${finalPath}`);
    } catch (error) {
      console.error('Error tracking route change:', error);
    }
  }

  trackEvent(eventName: string): void {
    try {
      this.loadInHiddenIframe(`/cloud-data/url/event/${encodeURIComponent(eventName)}.html`);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }
}
