// Import DOMPurify
import DOMPurify from 'dompurify';

document.addEventListener('DOMContentLoaded', () => {
    // Create random twinkling stars
    const starsContainer = document.querySelector('.stars');
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 3 + 2;
        
        // Random animation duration
        const duration = Math.random() * 2 + 1;
        
        // Random brightness
        const brightness = Math.random() * 0.5 + 0.5;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.opacity = brightness;
        
        starsContainer.appendChild(star);
    }

    // Create UFO with windows and antenna
    const ufo = document.createElement('div');
    ufo.className = 'ufo';
    
    // Add windows
    for (let i = 0; i < 3; i++) {
        const window = document.createElement('div');
        window.className = 'window';
        ufo.appendChild(window);
    }
    
    // Add antenna
    const antenna = document.createElement('div');
    antenna.className = 'antenna';
    ufo.appendChild(antenna);
    
    starsContainer.appendChild(ufo);

    // Moon movement on mouse move
    const moon = document.querySelector('.moon');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        moon.style.transform = `translate(${x * 20 - 10}px, ${y * 20 - 10}px) rotate(${x * 10 - 5}deg)`;
    });

    // Countdown timer
    const targetDate = new Date('2025-04-16T20:00:00');
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const comingSoonElement = document.querySelector('.coming-soon');

    function updateCountdown() {
        const now = new Date();
        const timeDifference = targetDate - now;

        if (timeDifference <= 0) {
            comingSoonElement.textContent = 'We Are Arriving Soon!';
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            return;
        }

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');

        [daysElement, hoursElement, minutesElement, secondsElement].forEach(element => {
            element.classList.add('changing');
            setTimeout(() => element.classList.remove('changing'), 500);
        });
    }

    // Immediately update countdown when page loads
    updateCountdown();
    // Then update every second
    setInterval(updateCountdown, 1000);

    // Initialize Supabase client
    const supabaseUrl = 'https://qgcvysvlcdothjbhtcfo.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY3Z5c3ZsY2RvdGhqYmh0Y2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzU3MjQsImV4cCI6MjA2MDE1MTcyNH0.GgxXvFUwThtkYXsDgGGik_ol4lM0o5kUnDFzvXGBr4E';
    
    // Create Supabase client
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Get DOM elements
    const notifyBtn = document.getElementById('notifyBtn');
    const emailForm = document.getElementById('emailForm');
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const submitBtn = document.getElementById('submitBtn');
    const notification = document.getElementById('notification');

    // Add real-time validation for name input
    nameInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length > 15) {
            notification.textContent = DOMPurify.sanitize('Name cannot be longer than 15 characters');
            notification.style.display = 'block';
            notification.className = 'notification error';
        } else if (value.length < 3 && value.length > 0) {
            notification.textContent = DOMPurify.sanitize('Name must be at least 3 characters');
            notification.style.display = 'block';
            notification.className = 'notification error';
        } else {
            notification.style.display = 'none';
        }
    });

    // Add real-time validation for email input
    emailInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length > 30) {
            notification.textContent = DOMPurify.sanitize('Email cannot be longer than 30 characters');
            notification.style.display = 'block';
            notification.className = 'notification error';
        } else {
            notification.style.display = 'none';
        }
    });

    // Initially hide the form and notification
    emailForm.style.display = 'none';
    notification.style.display = 'none';

    // Show email form when "Get Notified" button is clicked
    notifyBtn.addEventListener('click', () => {
        console.log('Notify button clicked');
        emailForm.style.display = 'flex';
        notifyBtn.style.display = 'none';
    });

    // Rate limiting setup
    const submissionAttempts = new Map();
    const MAX_ATTEMPTS = 5;
    const BLOCK_DURATION = 100 * 60 * 1000; // 100 minutes in milliseconds

    function isRateLimited(email) {
        const now = Date.now();
        const userAttempts = submissionAttempts.get(email) || { count: 0, timestamp: now };
        
        if (userAttempts.count >= MAX_ATTEMPTS) {
            if (now - userAttempts.timestamp < BLOCK_DURATION) {
                return true;
            } else {
                // Reset after block duration
                userAttempts.count = 0;
                userAttempts.timestamp = now;
            }
        }
        
        userAttempts.count++;
        submissionAttempts.set(email, userAttempts);
        return false;
    }

    // Handle form submission
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Submit button clicked');
        
        // Sanitize user inputs
        const name = DOMPurify.sanitize(nameInput.value.trim());
        const email = DOMPurify.sanitize(emailInput.value.trim());
        console.log('Name entered:', name);
        console.log('Email entered:', email);
        
        if (name && email) {
            try {
                // Check rate limiting
                if (isRateLimited(email)) {
                    throw new Error('Too many attempts. Please try again after 100 minutes.');
                }

                // Remove template literals and sanitize name
                let sanitizedName = name.replace(/{{.*?}}/g, '')  // Remove template literals
                                     .replace(/[^a-zA-Z\s]/g, '') // Keep only letters and spaces
                                     .trim();                     // Remove extra spaces

                // Strong input validation
                if (sanitizedName.length < 3 || sanitizedName.length > 15) {
                    throw new Error('Name must be between 3 and 15 characters');
                }

                if (!/^[a-zA-Z\s]+$/.test(sanitizedName)) {
                    throw new Error('Name can only contain letters and spaces');
                }

                // Sanitize email
                let sanitizedEmail = email.replace(/{{.*?}}/g, '')  // Remove template literals
                                        .replace(/[^a-zA-Z0-9@._-]/g, '') // Keep only valid email characters
                                        .trim();                     // Remove extra spaces

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(sanitizedEmail)) {
                    throw new Error('Please enter a valid email address');
                }

                if (sanitizedEmail.length > 30) {
                    throw new Error('Email address is too long');
                }

                console.log('Attempting to insert data into Database...');
                
                // Insert data into Supabase with sanitized values
                const { data, error } = await supabase
                    .from('subscribers')
                    .insert([
                        { name: sanitizedName, email: sanitizedEmail }
                    ])
                    .select();
                
                if (error) {
                    console.error('Supabase error:', error);
                    if (error.code === '23505') { // Unique violation
                        throw new Error('This email is already registered');
                    }
                    throw error;
                }
                
                console.log('Data successfully inserted:', data);
                
                // Show success message
                notification.textContent = DOMPurify.sanitize('Thank you! We will notify you when we go live.');
                notification.style.display = 'block';
                notification.className = 'notification success';
                
                // Hide form
                emailForm.style.display = 'none';
                
                // Clear inputs
                nameInput.value = '';
                emailInput.value = '';
            } catch (error) {
                console.error('Error inserting data:', error);
                notification.textContent = DOMPurify.sanitize(error.message || 'Sorry, there was an error. Please try again.');
                notification.style.display = 'block';
                notification.className = 'notification error';
            }
        } else {
            // Show error message
            notification.textContent = DOMPurify.sanitize('Please enter both name and email.');
            notification.style.display = 'block';
            notification.className = 'notification error';
        }
    });
}); 