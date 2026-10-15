import { expect } from '@playwright/test';

/**
 * Put a story/photo link safely inside the viewport before a real user action.
 * A visible heading is not evidence that its smooth anchor scroll has finished.
 * The original iPhone trace moved 56px during a click on a 19px-high link.
 * Only scrolling is controlled here: native link activation and hash handling
 * remain untouched, with no forced clicks, synthetic events or retry clicks.
 */
export async function activateHistoryLink(locator, hasTouch) {
  await locator.evaluate(link => link.scrollIntoView({
    block: 'center', inline: 'nearest', behavior: 'instant',
  }));
  let previous;
  let stableSamples = 0;
  await expect.poll(async () => {
    const sample = await locator.evaluate(link => {
      const rect = link.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const left = viewport?.offsetLeft ?? 0;
      const height = viewport?.height ?? window.innerHeight;
      const width = viewport?.width ?? window.innerWidth;
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return {
        position: [rect.x, rect.y, rect.width, rect.height, window.scrollX, window.scrollY, top, left, height, width],
        ready: rect.width > 0 && rect.height > 0 && rect.top >= top + 8 &&
          rect.bottom <= top + height - 8 && rect.left >= left && rect.right <= left + width &&
          !!hit && (hit === link || link.contains(hit)),
      };
    });
    const stationary = previous && sample.position.every((value, index) => Math.abs(value - previous[index]) < .5);
    stableSamples = sample.ready && stationary ? stableSamples + 1 : 0;
    previous = sample.position;
    return stableSamples;
  }, { message: 'history link is stationary, fully visible and receives input', intervals: [50, 100], timeout: 10000 }).toBeGreaterThanOrEqual(3);

  if (hasTouch) await locator.tap();
  else await locator.click();
}
