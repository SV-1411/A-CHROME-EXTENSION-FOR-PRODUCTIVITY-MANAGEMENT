document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["focusedSites"], (data) => {
    siteListInput.value = (data.focusedSites || []).join(", ");
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "clearCustomSites") {
      // ✅ Clear the input field when focus mode is turned OFF
      siteListInput.value = "";
    }
  });
  
  
  const toggleFocusButton = document.getElementById("toggleFocus");
  const statusText = document.getElementById("status");
  const siteListInput = document.getElementById("siteList"); // Added input field
  const updateSitesButton = document.getElementById("updateSites");
  const timeSpentDiv = document.getElementById("timeSpent");
  const startStopButton = document.getElementById("toggleTimer");
  let uiTimerInterval;

  siteListInput.addEventListener("input", () => {
    if (siteListInput.value.trim() !== "") {
        updateSitesButton.disabled = false;  // Enable if input is not empty
    } else {
        updateSitesButton.disabled = true;   // Disable if input is empty
    }
});

// Function to update the timer UI
function updateTimerDisplay(startTime) {
  clearInterval(uiTimerInterval); // Ensure no duplicate intervals
  if (!startTime) return;

  uiTimerInterval = setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(elapsedSeconds % 60).padStart(2, "0");
    timeSpentDiv.innerText = `${hours}:${minutes}:${seconds}`;
  }, 1000);
}

// Check if the timer is running
chrome.storage.local.get(["timerRunning", "startTime"], (data) => {
  if (data.timerRunning && data.startTime) {
    startStopButton.innerText = "Stop Timer";
    updateTimerDisplay(data.startTime);
  } else {
    timeSpentDiv.innerText = "00:00:00";
  }
});

// Start/Stop timer functionality
startStopButton.addEventListener("click", () => {
  chrome.storage.local.get(["timerRunning", "startTime"], (data) => {
    if (data.timerRunning) {
      // Stop the timer
      chrome.runtime.sendMessage({ action: "stopTimer" }, () => {
        clearInterval(uiTimerInterval); // Stop the UI update
        timeSpentDiv.innerText = "00:00:00";
        startStopButton.innerText = "Start Timer";
      });
    } else {
      // Start the timer
      const startTime = Date.now();
      chrome.storage.local.set({ timerRunning: true, startTime });
      updateTimerDisplay(startTime);
      chrome.runtime.sendMessage({ action: "startTimer" });
      startStopButton.innerText = "Stop Timer";
    }
  });
});

// Initialize timer display on load
updateTimerDisplay();

  if (toggleFocusButton && statusText) {
    chrome.storage.local.get(["focusMode"], (data) => {
      statusText.innerText = data.focusMode ? "ON" : "OFF";
      siteListInput.value = (data.focusedSites || []).join(", ");
    });

    toggleFocusButton.addEventListener("click", () => {
      chrome.storage.local.get(["focusMode"], (data) => {
        const newStatus = !data.focusMode;
        chrome.storage.local.set({ focusMode: newStatus }, () => {
          statusText.innerText = newStatus ? "ON" : "OFF";
          if (!newStatus) {
            chrome.storage.local.set({ focusedSites: data.focusedSites }); // Reset to default sites
            siteListInput.value = ""; // Clear the input field
          }
          chrome.runtime.sendMessage({ focusMode: newStatus, action: "updateFocusedSites" });
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.reload(tabs[0].id);
            }
          });
        });
      });
    });

    updateSitesButton.addEventListener("click", () => {
      const sites = siteListInput.value
          .split(",")
          .map(s => s.trim())
          .filter(s => s); // Remove empty entries
  
      if (sites.length === 0) {
          alert("Please enter at least one valid site.");
          return;
      }
  
      chrome.runtime.sendMessage({ action: "updateFocusedSites", sites: sites });
      alert("Focus sites updated!");
  });
  
  }
});
