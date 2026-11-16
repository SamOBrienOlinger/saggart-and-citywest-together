export const consentKey = 'saggart-and-citywest-together:privacy:v1';
export const consentVersion = '2026-11-11.1';

export async function startWithPrivacyChoice(page, { translation = false, preferences = false, score = null } = {}) {
  await page.addInitScript(({ key, version, translation, preferences, score }) => {
    localStorage.setItem(key, JSON.stringify({
      version,
      at: Date.now(),
      translation,
      preferences,
    }));
    if (preferences && score !== null) {
      localStorage.setItem('sctQuizHighScore', String(score));
      localStorage.setItem('sctQuizSchema', '1');
    }
  }, { key: consentKey, version: consentVersion, translation, preferences, score });
}

export async function startAsFirstVisitor(page) {
  await page.goto('/');
  await page.evaluate(key => localStorage.removeItem(key), consentKey);
  await page.reload();
}
