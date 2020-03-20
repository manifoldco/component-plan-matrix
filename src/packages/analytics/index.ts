import { AnalyticsEvent } from '@manifoldco/manifold-init-types/types/v0/analytics';

export function mark(el: HTMLElement, name: AnalyticsEvent['name']) {
  const markName = `${el.tagName}-${name}-start`;
  if (performance.getEntriesByName(markName, 'mark').length === 0) {
    performance.mark(markName);
  }
}

export function measure(el: HTMLElement, name: AnalyticsEvent['name']) {
  const startMarkName = `${el.tagName}-${name}-start`;
  const endMarkName = `${el.tagName}-${name}-end`;
  const startMarks = performance.getEntriesByName(startMarkName, 'mark');
  const endMarks = performance.getEntriesByName(endMarkName, 'mark');
  if (startMarks.length) {
    if (!endMarks.length) {
      performance.mark(endMarkName);
      const endMark = performance.getEntriesByName(endMarkName, 'mark')[0];
      return {
        duration: endMark.startTime - startMarks[0].startTime,
        firstReport: true,
      };
    }
    return {
      duration: endMarks[0].startTime - startMarks[0].startTime,
      firstReport: false,
    };
  }
  return null;
}
