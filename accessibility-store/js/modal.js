$(function(){
  
  window.openModal = function() {
    window.lastFocusedElement = document.activeElement;
    $('#announcements').text('Dialog opened');
    $('#cart-modal').attr('aria-hidden', 'false').fadeIn(function() {
      $('#modal-ok').focus();
    });
    $(document).on('keydown.modal', trapFocus);
  };
  
  window.closeModal = function() {
    $('#cart-modal').attr('aria-hidden', 'true').fadeOut(function() {
      $('#announcements').text('Dialog closed');
      if (window.lastFocusedElement) {
        window.lastFocusedElement.focus();
      }
    });
    $(document).off('keydown.modal');
  };
  
  function trapFocus(e) {
    if (e.key === 'Tab' && $('#cart-modal').is(':visible')) {
      var focusableElements = $('#cart-modal').find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').filter(':visible');
      var firstElement = focusableElements.first()[0];
      var lastElement = focusableElements.last()[0];
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  
  $(document).on('click keypress', '.close, #modal-ok', function(e) {
    if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeModal();
    }
  });
  
  $(window).on('click', function(event) {
    if ($(event.target).is('#cart-modal')) {
      closeModal();
    }
  });
  
});
