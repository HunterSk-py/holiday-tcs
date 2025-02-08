document.addEventListener("DOMContentLoaded", () => {
    generateCalendar();
    document.getElementById("filter-btn").addEventListener("click", fetchAndRenderHolidays);
});

// Function to generate a 2025 calendar
function generateCalendar() {
    const calendarContainer = document.getElementById("calendar");
    calendarContainer.innerHTML = "";

    let months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    for (let month = 0; month < 12; month++) {
        let monthDiv = document.createElement("div");
        monthDiv.className = "month";
        monthDiv.innerHTML = `<h2>${months[month]}</h2>`;

        let daysGrid = document.createElement("div");
        daysGrid.className = "days-grid";

        // Create the weekday header row
        weekdays.forEach(day => {
            let dayHeader = document.createElement("div");
            dayHeader.className = "weekday-header";
            dayHeader.textContent = day;
            daysGrid.appendChild(dayHeader);
        });

        let daysInMonth = new Date(2025, month + 1, 0).getDate();
        let firstDayOfWeek = new Date(2025, month, 1).getDay(); // 0 = Sunday, 6 = Saturday

        // Add empty divs for alignment (if the month doesn't start on Sunday)
        for (let i = 0; i < firstDayOfWeek; i++) {
            let emptyDiv = document.createElement("div");
            emptyDiv.className = "calendar-day empty";
            daysGrid.appendChild(emptyDiv);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            let dateStr = `2025-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let dayDiv = document.createElement("div");
            dayDiv.className = "calendar-day";
            dayDiv.setAttribute("data-date", dateStr);
            dayDiv.textContent = day;

            let dayOfWeek = new Date(dateStr).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                dayDiv.style.backgroundColor = "#FFD700"; // Yellow for weekends
                dayDiv.setAttribute("data-holiday", "yellow");
                dayDiv.setAttribute("title", "Weekend");
            }

            daysGrid.appendChild(dayDiv);
        }

        monthDiv.appendChild(daysGrid);
        calendarContainer.appendChild(monthDiv);
    }
}


async function fetchAndRenderHolidays() {
    let location = document.getElementById("location-input").value;
    if (!location) return alert("Please select a location");

    try {
        let response = await fetch("/holidays");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let holidays = await response.json();
        console.log("Fetched Holidays:", holidays);

        let filteredHolidays = holidays.filter(holiday =>
            holiday.locations.includes(location) || holiday.locations.includes("flex")
        );

        console.log("Filtered Holidays:", filteredHolidays);

        colorHolidays(filteredHolidays, location);
    } catch (error) {
        console.error("Error fetching holidays:", error);
    }
}


function colorHolidays(holidays, location) {
    let calendarCells = document.querySelectorAll(".calendar-day");

    let holidayMap = {}; // Store holiday types and names for each date

    holidays.forEach(holiday => {
        let date = holiday.date;
        let isFlex = holiday.locations.includes("flex");
        let isRegularHoliday = holiday.locations.includes(location);

        if (!holidayMap[date]) {
            holidayMap[date] = { name: holiday.name, isRegularHoliday: false, isFlex: false };
        }

        if (isRegularHoliday) {
            holidayMap[date].isRegularHoliday = true; // Mark as regular holiday
        } else if (isFlex) {
            holidayMap[date].isFlex = true; // Mark as flex holiday
        }
    });

    calendarCells.forEach(cell => {
        let date = cell.getAttribute("data-date");
        if (!date || !holidayMap[date]) return;

        if (holidayMap[date].isRegularHoliday) {
            cell.style.backgroundColor = "#4CAF50"; // Green for location-specific holidays
            cell.setAttribute("data-holiday", "green");
            cell.setAttribute("title", holidayMap[date].name); // Tooltip on hover
        } else if (holidayMap[date].isFlex) {
            cell.style.backgroundColor = "#00BCD4"; // Cyan for Flex holidays
            cell.setAttribute("data-holiday", "cyan");
            cell.setAttribute("title", holidayMap[date].name); // Tooltip on hover
        }

        // 📱 Show holiday name on tap (for mobile users)
        cell.addEventListener("click", () => {
            if (holidayMap[date]) {
                alert(`Holiday: ${holidayMap[date].name}`);
            }
        });
    });
}
