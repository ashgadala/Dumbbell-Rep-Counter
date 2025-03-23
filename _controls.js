const video = document.getElementById('videoElement');
const canvas = document.getElementById('overlay');
const sound = document.getElementById('repSound');
const controlPanel = document.getElementById('controlPanel');
const infoBox = document.getElementById('infoBox');

let stream;
let tracking = false;
let isCameraActive = false;


const storedLog = localStorage.getItem('movementLog');
if (storedLog) {
  movementLog.push(...JSON.parse(storedLog));
}


async function setupCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.classList.add('camera-fade-in');

  // Add live recording indicator
  if (!document.getElementById('liveIndicator')) {
    const indicator = document.createElement('div');
    indicator.id = 'liveIndicator';
    indicator.innerHTML = '<div style="position:absolute; top:10px; left:10px; background-color:#1e2a4a; color:#f87171; padding:0.5rem 1rem; border-radius:9999px; font-weight:bold; display:flex; align-items:center; gap:8px;"><span style="display:inline-block; width:12px; height:12px; background-color:#f87171; border-radius:50%;"></span>LIVE</div>';
    document.querySelector('.video-wrapper').appendChild(indicator);
  }
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      resolve();
    };
  });
}


let currentFacingMode = 'user'; // 'user' for front, 'environment' for back

async function startCamera(facingMode = 'user') {
  const constraints = {
    audio: false,
    video: {
      facingMode: { exact: facingMode }  //exact: facingMode //to display only facing camera
    }
  };

  try {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoElement = document.getElementById('cameraPreview');
    videoElement.srcObject = stream;
    currentFacingMode = facingMode;

  } catch (err) {
    console.error('Error starting camera:', err);
    alert('Could not access the selected camera.');
  }
}

function flipCamera() {
  const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  startCamera(newFacingMode);
}

// Start with the front camera by default
//startCamera();



// function toggleCamera() {
//   const modal = new bootstrap.Modal(document.getElementById('cameraToggleModal'));
//   modal.show();
// }

// function confirmToggleCamera() {
//   if (video.srcObject) {
//     video.srcObject.getTracks().forEach(track => track.stop());
//     video.srcObject = null;
//     tracking = false;
//   } else {
//     requestCameraAccess();
//   }
// } 

function toggleCamera() {
  const modal = new bootstrap.Modal(document.getElementById('cameraToggleModal'));
  const messageEl = document.getElementById('cameraToggleModalMessage');
  const confirmBtn = document.getElementById('confirmCameraToggle');
  const isCameraOn = video.srcObject && video.srcObject.getTracks().some(track => track.readyState === 'live');
//alert(isCameraOn);
  if (isCameraOn === true) {
    messageEl.textContent = 'The camera is about to turn off. Are you sure?';
    confirmBtn.textContent = 'Yes, Turn Off Camera';
  } else {
    //alert('else');
    messageEl.textContent = 'The camera is about to turn on. Are you ready?';
    confirmBtn.textContent = 'Yes, Turn On Camera';
  }

  modal.show();
}

function confirmToggleCamera() {
  showLoadingOnConfirmButton();
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    setTimeout(() => hideLoadingOnConfirmButton('Yes, Turn On Camera'), 500);
    showToast('📴 Camera turned off', 'bg-danger bg-opacity-75');

    tracking = false;
  } else {
    requestCameraAccess().finally(() =>
      setTimeout(() => hideLoadingOnConfirmButton('Yes, Turn Off Camera'), 500)
    );
    showToast('🎥 Camera turned on', 'bg-success bg-opacity-75');

  }
}

function resetCounters() {
  localStorage.removeItem('movementLog'); // 👈 Clears browser log
  sessionStorage.removeItem('movementLog');// 👈 Clears session log

  window.leftCount = 0;
  window.rightCount = 0;
  document.getElementById('leftCount').textContent = 0;
  document.getElementById('rightCount').textContent = 0;
}

function sendToDatabase() {
  const payload = {
    leftReps: window.leftCount,
    rightReps: window.rightCount,
    timestamp: new Date().toISOString()
  };
  fetch('https://your-api-endpoint.com/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => console.log('Saved:', data))
  .catch(err => console.error('Error:', err));
}

// function toggleFullscreen() {
//   const videoWrapper = document.querySelector('.video-wrapper');
//   if (!document.fullscreenElement) {
//     videoWrapper.requestFullscreen();
//   } else {
//     document.exitFullscreen();
//   }
// }

//Full screen to HTML document only
function toggleFullscreen() {
  const root = document.documentElement; // full HTML document

  if (!document.fullscreenElement) {
    if (root.requestFullscreen) {
      root.requestFullscreen();
    } else if (root.webkitRequestFullscreen) {
      root.webkitRequestFullscreen();
    } else if (root.msRequestFullscreen) {
      root.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

function infobox() {
// Always enable draggable
infoBox.style.width='300px'
infoBox.style.position = 'fixed';
//infoBox.style.top = '20px';
const videoWrapper = document.querySelector('.video-wrapper');
const videoRect = videoWrapper.getBoundingClientRect();
infoBox.style.top = (videoRect.bottom -100) + 'px';
    const controlPanelRect = controlPanel.getBoundingClientRect();
infoBox.style.left = videoRect.left + 'px';
//infoBox.style.left = '20px';
infoBox.style.zIndex = '1000';
infoBox.style.cursor = 'move';
makeDraggable(infoBox);

}
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    infobox();
    // onld styling
    // infoBox.style.position = 'fixed';
    // infoBox.style.top = '20px';
    // infoBox.style.left = '20px';
    // infoBox.style.zIndex = '2000';
    // infoBox.style.cursor = 'move';

// Add heading and style indicator

  }
});

infobox();

// Always enable draggable
const dragHeader = document.createElement('div');
dragHeader.innerHTML = `
  <div style="
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    background: #f7f7f7;
    color: #a09e9e;
    /* padding: 1rem 0.5rem; */
    font-size: 1rem;
    font-weight: 700;
    /* border-radius: 12px 0 0 12px; */
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
  ">
    ⠿ Drag Me
  </div>`;
//dragHeader.innerHTML = '<div style="display: flex; align-items: center; padding: 0.5rem; font-size: 0.85rem; font-weight: bold; background: #ede9fe; border-radius: 12px 12px 0 0; border-left: 6px solid #a78bfa; ">☰ Drag Me</div>';
infoBox.prepend(dragHeader);

function makeDraggable(element) {
  let isMouseDown = false;
  let offset = [0, 0];

  element.onmousedown = function (e) {
    isMouseDown = true;
    offset = [
      element.offsetLeft - e.clientX,
      element.offsetTop - e.clientY
    ];
  };

  document.onmouseup = function () {
    isMouseDown = false;
  };

  document.onmousemove = function (e) {
    e.preventDefault();
    if (isMouseDown) {
      element.style.left = (e.clientX + offset[0]) + 'px';
      element.style.top = (e.clientY + offset[1]) + 'px';
    }
  };
}

navigator.permissions.query({ name: 'camera' }).then(result => {
  if (result.state === 'denied') {
    showModal('Camera Access Denied', 'Camera access is denied. Please allow access in your browser settings.');
    controlPanel.classList.remove('d-none');
  } else if (result.state === 'granted') {
    document.getElementById('RequestCamerabtn').style.display = "none"; 
    if (!video.srcObject) {
      showModal('Camera Not Active', 'Camera access is granted, but the video stream is not active. Please start the camera.');
      controlPanel.classList.remove('d-none');
    }
  } else {
    console.log('Camera permission is not yet granted. Waiting for user interaction.');
  }
});
function showModal(title, message) {
  const modalTitle = document.getElementById('permissionModalLabel');
  const modalBody = document.getElementById('permissionModalBody');
  modalTitle.textContent = title;
  modalBody.textContent = message;

  const modal = new bootstrap.Modal(document.getElementById('permissionModal'));
  modal.show();
}


// function pulseShadow(element, color = '#6366f1') {
//   element.style.transition = 'box-shadow 0.3s ease-in-out';

//   let growing = true;
//   let pulseInterval = setInterval(() => {
//     if (growing) {
//       element.style.boxShadow = `0 0 30px 8px ${color}`;
//     } else {
//       element.style.boxShadow = `0 4px 12px rgba(0,0,0,0.1)`;
//     }
//     growing = !growing;
//   }, 500); // Beat every 0.5s

//   // Return a function to stop the pulse if needed
//   return () => {
//     clearInterval(pulseInterval);
//     element.style.boxShadow = ''; // Reset
//   };
// }



// ✅ Pulse-once effect
function pulseOnce(element, color = '#f1c232') {
  element.style.transition = 'box-shadow 0.3s ease-in-out';
  element.style.boxShadow = `0 0 30px 8px ${color}`;
  setTimeout(() => {
    element.style.boxShadow = 'none';
  }, 300);
}

// ✅ Flash red/green glow for form feedback
function flashColor(element, color) {
  const original = element.style.boxShadow;
  element.style.boxShadow = `0 0 25px 10px ${color}`;
  setTimeout(() => {
    element.style.boxShadow = original || 'none';
  }, 300);
}

// ✅ Shake for bad form
function shakeElement(element) {
  element.classList.add('shake');
  setTimeout(() => element.classList.remove('shake'), 500);
}

// ✅ Confetti burst
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      // particleCount: 100,
      // spread: 70,
      // origin: { y: 0.6 }

      particleCount: 1000,
      spread: 1200,
      startVelocity: 60,
      scalar: 1.2,
      origin: { y: 0.6 },
      ticks: 250
    });
  }
}



// ✅ Log every movement with timestamp
const movementLog = [];

function logMovement(side, angle) {
  const log = {
    side,
    angle,
    timestamp: new Date().toISOString()
  };
  movementLog.push(log);
   // NEW: Save to localStorage
   //localStorage.setItem('movementLog', JSON.stringify(movementLog));// Data persists on tab close
   sessionStorage.setItem('movementLog', JSON.stringify(movementLog)); /// data does not persistes on tab close

   console.log('Movement Logged:', log); // logs in console
}
function showLoadingOnConfirmButton() {
  const confirmBtn = document.getElementById('confirmCameraToggle');
  confirmBtn.disabled = true;
  confirmBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...';
}

function hideLoadingOnConfirmButton(text) {
  const confirmBtn = document.getElementById('confirmCameraToggle');
  confirmBtn.disabled = false;
  confirmBtn.textContent = text;
}

function showToast(message, color = 'bg-success') {
  const toastEl = document.getElementById('liveToast');
  const toastMsg = document.getElementById('liveToastMessage');

  toastEl.className = `toast align-items-center text-white ${color} border-0`;
  toastMsg.textContent = message;

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}



function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function showFlipButtonIfMobile() {
  if (isMobileDevice()) {
    document.getElementById('flipCameraBtn').classList.remove('d-none');
  }
}

// Call this once on page load
showFlipButtonIfMobile();