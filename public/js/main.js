document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navMenu.classList.toggle('active');
      if (overlay) overlay.classList.toggle('active');
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.className = navMenu.classList.contains('active')
          ? 'fas fa-times'
          : 'fas fa-bars';
      }
    });

    document.querySelectorAll('.nav-menu a').forEach(function(link) {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });

    document.addEventListener('click', function(e) {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  }

  setTimeout(function() {
    const flashes = document.querySelectorAll('.flash');
    flashes.forEach(function(flash) {
      flash.style.transition = 'opacity 0.5s ease';
      flash.style.opacity = '0';
      setTimeout(function() { flash.remove(); }, 500);
    });
  }, 5000);
});
