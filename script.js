
const $ = (selector) => document.querySelector(selector);

const exerciseLibrary = {
    push: [
        { name: "Incline Dumbbell Press", sets: 3, reps: "8–12", rest: 90 },
        { name: "Machine Chest Press", sets: 3, reps: "8–12", rest: 90 },
        { name: "Seated Shoulder Press", sets: 3, reps: "8–12", rest: 90 },
        { name: "Dumbbell Lateral Raise", sets: 3, reps: "12–15", rest: 60 },
        { name: "Cable Triceps Pushdown", sets: 3, reps: "10–15", rest: 60 }
    ],
    pull: [
        { name: "Lat Pulldown", sets: 3, reps: "8–12", rest: 90 },
        { name: "Seated Cable Row", sets: 3, reps: "8–12", rest: 90 },
        { name: "Face Pull", sets: 3, reps: "12–15", rest: 60 },
        { name: "Dumbbell Biceps Curl", sets: 3, reps: "10–12", rest: 60 },
        { name: "Hammer Curl", sets: 2, reps: "10–12", rest: 60 }
    ],
    legs: [
        { name: "Goblet Squat", sets: 3, reps: "8–12", rest: 120 },
        { name: "Leg Press", sets: 3, reps: "10–12", rest: 120 },
        { name: "Seated Leg Curl", sets: 3, reps: "10–15", rest: 90 },
        { name: "Leg Extension", sets: 3, reps: "10–15", rest: 60 },
        { name: "Standing Calf Raise", sets: 3, reps: "12–15", rest: 60 }
    ],
    upper: [
        { name: "Machine Chest Press", sets: 3, reps: "8–12", rest: 90 },
        { name: "Lat Pulldown", sets: 3, reps: "8–12", rest: 90 },
        { name: "Seated Cable Row", sets: 3, reps: "8–12", rest: 90 },
        { name: "Dumbbell Lateral Raise", sets: 3, reps: "12–15", rest: 60 },
        { name: "Cable Triceps Pushdown", sets: 2, reps: "10–15", rest: 60 }
    ],
    lower: [
        { name: "Leg Press", sets: 3, reps: "8–12", rest: 120 },
        { name: "Goblet Squat", sets: 3, reps: "8–12", rest: 120 },
        { name: "Seated Leg Curl", sets: 3, reps: "10–15", rest: 90 },
        { name: "Leg Extension", sets: 3, reps: "10–15", rest: 60 },
        { name: "Seated Calf Raise", sets: 3, reps: "12–15", rest: 60 }
    ],
    full: [
        { name: "Goblet Squat", sets: 3, reps: "8–12", rest: 120 },
        { name: "Machine Chest Press", sets: 3, reps: "8–12", rest: 90 },
        { name: "Lat Pulldown", sets: 3, reps: "8–12", rest: 90 },
        { name: "Seated Leg Curl", sets: 2, reps: "10–15", rest: 90 },
        { name: "Dumbbell Biceps Curl", sets: 2, reps: "10–12", rest: 60 }
    ],
    core: [
        { name: "Dead Bug", sets: 3, reps: "8–12 per side", rest: 45 },
        { name: "Plank", sets: 3, reps: "20–45 sec", rest: 60 },
        { name: "Bird Dog", sets: 3, reps: "8–12 per side", rest: 45 },
        { name: "Reverse Crunch", sets: 3, reps: "10–15", rest: 60 }
    ]
};

const focusNames = {
    push: "Push Day",
    pull: "Pull Day",
    legs: "Leg Day",
    upper: "Upper Body",
    lower: "Lower Body",
    full: "Full Body",
    core: "Core & Abs"
};

const levelNames = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced"
};

let currentWorkout = [];
let completedExercises = new Set();
let completedWorkouts = 0;

let timerDuration = 90;
let timerRemaining = 90;
let timerInterval = null;
let timerEndTime = null;

// Safely load saved preferences and progress.
function loadSavedData() {
    try {
        const saved = JSON.parse(localStorage.getItem("befitnow-data") || "{}");

        if (saved.theme === "light") {
            document.body.classList.add("light-mode");
        }

        completedWorkouts = Number.isInteger(saved.completedWorkouts)
            ? Math.max(0, saved.completedWorkouts)
            : 0;

        const savedDay = saved.day;
        const savedFocus = saved.focus;
        const savedLevel = saved.level;

        if (savedDay && $("#trainingDay").querySelector(`option[value="${savedDay}"]`)) {
            $("#trainingDay").value = savedDay;
        }

        if (savedFocus && exerciseLibrary[savedFocus]) {
            $("#workoutFocus").value = savedFocus;
        }

        if (savedLevel && levelNames[savedLevel]) {
            $("#trainingLevel").value = savedLevel;
        }
    } catch (error) {
        console.warn("Saved preferences could not be loaded.", error);
    }
}

function saveData() {
    try {
        localStorage.setItem("befitnow-data", JSON.stringify({
            theme: document.body.classList.contains("light-mode") ? "light" : "dark",
            completedWorkouts,
            day: $("#trainingDay").value,
            focus: $("#workoutFocus").value,
            level: $("#trainingLevel").value
        }));
    } catch (error) {
        console.warn("Preferences could not be saved.", error);
    }
}

function shuffle(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function generateWorkout() {
    const focus = $("#workoutFocus").value;
    const level = $("#trainingLevel").value;
    const day = $("#trainingDay").value;

    // Beginner plans use fewer exercises and sets.
    const exerciseLimit = level === "beginner" ? 4 : 5;

    currentWorkout = shuffle(exerciseLibrary[focus])
        .slice(0, exerciseLimit)
        .map(exercise => ({
            ...exercise,
            sets: level === "beginner"
                ? Math.min(exercise.sets, 2)
                : level === "advanced"
                    ? Math.min(exercise.sets + 1, 4)
                    : exercise.sets
        }));

    completedExercises.clear();

    $("#workoutTitle").innerHTML =
        `${focusNames[focus]} <span>Mission</span>`;

    $("#workoutDayLabel").textContent = day.toUpperCase();

    $("#plannerMessage").textContent =
        `${levelNames[level]} ${focusNames[focus]} plan generated for ${day}.`;

    renderExercises();
    updateProgress();
    saveData();
}

function renderExercises() {
    const list = $("#exerciseList");
    list.replaceChildren();

    currentWorkout.forEach((exercise, index) => {
        const card = document.createElement("article");
        card.className = "exercise-card";

        if (completedExercises.has(index)) {
            card.classList.add("completed");
        }

        const number = document.createElement("div");
        number.className = "exercise-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const info = document.createElement("div");
        info.className = "exercise-info";

        const name = document.createElement("h3");
        name.textContent = exercise.name;

        const description = document.createElement("p");
        description.textContent =
            `${exercise.sets} sets × ${exercise.reps} reps`;

        const meta = document.createElement("p");
        meta.className = "exercise-meta";
        meta.textContent = `REST: ${exercise.rest} SEC`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = completedExercises.has(index);
        checkbox.setAttribute("aria-label", `Complete ${exercise.name}`);

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                completedExercises.add(index);
            } else {
                completedExercises.delete(index);
            }

            card.classList.toggle("completed", checkbox.checked);
            updateProgress();
        });

        info.append(name, description, meta);
        card.append(number, info, checkbox);
        list.append(card);
    });

    $("#exerciseCount").textContent = currentWorkout.length;
}

function updateProgress() {
    const total = currentWorkout.length;
    const done = completedExercises.size;
    const percentage = total ? Math.round((done / total) * 100) : 0;

    $("#progressText").textContent = `${percentage}%`;
    $("#progressBar").style.width = `${percentage}%`;
    $("#completedCount").textContent = completedWorkouts;

    if (total > 0 && done === total) {
        $("#plannerMessage").textContent =
            "Mission complete! Great work. Generate another plan when you're ready.";

        // Count each completed plan only once.
        if (!currentWorkout.completedCounted) {
            currentWorkout.completedCounted = true;
            completedWorkouts++;
            saveData();
            $("#completedCount").textContent = completedWorkouts;
        }
    } else if (currentWorkout.completedCounted) {
        // Reopening an exercise resets the completion state for this plan.
        currentWorkout.completedCounted = false;
        completedWorkouts = Math.max(0, completedWorkouts - 1);
        saveData();
        $("#completedCount").textContent = completedWorkouts;
    }
}

// Dark/light theme toggle.
function updateThemeButton() {
    const isLight = document.body.classList.contains("light-mode");
    $("#themeToggle").textContent = isLight ? "🌙 Dark" : "☀️ Light";
}

$("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    updateThemeButton();
    saveData();
});

// Workout generation.
$("#generateBtn").addEventListener("click", generateWorkout);

// Save changes to the selected planner settings.
["trainingDay", "workoutFocus", "trainingLevel"].forEach(id => {
    $(`#${id}`).addEventListener("change", saveData);
});

// Rest timer.
function updateTimerDisplay() {
    const minutes = Math.floor(timerRemaining / 60);
    const seconds = timerRemaining % 60;

    $("#timerDisplay").textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerEndTime = null;
}

function startTimer() {
    if (timerInterval !== null) {
        stopTimer();
        $("#startTimer").textContent = "▶ RESUME";
        $("#timerMessage").textContent = "Timer paused.";
        return;
    }

    if (timerRemaining <= 0) {
        timerRemaining = timerDuration;
    }

    timerEndTime = Date.now() + timerRemaining * 1000;
    $("#startTimer").textContent = "Ⅱ PAUSE";
    $("#timerMessage").textContent = "Rest and get ready for your next set.";

    timerInterval = setInterval(() => {
        timerRemaining = Math.max(
            0,
            Math.ceil((timerEndTime - Date.now()) / 1000)
        );

        updateTimerDisplay();

        if (timerRemaining <= 0) {
            stopTimer();
            $("#startTimer").textContent = "▶ START";
            $("#timerMessage").textContent = "Rest complete! Time for your next set.";
            $("#timerDisplay").textContent = "00:00";
        }
    }, 200);
}

$("#startTimer").addEventListener("click", startTimer);

$("#resetTimer").addEventListener("click", () => {
    stopTimer();
    timerRemaining = timerDuration;
    updateTimerDisplay();
    $("#startTimer").textContent = "▶ START";
    $("#timerMessage").textContent = "Timer reset. Ready when you are.";
});

document.querySelectorAll(".preset-btn").forEach(button => {
    button.addEventListener("click", () => {
        stopTimer();

        timerDuration = Number(button.dataset.seconds);
        timerRemaining = timerDuration;

        document.querySelectorAll(".preset-btn").forEach(preset => {
            preset.classList.toggle("active", preset === button);
        });

        $("#startTimer").textContent = "▶ START";
        $("#timerMessage").textContent = "Rest duration updated.";
        updateTimerDisplay();
    });
});

// Export the current workout to an iCalendar (.ics) file.
function escapeICalendar(text) {
    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function toICalendarDate(date) {
    return date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) + "T" +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
}

function exportCalendar() {
    if (currentWorkout.length === 0) {
        $("#plannerMessage").textContent =
            "Generate a workout before exporting your calendar.";
        return;
    }

    const dayName = $("#trainingDay").value;
    const today = new Date();
    const dayNumbers = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6
    };

    // Find the next occurrence of the selected weekday.
    const eventDate = new Date(today);
    const difference = (dayNumbers[dayName] - today.getDay() + 7) % 7;
    eventDate.setDate(today.getDate() + difference);
    eventDate.setHours(18, 0, 0, 0);

    // If today's selected session time has already passed, schedule next week.
    if (eventDate <= today) {
        eventDate.setDate(eventDate.getDate() + 7);
    }

    const endDate = new Date(eventDate.getTime() + 60 * 60 * 1000);
    const focus = $("#workoutFocus").value;

    const description = currentWorkout.map((exercise, index) =>
        `${index + 1}. ${exercise.name}: ${exercise.sets} sets x ${exercise.reps}`
    ).join("\n");

    const calendar = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BeFitNow//Workout Planner//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:befitnow-${Date.now()}@befitnow.local`,
        `DTSTAMP:${toICalendarDate(new Date())}`,
        `DTSTART:${toICalendarDate(eventDate)}`,
        `DTEND:${toICalendarDate(endDate)}`,
        `SUMMARY:${escapeICalendar(`BeFitNow: ${focusNames[focus]}`)}`,
        `DESCRIPTION:${escapeICalendar(description)}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n") + "\r\n";

    const blob = new Blob([calendar], {
        type: "text/calendar;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "BeFitNow-Workout.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    $("#plannerMessage").textContent =
        "Calendar file exported. Open the .ics file to add your workout to a calendar.";
}

$("#exportBtn").addEventListener("click", exportCalendar);

// Initial setup.
loadSavedData();
updateThemeButton();
$("#year").textContent = new Date().getFullYear();
generateWorkout();
updateTimerDisplay();
