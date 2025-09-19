// ===== VALIDATION UTILITY =====

class ValidationHelper {
    constructor() {
        this.rules = {
            mood: {
                min: 1,
                max: 5,
                type: 'number'
            },
            sleepQuality: {
                min: 1,
                max: 10,
                type: 'number'
            },
            intensity: {
                min: 1,
                max: 10,
                type: 'number'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                type: 'string'
            },
            text: {
                minLength: 1,
                maxLength: 1000,
                type: 'string'
            }
        };
    }

    // Validate mood value
    validateMood(value) {
        return this.validateNumber(value, this.rules.mood.min, this.rules.mood.max);
    }

    // Validate sleep quality
    validateSleepQuality(value) {
        return this.validateNumber(value, this.rules.sleepQuality.min, this.rules.sleepQuality.max);
    }

    // Validate intensity rating
    validateIntensity(value) {
        return this.validateNumber(value, this.rules.intensity.min, this.rules.intensity.max);
    }

    // Validate email
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email is required' };
        }
        
        if (!this.rules.email.pattern.test(email)) {
            return { valid: false, error: 'Please enter a valid email address' };
        }
        
        return { valid: true };
    }

    // Validate text input
    validateText(text, minLength = 1, maxLength = 1000) {
        if (!text || typeof text !== 'string') {
            return { valid: false, error: 'Text is required' };
        }
        
        const trimmed = text.trim();
        
        if (trimmed.length < minLength) {
            return { valid: false, error: `Text must be at least ${minLength} characters long` };
        }
        
        if (trimmed.length > maxLength) {
            return { valid: false, error: `Text must be no more than ${maxLength} characters long` };
        }
        
        return { valid: true, value: trimmed };
    }

    // Validate number within range
    validateNumber(value, min, max) {
        const num = Number(value);
        
        if (isNaN(num)) {
            return { valid: false, error: 'Please enter a valid number' };
        }
        
        if (num < min || num > max) {
            return { valid: false, error: `Value must be between ${min} and ${max}` };
        }
        
        return { valid: true, value: num };
    }

    // Validate time format (HH:MM)
    validateTime(timeString) {
        if (!timeString || typeof timeString !== 'string') {
            return { valid: false, error: 'Time is required' };
        }
        
        const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (!timePattern.test(timeString)) {
            return { valid: false, error: 'Please enter a valid time (HH:MM)' };
        }
        
        return { valid: true, value: timeString };
    }

    // Validate date
    validateDate(dateValue) {
        if (!dateValue) {
            return { valid: false, error: 'Date is required' };
        }
        
        const date = new Date(dateValue);
        
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Please enter a valid date' };
        }
        
        // Check if date is not too far in the future (more than 1 year)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        if (date > oneYearFromNow) {
            return { valid: false, error: 'Date cannot be more than one year in the future' };
        }
        
        return { valid: true, value: date };
    }

    // Sanitize HTML to prevent XSS
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    // Validate and sanitize form data
    validateFormData(formData, rules) {
        const results = {
            valid: true,
            errors: {},
            sanitized: {}
        };

        for (const [field, value] of Object.entries(formData)) {
            const rule = rules[field];
            if (!rule) continue;

            let validation;
            
            switch (rule.type) {
                case 'email':
                    validation = this.validateEmail(value);
                    break;
                case 'text':
                    validation = this.validateText(value, rule.minLength, rule.maxLength);
                    break;
                case 'number':
                    validation = this.validateNumber(value, rule.min, rule.max);
                    break;
                case 'time':
                    validation = this.validateTime(value);
                    break;
                case 'date':
                    validation = this.validateDate(value);
                    break;
                default:
                    validation = { valid: true, value: value };
            }

            if (!validation.valid) {
                results.valid = false;
                results.errors[field] = validation.error;
            } else {
                // Sanitize the value if it's a string
                if (typeof validation.value === 'string') {
                    results.sanitized[field] = this.sanitizeHTML(validation.value);
                } else {
                    results.sanitized[field] = validation.value;
                }
            }
        }

        return results;
    }

    // Show validation errors in the UI
    showValidationErrors(errors, formElement) {
        // Clear previous errors
        const existingErrors = formElement.querySelectorAll('.validation-error');
        existingErrors.forEach(error => error.remove());

        // Show new errors
        for (const [field, message] of Object.entries(errors)) {
            const fieldElement = formElement.querySelector(`[name="${field}"], #${field}`);
            if (fieldElement) {
                const errorElement = document.createElement('div');
                errorElement.className = 'validation-error';
                errorElement.textContent = message;
                errorElement.style.cssText = `
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                `;
                
                fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);
                fieldElement.style.borderColor = '#ef4444';
            }
        }
    }

    // Clear validation errors
    clearValidationErrors(formElement) {
        const errors = formElement.querySelectorAll('.validation-error');
        errors.forEach(error => error.remove());

        const fields = formElement.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.style.borderColor = '';
        });
    }
}

// Make validation helper globally available
window.validator = new ValidationHelper();

console.log('✅ Validation Helper Initialized Successfully!');