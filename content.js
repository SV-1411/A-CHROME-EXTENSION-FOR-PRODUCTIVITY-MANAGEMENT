chrome.storage.local.get(["focusMode", "focusedSites", "userData"], (data) => {
  const focusedSites = ["youtube.com", "instagram.com", "facebook.com", "tiktok.com", "reddit.com"];
const currentDomain = window.location.hostname.replace("www.", "");
const userData = data.userData || {};

if (!userData[currentDomain]) {
  userData[currentDomain] = { dailyTime: 0, totalTime: 0, lastVisit: Date.now() };
}
userData[currentDomain].lastVisit = Date.now();
chrome.storage.local.set({ userData });

chrome.storage.local.get(["focusMode"], (data) => {
  if (data.focusMode && focusedSites.includes(currentDomain)) {
    document.body.innerHTML = `<div style='font-size: 30px; color: red; text-align: center;'>Focus Mode is ON! Stay Productive! 🚀</div>`;
  }
})});
chrome.runtime.onMessage.addListener((message) => {
  if (message.focusMode !== undefined) {
    location.reload();
  }
});