document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registration-form');
  const formContainer = document.getElementById('form-container');
  const successContainer = document.getElementById('success-container');
  const clearBtn = document.getElementById('clear-btn');
  const editResponseBtn = document.getElementById('edit-response-btn');
  const otherRadio = document.getElementById('ref-other');
  const otherTextInput = document.getElementById('referralSourceOtherText');
  const referralRadios = document.getElementsByName('referralSource');
  
  // Create loading overlay dynamic element
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay hidden';
  loadingOverlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(loadingOverlay);

  // Focus effect for question cards
  const cards = document.querySelectorAll('.question-card');
  cards.forEach(card => {
    // Add focus listener for text inputs
    const textInput = card.querySelector('.text-input');
    if (textInput) {
      textInput.addEventListener('focus', () => {
        removeActiveCards();
        card.classList.add('active-card');
      });
      textInput.addEventListener('blur', () => {
        card.classList.remove('active-card');
      });
    }

    // Add click listeners to cards containing checkboxes or radios
    card.addEventListener('click', (e) => {
      // Don't override text input focus triggers
      if (e.target.tagName !== 'INPUT' || e.target.type === 'checkbox' || e.target.type === 'radio') {
        removeActiveCards();
        card.classList.add('active-card');
      }
    });
  });

  // Global helper to remove active outline class
  function removeActiveCards() {
    cards.forEach(card => card.classList.remove('active-card'));
  }

  // Handle radio change events for "Other" text input activation
  referralRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (otherRadio.checked) {
        otherTextInput.disabled = false;
        otherTextInput.focus();
      } else {
        otherTextInput.disabled = true;
        otherTextInput.value = '';
        document.getElementById('card-referralSource').classList.remove('has-error');
      }
    });
  });

  // Also focus "Other" radio when clicking inside "Other" text field
  otherTextInput.addEventListener('focus', () => {
    otherRadio.checked = true;
    otherTextInput.disabled = false;
  });

  // Client-side validator
  function validateForm() {
    let isValid = true;
    let firstErrorCard = null;

    // Helper to mark validation error
    function markError(cardId, hasError) {
      const card = document.getElementById(cardId);
      if (hasError) {
        card.classList.add('has-error');
        isValid = false;
        if (!firstErrorCard) {
          firstErrorCard = card;
        }
      } else {
        card.classList.remove('has-error');
      }
    }

    // 1. Email check
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    markError('card-email', !email || !emailRegex.test(email));

    // 2. Full Name check
    const fullName = document.getElementById('fullName').value.trim();
    markError('card-fullName', !fullName);

    // 3. Mobile No. check
    const mobile = document.getElementById('mobile').value.trim();
    markError('card-mobile', !mobile);

    // 4. College Name check
    const college = document.getElementById('college').value.trim();
    markError('card-college', !college);

    // 5. Department / Branch / Year check
    const deptBranchYear = document.getElementById('deptBranchYear').value.trim();
    markError('card-deptBranchYear', !deptBranchYear);

    // 6. WhatsApp Checkbox check
    const joinedWhatsapp = document.getElementById('joinedWhatsapp').checked;
    markError('card-joinedWhatsapp', !joinedWhatsapp);

    // 7. Referral Source check
    let referralSourceSelected = false;
    let selectedReferralVal = '';
    referralRadios.forEach(radio => {
      if (radio.checked) {
        referralSourceSelected = true;
        selectedReferralVal = radio.value;
      }
    });

    if (!referralSourceSelected) {
      markError('card-referralSource', true);
    } else if (selectedReferralVal === 'Other' && !otherTextInput.value.trim()) {
      markError('card-referralSource', true);
    } else {
      markError('card-referralSource', false);
    }

    // Scroll to the first error card if any
    if (firstErrorCard) {
      firstErrorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Find and focus the input if possible
      const input = firstErrorCard.querySelector('input');
      if (input) input.focus();
    }

    return isValid;
  }

  // Remove error outline on text input typing
  const textInputs = document.querySelectorAll('.text-input');
  textInputs.forEach(input => {
    input.addEventListener('input', () => {
      const card = input.closest('.question-card');
      if (card && card.classList.contains('has-error')) {
        // Run inline validation for email vs standard text
        if (input.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(input.value.trim())) {
            card.classList.remove('has-error');
          }
        } else {
          if (input.value.trim()) {
            card.classList.remove('has-error');
          }
        }
      }
    });
  });

  // Remove error outline on check changes
  document.getElementById('joinedWhatsapp').addEventListener('change', (e) => {
    if (e.target.checked) {
      document.getElementById('card-joinedWhatsapp').classList.remove('has-error');
    }
  });

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Get values
    const email = document.getElementById('email').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const college = document.getElementById('college').value.trim();
    const deptBranchYear = document.getElementById('deptBranchYear').value.trim();
    const joinedWhatsapp = document.getElementById('joinedWhatsapp').checked;
    const sendCopy = document.getElementById('sendCopy').checked;

    let referralSource = '';
    referralRadios.forEach(radio => {
      if (radio.checked) {
        if (radio.value === 'Other') {
          referralSource = otherTextInput.value.trim();
        } else {
          referralSource = radio.value;
        }
      }
    });

    const payload = {
      email,
      fullName,
      mobile,
      college,
      deptBranchYear,
      joinedWhatsapp,
      referralSource,
      sendCopy
    };

    // Show loading spinner
    loadingOverlay.classList.remove('hidden');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        // Toggle view state
        formContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Console check if mail server configured
        if (result.emailStatus && !result.emailStatus.success) {
          console.warn('Backend warning: Registration stored, but email failed to dispatch.', result.emailStatus.reason || result.emailStatus.error);
        }
      } else {
        alert(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Submit Error:', err);
      alert('Network error. Unable to connect to the registration server.');
    } finally {
      // Hide spinner
      loadingOverlay.classList.add('hidden');
    }
  });

  // Clear Form Handler
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all responses?')) {
      form.reset();
      otherTextInput.disabled = true;
      cards.forEach(card => card.classList.remove('has-error'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Edit response link will naturally navigate to WhatsApp now
});
