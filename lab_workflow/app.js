// ==========================================
// 1. BACKEND API CONFIGURATION & WRAPPER
// ==========================================
const API_CONFIG = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbyDTs464mHViPoYbERKMkeeUIXf48RG1DJWnNX-b_B4wwNbnQf7jPC8HkOYpNx0qJzcEA/exec"
};

async function callBackend(action, payload = {}) {
  try {
    const response = await fetch(API_CONFIG.WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, ...payload })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Backend Communication Error:', error);
    throw error;
  }
}

// ==========================================
// 2. MAIN APPLICATION LOGIC / EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Your app initialization, login checks, 
  // and UI rendering logic go here!
});