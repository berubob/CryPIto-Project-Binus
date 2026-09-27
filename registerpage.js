class FormValidator {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.fields = {
            fullName: document.getElementById('fullName'),
            username: document.getElementById('username'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword'),
            phone: document.getElementById('phone')
        };
        this.registerBtn = document.getElementById('registerBtn');
        this.validationState = {
            fullName: false,
            username: false,
            email: false,
            password: false,
            confirmPassword: false,
            phone: false
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
    }

    setupEventListeners() {
        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            field.addEventListener('input', () => this.validateField(fieldName));
            field.addEventListener('blur', () => this.validateField(fieldName));
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupPasswordToggle() {
        const passwordToggle = document.getElementById('passwordToggle');
        const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
        
        passwordToggle.addEventListener('click', () => {
            this.togglePassword('password', passwordToggle);
        });
        
        confirmPasswordToggle.addEventListener('click', () => {
            this.togglePassword('confirmPassword', confirmPasswordToggle);
        });
    }

    togglePassword(fieldName, toggleElement) {
        const field = this.fields[fieldName];
        if (field.type === 'password') {
            field.type = 'text';
            toggleElement.textContent = '✔';
        } else {
            field.type = 'password';
            toggleElement.textContent = '👁';
        }
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        let isValid = false;
        let errorMessage = '';
        let successMessage = '';

        switch (fieldName) {
            case 'fullName':
                isValid = this.validateFullName(value);
                if (!isValid && value) {
                    errorMessage = 'Please enter a valid full name';
                } else if (isValid) {
                    successMessage = 'Valid full name';
                }
                break;

            case 'username':
                isValid = this.validateUsername(value);
                if (!isValid && value) {
                    errorMessage = 'Username must be 6-16 characters';
                } else if (isValid) {
                    successMessage = 'Username available';
                }
                break;

            case 'email':
                isValid = this.validateEmail(value);
                if (!isValid && value) {
                    errorMessage = 'Please enter a valid email address';
                } else if (isValid) {
                    successMessage = 'Valid email address';
                }
                break;

            case 'password':
                const strength = this.validatePassword(value);
                isValid = strength.isValid;
                this.updatePasswordStrength(strength);
                if (!isValid && value) {
                    errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, number, and special characters';
                } else if (isValid) {
                    successMessage = 'Strong password';
                }
                // Re-validate confirm password when password changes
                if (this.fields.confirmPassword.value) {
                    this.validateField('confirmPassword');
                }
                break;

            case 'confirmPassword':
                isValid = this.validateConfirmPassword(value);
                if (!isValid && value) {
                    errorMessage = 'Passwords do not match';
                } else if (isValid) {
                    successMessage = 'Passwords match';
                }
                break;

            case 'phone':
                isValid = this.validatePhone(value);
                if (!isValid && value) {
                    errorMessage = 'Please enter a valid phone number';
                } else if (isValid) {
                    successMessage = 'Valid phone number';
                }
                break;
        }

        this.updateFieldUI(fieldName, isValid, errorMessage, successMessage);
        this.validationState[fieldName] = isValid && value !== '';
        this.updateRegisterButton();
    }

    validateFullName(value) {
        const nameRegex = /^[a-zA-Z\s]{2,}$/;
        const words = value.split(' ').filter(word => word.length > 0);
        return nameRegex.test(value) && words.length >= 2 && words.every(word => word.length >= 2);
    }

    validateUsername(value) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(value);
    }

    validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    validatePassword(value) {
        const minLength = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        const score = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
        
        return {
            isValid: score === 5,
            score: score,
            strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
        };
    }

    validateConfirmPassword(value) {
        return value === this.fields.password.value && value !== '';
    }

    validatePhone(value) {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return phoneRegex.test(value.replace(/\s+/g, ''));
    }

    updateFieldUI(fieldName, isValid, errorMessage, successMessage) {
        const field = this.fields[fieldName];
        const errorElement = document.getElementById(`${fieldName}Error`);
        const successElement = document.getElementById(`${fieldName}Success`);
        const iconElement = document.getElementById(`${fieldName}Icon`);

        // Reset classes
        field.classList.remove('error', 'success');
        
        if (field.value.trim() === '') {
            // Empty field
            errorElement.style.display = 'none';
            successElement.style.display = 'none';
            if (iconElement && fieldName !== 'username') iconElement.textContent = '';
        } else if (isValid) {
            // Valid field
            field.classList.add('success');
            errorElement.style.display = 'none';
            successElement.textContent = successMessage;
            successElement.style.display = 'block';
            if (iconElement && fieldName !== 'username') iconElement.textContent = '✅';
        } else {
            // Invalid field
            field.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            successElement.style.display = 'none';
            if (iconElement && fieldName !== 'username') iconElement.textContent = '❌';
        }
    }

    updatePasswordStrength(strength) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        const percentage = (strength.score / 5) * 100;
        strengthFill.style.width = `${percentage}%`;
        
        strengthFill.className = `strength-fill strength-${strength.strength}`;
        strengthText.textContent = `Password strength: ${strength.strength.charAt(0).toUpperCase() + strength.strength.slice(1)}`;
    }

    updateRegisterButton() {
        const allValid = Object.values(this.validationState).every(state => state === true);
        this.registerBtn.disabled = !allValid;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        Object.keys(this.fields).forEach(fieldName => {
            this.validateField(fieldName);
        });
        
        const allValid = Object.values(this.validationState).every(state => state === true);
        
        if (allValid) {
            // Simulate form submission
            this.registerBtn.textContent = 'Registering...';
            this.registerBtn.disabled = true;
            
            setTimeout(() => {
                alert('Registration successful! Welcome to CryPIto!');
                this.form.reset();
                this.registerBtn.textContent = 'Register';
                this.validationState = Object.keys(this.validationState).reduce((acc, key) => {
                    acc[key] = false;
                    return acc;
                }, {});
                this.updateRegisterButton();
                
                // Reset UI
                Object.keys(this.fields).forEach(fieldName => {
                    this.updateFieldUI(fieldName, false, '', '');
                });
                
                // Reset password strength
                document.getElementById('strengthFill').style.width = '0%';
                document.getElementById('strengthText').textContent = 'Password strength';
            }, 2000);
        } else {
            alert('Please fix all validation errors before submitting.');
        }
    }
}

// Initialize the form validator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator();
});

// Phone number formatting
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    if (value.length <= 10) {
        e.target.value = formattedValue;
    }
});