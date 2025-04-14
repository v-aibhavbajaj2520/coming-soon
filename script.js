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
    const targetDate = new Date('2024-01-01T00:00:00');
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const comingSoonElement = document.querySelector('.coming-soon');

    function updateCountdown() {
        const now = new Date();
        const timeDifference = targetDate - now;

        if (timeDifference <= 0) {
            comingSoonElement.textContent = 'We Have Arrived!';
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

    updateCountdown();
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

    // Initially hide the form and notification
    emailForm.style.display = 'none';
    notification.style.display = 'none';

    // Show email form when "Get Notified" button is clicked
    notifyBtn.addEventListener('click', () => {
        console.log('Notify button clicked');
        emailForm.style.display = 'flex';
        notifyBtn.style.display = 'none';
    });

    // Handle form submission
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Submit button clicked');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        console.log('Name entered:', name);
        console.log('Email entered:', email);
        
        if (name && email) {
            try {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new Error('Please enter a valid email address');
                }

                console.log('Attempting to insert data into Supabase...');
                
                // Insert data into Supabase
                const { data, error } = await supabase
                    .from('subscribers')
                    .insert([
                        { name: name, email: email }
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
                notification.textContent = 'Thank you! We will notify you when we go live.';
                notification.style.display = 'block';
                notification.className = 'notification success';
                
                // Hide form
                emailForm.style.display = 'none';
                
                // Clear inputs
                nameInput.value = '';
                emailInput.value = '';
            } catch (error) {
                console.error('Error inserting data:', error);
                notification.textContent = error.message || 'Sorry, there was an error. Please try again.';
                notification.style.display = 'block';
                notification.className = 'notification error';
            }
        } else {
            // Show error message
            notification.textContent = 'Please enter both name and email.';
            notification.style.display = 'block';
            notification.className = 'notification error';
        }
    });
}); 