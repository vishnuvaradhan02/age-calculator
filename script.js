document.addEventListener('DOMContentLoaded', () => {
    const dobInput = document.getElementById('dob');
    const targetDateInput = document.getElementById('targetDate');
    const targetDateGroup = document.getElementById('targetDateGroup');
    const toggle = document.getElementById('compareModeToggle');
    const toggleLabel = document.getElementById('toggleLabel');
    const calcBtn = document.getElementById('calcBtn');
    const resultContainer = document.getElementById('result');
    
    // Elements to update
    const resYears = document.getElementById('resYears');
    const resMonths = document.getElementById('resMonths');
    const resDays = document.getElementById('resDays');
    const resHours = document.getElementById('resHours');
    const resMinutes = document.getElementById('resMinutes');

    let updateInterval;

    // Toggle Mode
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            // Mode: Specific Date
            toggleLabel.innerHTML = 'Calculate against: <strong>Specific Date</strong>';
            targetDateGroup.classList.remove('hidden');
            clearInterval(updateInterval); // Stop auto-update
        } else {
            // Mode: Now
            toggleLabel.innerHTML = 'Calculate against: <strong>NOW</strong>';
            targetDateGroup.classList.add('hidden');
            // If we already have a result, restart the live update
            if (!resultContainer.classList.contains('hidden')) {
                startLiveUpdate();
            }
        }
    });

    calcBtn.addEventListener('click', () => {
        if (!dobInput.value) {
            alert('Please select your Date of Birth.');
            return;
        }
        
        // Show results
        resultContainer.classList.remove('hidden');

        if (!toggle.checked) {
            startLiveUpdate();
        } else {
            calculateAndDisplay();
        }
    });

    function startLiveUpdate() {
        if (updateInterval) clearInterval(updateInterval);
        calculateAndDisplay();
        // Update every 60 seconds to match "minutes" precision, 
        // or every second if we wanted seconds. 
        // Let's do every 30s to be safe on minute rollover.
        updateInterval = setInterval(calculateAndDisplay, 10000); 
    }

    function calculateAndDisplay() {
        const dob = new Date(dobInput.value);
        let end;

        if (toggle.checked) {
            // Custom date
             if (!targetDateInput.value) {
                // heuristic: if empty, default to now or alert? 
                // Let's alert to be clear
                // Actually, let's just default to now if empty but keep logic simple
                // Or better: prompt user
                if (!targetDateInput.value) {
                    // Just use now temp or return?
                    // Let's alert
                     alert('Please select a Target Date.');
                     return;
                }
                end = new Date(targetDateInput.value);
            } else {
                end = new Date(targetDateInput.value);
            }
        } else {
            end = new Date();
        }

        if (isNaN(dob.getTime())) return; 

        // Calculation Logic
        // We want accurate Years, Months, Days, Hours, Minutes
        // Using a sequential approach is best for "Human" age (e.g. Born Jan 1, Target Feb 1 = 1 Month)
        // versus pure milliseconds division.

        let years = end.getFullYear() - dob.getFullYear();
        let months = end.getMonth() - dob.getMonth();
        let days = end.getDate() - dob.getDate();
        let hours = end.getHours() - dob.getHours();
        let minutes = end.getMinutes() - dob.getMinutes();

        // Adjust for negative values by borrowing from larger unit
        
        // Minutes
        if (minutes < 0) {
            minutes += 60;
            hours--;
        }

        // Hours
        if (hours < 0) {
            hours += 24;
            days--;
        }

        // Days
        if (days < 0) {
            // Need to know how many days were in the *previous* month relative to end date
            // Example: End is March 5th, Start is Jan 25th.
            // 1. Years/Months calc...
            // 2. We are at March 5 (end). Previous month is Feb.
            // Borrow days from Feb.
            
            const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0); 
            // 0th day of current month = last day of prev month
            const daysInPrevMonth = prevMonthDate.getDate();
            
            days += daysInPrevMonth;
            months--;
        }

        // Months
        if (months < 0) {
            months += 12;
            years--;
        }

        // Handle Future Date (Negative Age) - optional, but let's just use absolute or show "Not Born Yet"
        // Prompt didn't specify validation logic for unborn, but usually age calculators handle this either by negative or "Not born".
        // Let's just default to 0 if total is negative? 
        // Actually, simple subtraction works for negative too but it's weird to say "-1 years".
        // Let's assume standard usage (DOB < Target).
        // If End < Start, let's swap for calculation and maybe indicate?
        // Or just let it be negative? Let's just show absolute difference or raw values.
        // Let's just safeguard: if end < start, show "Not born yet" or similar?
        // For simplicity, let's just allow the math. If years is negative, it's fine.

        resYears.textContent = years;
        resMonths.textContent = months;
        resDays.textContent = days;
        resHours.textContent = hours;
        resMinutes.textContent = minutes;
    }
});
