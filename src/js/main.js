import './sw.installer.js';

// const version = document.getElementById('version');
// const url = "https://api.github.com/repos/ioucyf/prints.byy.design/commits/main";

// fetch(url)
//   .then(response => response.json())
//   .then(data => {
//     // console.log("Latest commit SHA:", data.sha);
//     // version.textContent = data.sha;
//   })
//   .catch(error => console.error("Error fetching commit:", error));

const loadImage = (inputId, imgId) => {
  const input = document.getElementById(inputId);
  const img = document.getElementById(imgId);
  const placeholder = img.previousElementSibling;
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      img.src = url;
      img.style.display = 'block';
      if (placeholder) placeholder.remove();
    }
  });
};

function resetImages() {
  ['frontInput', 'backInput'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.value = null;
    }
  });

  ['frontCard', 'backCard'].forEach(id => {
    const img = document.getElementById(id);
    img.src = '';
    img.style.display = 'none';

    const card = img.parentElement;
    // Remove existing placeholder if one exists
    const existingPlaceholder = card.querySelector('.placeholder');
    if (existingPlaceholder) {
      existingPlaceholder.remove();
    }
    
    // Add new placeholder
    const p = document.createElement('p');
    p.className = 'placeholder';
    p.textContent = id.includes('front') ? 'Tap to upload front' : 'Tap to upload back';
    card.insertBefore(p, img);
  });

  // Re-initialize the listeners to capture the new placeholders
  loadImage('frontInput', 'frontCard');
  loadImage('backInput', 'backCard');
}

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator?.userAgent) ||
    (navigator?.platform === 'MacIntel' && navigator?.maxTouchPoints > 1)
  );
}

if (isIOS()) {
  const smallPrint = document.querySelector('small.print');
  smallPrint.classList.add('ios');
}

const printButton = document.getElementById('button-print');
printButton.addEventListener('click', () => { return window.print(); });

const resetButton = document.getElementById('button-reset');
resetButton.addEventListener('click', resetImages);

loadImage('frontInput', 'frontCard');
loadImage('backInput', 'backCard');
