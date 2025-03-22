//BlazePose Dumbell Rep Counter
let detector;
const ctx = canvas.getContext('2d');
window.leftCount = 0;
window.rightCount = 0;
let leftUp = false, rightUp = false;

async function requestCameraAccess() {
  try {
    await setupCamera();
    video.play();

    if (!detector) {
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        { runtime: 'tfjs' }
      );
    }

    if (!tracking) {
      tracking = true;
      render();
    }
  } catch (err) {
    alert('Camera permission denied.');
  }
}

function getAngle(a, b, c) {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const cb = { x: b.x - c.x, y: b.y - c.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  const angle = Math.acos(dot / (magAB * magCB));
  return Math.round((angle * 180) / Math.PI);
}

function drawKeypoints(keypoints) {
  keypoints.forEach(kp => {
    if (kp.score > 0.4) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'lime';
      ctx.fill();
    }
  });
}

async function render() {
  const poses = await detector.estimatePoses(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (poses.length > 0) {
    const kp = poses[0].keypoints;

    drawKeypoints(kp);

    const lw = kp.find(p => p.name === 'left_wrist');
    const le = kp.find(p => p.name === 'left_elbow');
    const ls = kp.find(p => p.name === 'left_shoulder');
    const rw = kp.find(p => p.name === 'right_wrist');
    const re = kp.find(p => p.name === 'right_elbow');
    const rs = kp.find(p => p.name === 'right_shoulder');

    const leftAngle = getAngle(lw, le, ls);
    const rightAngle = getAngle(rw, re, rs);

    document.getElementById('leftAngle').textContent = `${leftAngle}°`;
    document.getElementById('rightAngle').textContent = `${rightAngle}°`;

    if (leftAngle < 60 && !leftUp) leftUp = true;
    if (leftAngle > 160 && leftUp) {
      window.leftCount++;
      document.getElementById('leftCount').textContent = window.leftCount;
      leftUp = false;
      sound.play();
    }

    if (rightAngle < 60 && !rightUp) rightUp = true;
    if (rightAngle > 160 && rightUp) {
      window.rightCount++;
      document.getElementById('rightCount').textContent = window.rightCount;
      rightUp = false;
      sound.play();
    }
  }

  if (tracking) requestAnimationFrame(render);
}
