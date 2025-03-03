let userData = {};
let focusMode = false;
let focusedSites = ["youtube.com", "instagram.com", "facebook.com", "tiktok.com", "reddit.com"];
let activeTab = null;
let startTime = null;
let timerInterval;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ timerRunning: false, timeElapsed: 0 });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["focusedSites", "focusMode"], (data) => {
    focusedSites = data.focusedSites || ["youtube.com", "instagram.com", "facebook.com"];
    focusMode = data.focusMode || false;
  });
  chrome.storage.local.get(["timerRunning", "timeElapsed"], (data) => {
    if (data.timerRunning) {
        const startTime = Date.now();
        const previousElapsed = data.timeElapsed || 0;

        // Continuously update elapsed time
        const interval = setInterval(() => {
            const currentTime = Date.now();
            const elapsedSeconds = previousElapsed + Math.floor((currentTime - startTime) / 1000);
            chrome.storage.local.set({ timeElapsed: elapsedSeconds });

            chrome.storage.local.get(["timerRunning"], (result) => {
                if (!result.timerRunning) clearInterval(interval);
            });
        }, 1000);
    }
});
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateFocusedSites") {
    chrome.storage.local.get(["focusedSites"], (data) => {
      let existingSites = data.focusedSites || []; // Ensure it's always an array
      const newSites = message.sites;

      // Add new sites without duplicates
      newSites.forEach(site => {
        if (!existingSites.includes(site)) {
          existingSites.push(site);
        }
      });

      chrome.storage.local.set({ focusedSites: existingSites }, () => {
        console.log("Updated focused sites:", existingSites);

        // Maintain focus mode state across sessions
        chrome.storage.local.get(["focusMode"], (modeData) => {
          if (modeData.focusMode) {
            chrome.runtime.sendMessage({ focusMode: true });
          }
        });
      });
    });
  }
  if (message.focusMode !== undefined) {
    if (!message.focusMode) {
      // Reset to predefined focused sites and clear custom input
      chrome.storage.local.set({ focusedSites: focusedSites }, () => {
        chrome.runtime.sendMessage({ action: "clearCustomSites" }); // Notify popup.js to clear input
      });
    }

    chrome.storage.local.set({ focusMode: message.focusMode });
  }
  if (message.action === "startTimer") {
    const startTime = Date.now();
    chrome.storage.local.set({ timerRunning: true, startTime });

    timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      chrome.storage.local.set({ elapsedSeconds });
    }, 1000);
  }
  if (message.action === "stopTimer") {
    clearInterval(timerInterval);
    chrome.storage.local.get(["startTime"], (data) => {
      const totalTime = Math.floor((Date.now() - data.startTime) / 1000);
      const hours = String(Math.floor(totalTime / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalTime % 3600) / 60)).padStart(2, "0");
      const seconds = String(totalTime % 60).padStart(2, "0");

      // Show notification with total time spent
      chrome.notifications.create({
        type: "basic",
        iconUrl: "timeSpent.png",
        title: "Timer Stopped",
        message: `You spent ${hours}:${minutes}:${seconds} on the browser.`,
      });

      chrome.storage.local.remove(["timerRunning", "startTime", "elapsedSeconds"]);
      sendResponse({ success: true });
    });

    return true; // Ensure sendResponse works asynchronously
  }
});


chrome.tabs.onActivated.addListener(activeInfo => {
  if (activeTab) {
    trackTimeSpent(activeTab);
  }
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      activeTab = new URL(tab.url).hostname.replace("www.", "");
      startTime = Date.now();
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname.replace("www.", "");
    
    chrome.storage.local.get(["userData"], (data) => {
      let userData = data.userData || {};
      if (!userData[domain]) {
        userData[domain] = { dailyTime: 0, totalTime: 0, lastVisit: Date.now() };
      } else {
        userData[domain].lastVisit = Date.now();
      }
      chrome.storage.local.set({ userData }); // Save updated time tracking
    });
    
    chrome.storage.local.get(["focusMode", "focusedSites"], (data) => {
      const storedFocusedSites = data.focusedSites || []; // Ensure it's always an array
  const allFocusedSites = [...new Set([...focusedSites, ...storedFocusedSites])]; // Merge predefined and dynamic sites without duplicates

  if (
    data.focusMode &&
    (allFocusedSites.includes(domain) || allFocusedSites.some(site => tab.url.includes(site)))
  ){        chrome.notifications.create({
  type: "basic",
  iconUrl: "focusIcon.png",
  title: "Focus Mode Alert",
  message: `Focus Mode is ON for ${domain}! Stay Productive! 🚀`
});
        chrome.tabs.remove(tabId);
      } else {
        console.log(`Focus Mode is OFF or not tracking ${domain}`);
      }
    });
  }
});

function trackTimeSpent(domain) {
  if (domain && startTime) {
    const timeSpent = (Date.now() - startTime) / 1000; // Convert ms to seconds
    chrome.storage.local.get(["userData"], (data) => {
      let userData = data.userData || {};
      if (userData[domain]) {
        userData[domain].dailyTime += timeSpent;
        userData[domain].totalTime += timeSpent;
      }
      else {
        userData[domain] = { dailyTime: timeSpent, totalTime: timeSpent };
      }
      chrome.storage.local.set({ userData }); // Save updated time tracking
    });
  }
}
