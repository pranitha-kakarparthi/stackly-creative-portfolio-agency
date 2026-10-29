/**
 * STACKLY CREATIVE AGENCY - AUTHENTICATION & FORM VALIDATION ENGINE
 * Handles:
 * - Pure blank initial fields (no demo credentials)
 * - Name fields strictly accepting alphabets only (^[A-Za-z\s]+$)
 * - Mobile number strictly requiring exact 10 digits (^\d{10}$)
 * - Password strength meter & live checklist
 * - Show/Hide password toggle
 * - Derived display name from email (e.g. john.doe@agency.com -> John Doe)
 * - LocalStorage session persistence & registration
 * - Auto-focus first invalid field
 */

document.addEventListener('DOMContentLoaded', () => {
  // Helpers
  const formatNameFromEmail = (email) => {
    if (!email || !email.includes('@')) return 'Creative Explorer';
    const userPart = email.split('@')[0];
    const cleaned = userPart.replace(/[._\-+]/g, ' ').trim();
    if (!cleaned) return 'Creative Explorer';
    return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // Restrict Name Inputs: Alphabets & Spaces only
  const alphabetInputs = document.querySelectorAll('.input-alphabet-only');
  alphabetInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const sanitized = input.value.replace(/[^A-Za-z\s]/g, '');
      if (input.value !== sanitized) {
        input.value = sanitized;
      }
    });
  });

  // Restrict Mobile Number Inputs: Digits only, max 10 digits
  const digit10Inputs = document.querySelectorAll('.input-phone-10');
  digit10Inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const sanitized = input.value.replace(/\D/g, '').slice(0, 10);
      if (input.value !== sanitized) {
        input.value = sanitized;
      }
    });
  });

  // Password Visibility Toggle
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const eyeIcon = btn.querySelector('svg');
      if (eyeIcon) {
        eyeIcon.style.opacity = isPassword ? '0.6' : '1';
      }
    });
  });

  // Password Strength Meter (Sign Up)
  const regPassword = document.getElementById('reg-password');
  const strengthBox = document.querySelector('.password-strength-box');
  const strengthBarFill = document.querySelector('.strength-bar-fill');
  const strengthFeedback = document.querySelector('.strength-feedback-text');

  const ruleUpper = document.getElementById('rule-upper');
  const ruleLower = document.getElementById('rule-lower');
  const ruleNumber = document.getElementById('rule-number');
  const ruleSpecial = document.getElementById('rule-special');
  const ruleLength = document.getElementById('rule-length');

  if (regPassword && strengthBox) {
    regPassword.addEventListener('input', () => {
      const val = regPassword.value;
      if (!val) {
        strengthBox.classList.remove('visible');
        return;
      }
      strengthBox.classList.add('visible');

      const hasUpper = /[A-Z]/.test(val);
      const hasLower = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSpecial = /[^A-Za-z0-9]/.test(val);
      const hasLength = val.length >= 8;

      if (ruleUpper) ruleUpper.classList.toggle('valid', hasUpper);
      if (ruleLower) ruleLower.classList.toggle('valid', hasLower);
      if (ruleNumber) ruleNumber.classList.toggle('valid', hasNumber);
      if (ruleSpecial) ruleSpecial.classList.toggle('valid', hasSpecial);
      if (ruleLength) ruleLength.classList.toggle('valid', hasLength);

      let score = 0;
      if (hasUpper) score++;
      if (hasLower) score++;
      if (hasNumber) score++;
      if (hasSpecial) score++;
      if (hasLength) score++;

      const percentages = [0, 20, 40, 60, 80, 100];
      const colors = ['#EF4444', '#EF4444', '#F59E0B', '#8DA6CC', '#AAA648', '#10B981'];
      const labels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

      strengthBarFill.style.width = percentages[score] + '%';
      strengthBarFill.style.backgroundColor = colors[score];
      strengthFeedback.textContent = labels[score];
      strengthFeedback.style.color = colors[score];
    });
  }

  // SIGN IN FORM HANDLING
  const signInForm = document.getElementById('signin-form');
  if (signInForm) {
    signInForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('signin-email');
      const passInput = document.getElementById('signin-password');
      const roleSelect = document.getElementById('signin-role');
      const alertBox = document.getElementById('signin-alert');

      let isValid = true;
      let firstInvalid = null;

      // Reset errors
      signInForm.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
      signInForm.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
      if (alertBox) alertBox.classList.remove('visible');

      // Validate Email
      const emailVal = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        showError(emailInput, 'signin-email-error', 'Please enter a valid business email address.');
        isValid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      }

      // Validate Password
      const passVal = passInput.value;
      if (!passVal || passVal.length < 6) {
        showError(passInput, 'signin-pass-error', 'Password must be at least 6 characters.');
        isValid = false;
        if (!firstInvalid) firstInvalid = passInput;
      }

      // Validate Role
      const roleVal = roleSelect ? roleSelect.value : 'Creative Director';
      if (!roleVal) {
        showError(roleSelect, 'signin-role-error', 'Please select your studio role.');
        isValid = false;
        if (!firstInvalid) firstInvalid = roleSelect;
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Format user display name from email
      const displayName = formatNameFromEmail(emailVal);

      // Check registered users in localStorage or create session
      let existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      let userObj = existingUsers.find(u => u.email.toLowerCase() === emailVal.toLowerCase());

      if (!userObj) {
        // Create user record dynamically
        userObj = {
          name: displayName,
          email: emailVal,
          role: roleVal,
          joinedAt: new Date().toISOString()
        };
        existingUsers.push(userObj);
        localStorage.setItem('users', JSON.stringify(existingUsers));
      } else {
        // Update role if changed at login
        userObj.role = roleVal;
        userObj.name = userObj.name || displayName;
      }

      // Persist active session
      const now = new Date().toLocaleString();
      const sessionData = {
        name: displayName,
        email: emailVal,
        role: roleVal,
        loginStatus: 'Active Session',
        lastLogin: localStorage.getItem('lastLoginTimestamp') || now,
        loggedInAt: now
      };

      localStorage.setItem('currentUser', JSON.stringify(sessionData));
      localStorage.setItem('role', roleVal);
      localStorage.setItem('lastLoginTimestamp', now);

      // Success feedback & redirect
      if (alertBox) {
        alertBox.className = 'auth-alert success visible';
        alertBox.innerHTML = `<span>✓ Authentication successful. Redirecting to your <strong>${roleVal}</strong> Dashboard...</span>`;
      }

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    });
  }

  // SIGN UP FORM HANDLING
  const signUpForm = document.getElementById('signup-form');
  if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fNameInput = document.getElementById('reg-firstname');
      const lNameInput = document.getElementById('reg-lastname');
      const emailInput = document.getElementById('reg-email');
      const phoneInput = document.getElementById('reg-phone');
      const roleSelect = document.getElementById('reg-role');
      const passInput = document.getElementById('reg-password');
      const confirmPassInput = document.getElementById('reg-confirmpassword');
      const termsCheck = document.getElementById('reg-terms');
      const alertBox = document.getElementById('signup-alert');

      let isValid = true;
      let firstInvalid = null;

      // Reset
      signUpForm.querySelectorAll('.error-msg').forEach(el => el.classList.remove('visible'));
      signUpForm.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
      if (alertBox) alertBox.classList.remove('visible');

      // 1. First Name (Strictly alphabets only)
      const fName = fNameInput.value.trim();
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!fName || !nameRegex.test(fName)) {
        showError(fNameInput, 'reg-fname-error', 'First name must contain only alphabets.');
        isValid = false;
        if (!firstInvalid) firstInvalid = fNameInput;
      }

      // 2. Last Name (Strictly alphabets only)
      const lName = lNameInput.value.trim();
      if (!lName || !nameRegex.test(lName)) {
        showError(lNameInput, 'reg-lname-error', 'Last name must contain only alphabets.');
        isValid = false;
        if (!firstInvalid) firstInvalid = lNameInput;
      }

      // 3. Email
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showError(emailInput, 'reg-email-error', 'Please provide a valid corporate email address.');
        isValid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      }

      // 4. Mobile Phone (Exact 10 digits)
      const phone = phoneInput.value.trim();
      const phoneRegex = /^\d{10}$/;
      if (!phone || !phoneRegex.test(phone)) {
        showError(phoneInput, 'reg-phone-error', 'Mobile number must be exactly 10 digits.');
        isValid = false;
        if (!firstInvalid) firstInvalid = phoneInput;
      }

      // 5. Studio Role
      const role = roleSelect ? roleSelect.value : '';
      if (!role) {
        showError(roleSelect, 'reg-role-error', 'Please select an agency role.');
        isValid = false;
        if (!firstInvalid) firstInvalid = roleSelect;
      }

      // 6. Password (Must meet security criteria: Upper, Lower, Number, Special, Min 8)
      const password = passInput.value;
      const passValid = password.length >= 8 &&
                        /[A-Z]/.test(password) &&
                        /[a-z]/.test(password) &&
                        /[0-9]/.test(password) &&
                        /[^A-Za-z0-9]/.test(password);

      if (!password || !passValid) {
        showError(passInput, 'reg-password-error', 'Password must be 8+ chars and contain uppercase, lowercase, number & special symbol.');
        isValid = false;
        if (!firstInvalid) firstInvalid = passInput;
      }

      // 7. Confirm Password
      const confirmPass = confirmPassInput.value;
      if (password !== confirmPass) {
        showError(confirmPassInput, 'reg-confirm-error', 'Passwords do not match.');
        isValid = false;
        if (!firstInvalid) firstInvalid = confirmPassInput;
      }

      // 8. Terms Checkbox
      if (termsCheck && !termsCheck.checked) {
        const termsError = document.getElementById('reg-terms-error');
        if (termsError) termsError.classList.add('visible');
        isValid = false;
        if (!firstInvalid) firstInvalid = termsCheck;
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Check unique email in localStorage
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        showError(emailInput, 'reg-email-error', 'An account with this email already exists. Please Sign In.');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Save user
      const newUser = {
        name: `${fName} ${lName}`,
        firstName: fName,
        lastName: lName,
        email: email,
        phone: phone,
        role: role,
        registeredAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Show success
      if (alertBox) {
        alertBox.className = 'auth-alert success visible';
        alertBox.innerHTML = `<span>✓ Registration complete! Redirecting to Sign In...</span>`;
      }

      setTimeout(() => {
        window.location.href = 'sign-in.html';
      }, 1000);
    });
  }

  // Error Helper
  function showError(inputEl, errorId, message) {
    if (inputEl) inputEl.classList.add('is-invalid');
    const errEl = document.getElementById(errorId);
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('visible');
    }
  }
});

