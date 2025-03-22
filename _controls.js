const video = document.getElementById('videoElement');
const canvas = document.getElementById('overlay');
const sound = document.getElementById('repSound');
const controlPanel = document.getElementById('controlPanel');
const infoBox = document.getElementById('infoBox');

let stream;
let tracking = false;

async function setupCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      resolve();
    };
  });
}

function toggleCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    tracking = false;
  } else {
    requestCameraAccess();
  }
}

function resetCounters() {
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
    alert('Camera access is denied. Please allow camera access in your browser settings.');
    controlPanel.classList.remove('d-none');
  } else if (result.state === 'granted') {
    if (!video.srcObject) {
      alert('Camera access is granted but video is not active. Please start the camera.');
      controlPanel.classList.remove('d-none');
    }
  } else {
    console.log('Camera permission is not yet granted. Waiting for user interaction.');
  }
});