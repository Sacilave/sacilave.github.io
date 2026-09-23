document.addEventListener('DOMContentLoaded', () => {
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="loader-inner">
      <div class="loader-line-wrap">
        <div class="loader-line"></div>
      </div>
      <div class="loader-line-wrap">
        <div class="loader-line"></div>
      </div>
      <div class="loader-line-wrap">
        <div class="loader-line"></div>
      </div>
    </div>
  `;
  document.body.appendChild(loader);
  
  window.addEventListener('load', () => {
    loader.classList.add('loaded');
    setTimeout(() => loader.remove(), 500);
  });
}); 