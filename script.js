// Student data
let students = JSON.parse(localStorage.getItem("students")) || [];

// Set today's date
const today = new Date().toISOString().split("T")[0];
document.getElementById("attendanceDate").value = today;


// Add Student
document.getElementById("studentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const roll = document.getElementById("rollNumber").value.trim();
    const course = document.getElementById("course").value.trim();

    // Check duplicate roll number
    if (students.some(student => student.roll === roll)) {
        alert("A student with this roll number already exists!");
        return;
    }

    const student = {
        id: Date.now(),
        name: name,
        roll: roll,
        course: course,
        present: 0,
        absent: 0,
        attendance: {}
    };

    students.push(student);

    saveData();
    displayStudents();

    this.reset();
});


// Save data
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
}


// Display Students
function displayStudents() {

    const table = document.getElementById("studentTable");
    const searchValue =
        document.getElementById("searchInput").value.toLowerCase();

    const selectedDate =
        document.getElementById("attendanceDate").value;

    table.innerHTML = "";

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchValue) ||
        student.roll.toLowerCase().includes(searchValue) ||
        student.course.toLowerCase().includes(searchValue)
    );

    filteredStudents.forEach(student => {

        const totalClasses = student.present + student.absent;

        let percentage = totalClasses === 0
            ? 0
            : (student.present / totalClasses) * 100;

        percentage = percentage.toFixed(1);

        let percentageClass = "";

        if (percentage >= 75) {
            percentageClass = "good";
        } else if (percentage >= 60) {
            percentageClass = "warning";
        } else {
            percentageClass = "danger";
        }

        let todayStatus = student.attendance[selectedDate];

        let statusText = "Not Marked";
        let statusClass = "status-not-marked";

        if (todayStatus === "Present") {
            statusText = "Present";
            statusClass = "status-present";
        }

        if (todayStatus === "Absent") {
            statusText = "Absent";
            statusClass = "status-absent";
        }

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.roll}</td>

            <td>${student.name}</td>

            <td>${student.course}</td>

            <td>${student.present}</td>

            <td>${student.absent}</td>

            <td>${totalClasses}</td>

            <td class="${percentageClass}">
                ${percentage}%
            </td>

            <td class="${statusClass}">
                ${statusText}
            </td>

            <td>

                <button class="present-btn"
                    onclick="markAttendance(${student.id}, 'Present')">
                    Present
                </button>

                <button class="absent-btn"
                    onclick="markAttendance(${student.id}, 'Absent')">
                    Absent
                </button>

                <button class="edit-btn"
                    onclick="editStudent(${student.id})">
                    Edit
                </button>

                <button class="delete-btn"
                    onclick="deleteStudent(${student.id})">
                    Delete
                </button>

            </td>
        `;

        table.appendChild(row);
    });

    updateDashboard();
}


// Mark Attendance
function markAttendance(id, status) {

    const date =
        document.getElementById("attendanceDate").value;

    if (!date) {
        alert("Please select a date.");
        return;
    }

    const student = students.find(s => s.id === id);

    if (!student) return;

    // Create attendance object if missing
    if (!student.attendance) {
        student.attendance = {};
    }

    const oldStatus = student.attendance[date];

    // If same status is clicked, do nothing
    if (oldStatus === status) {
        return;
    }

    // Remove previous attendance count
    if (oldStatus === "Present") {
        student.present--;
    }

    if (oldStatus === "Absent") {
        student.absent--;
    }

    // Add new attendance count
    if (status === "Present") {
        student.present++;
    }

    if (status === "Absent") {
        student.absent++;
    }

    student.attendance[date] = status;

    saveData();
    displayStudents();
}


// Delete Student
function deleteStudent(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this student?");

    if (!confirmDelete) return;

    students = students.filter(student => student.id !== id);

    saveData();
    displayStudents();
}


// Edit Student
function editStudent(id) {

    const student = students.find(s => s.id === id);

    if (!student) return;

    const newName =
        prompt("Enter student name:", student.name);

    if (newName === null) return;

    const newRoll =
        prompt("Enter roll number:", student.roll);

    if (newRoll === null) return;

    const newCourse =
        prompt("Enter course / branch:", student.course);

    if (newCourse === null) return;

    student.name = newName.trim();
    student.roll = newRoll.trim();
    student.course = newCourse.trim();

    saveData();
    displayStudents();
}


// Search
document.getElementById("searchInput")
    .addEventListener("input", displayStudents);


// Date change
document.getElementById("attendanceDate")
    .addEventListener("change", displayStudents);


// Dashboard
function updateDashboard() {

    const totalStudents = students.length;

    const selectedDate =
        document.getElementById("attendanceDate").value;

    let presentToday = 0;
    let absentToday = 0;

    students.forEach(student => {

        if (student.attendance &&
            student.attendance[selectedDate] === "Present") {
            presentToday++;
        }

        if (student.attendance &&
            student.attendance[selectedDate] === "Absent") {
            absentToday++;
        }
    });

    let totalPercentage = 0;

    if (totalStudents > 0) {

        students.forEach(student => {

            const total =
                student.present + student.absent;

            if (total > 0) {
                totalPercentage +=
                    (student.present / total) * 100;
            }
        });

        totalPercentage =
            totalPercentage / totalStudents;
    }

    document.getElementById("totalStudents")
        .textContent = totalStudents;

    document.getElementById("presentToday")
        .textContent = presentToday;

    document.getElementById("absentToday")
        .textContent = absentToday;

    document.getElementById("averageAttendance")
        .textContent =
        totalPercentage.toFixed(1) + "%";
}


// Initial display
displayStudents();