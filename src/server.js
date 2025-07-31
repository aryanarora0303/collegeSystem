const express = require("express");
const app = express();
app.use(express.json());

// In-memory "database"
let students = [];
let courses = [];
let instructors = [];

let studentId = 1,
    courseId = 1,
    instructorId = 1;

function now() {
    return new Date().toISOString();
}

// --- Students CRUD ---
app.get("/students", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let total = students.length;
    let start = (page - 1) * limit;
    let end = start + limit;
    let data = students.slice(start, end);
    res.json({
        data,
        pagination: { page, limit, total },
    });
});
app.get("/students/:id", (req, res) => {
    const s = students.find((stu) => stu.id == req.params.id);
    s ? res.json(s) : res.status(404).json({ error: "Student not found" });
});
app.post("/students", (req, res) => {
    let courseIds = Array.isArray(req.body.courseIds) ? req.body.courseIds : [];
    // Validate courseIds
    for (const cid of courseIds) {
        if (!courses.find((c) => c.id == cid)) {
            return res.status(400).json({ error: `Invalid courseId: ${cid}` });
        }
    }
    const student = {
        id: studentId++,
        name: req.body.name,
        age: req.body.age,
        phone: req.body.phone,
        email: req.body.email,
        courseIds,
        created_at: now(),
        updated_at: now(),
    };
    students.push(student);
    res.status(201).json(student);
});
app.put("/students/:id", (req, res) => {
    const s = students.find((stu) => stu.id == req.params.id);
    if (!s) return res.status(404).json({ error: "Student not found" });
    if (Array.isArray(req.body.courseIds)) {
        for (const cid of req.body.courseIds) {
            if (!courses.find((c) => c.id == cid)) {
                return res.status(400).json({ error: `Invalid courseId: ${cid}` });
            }
        }
        s.courseIds = req.body.courseIds;
    }
    s.name = req.body.name ?? s.name;
    s.age = req.body.age ?? s.age;
    s.phone = req.body.phone ?? s.phone;
    s.email = req.body.email ?? s.email;
    s.updated_at = now();
    res.json(s);
});
app.delete("/students/:id", (req, res) => {
    students = students.filter((stu) => stu.id != req.params.id);
    // Remove student from courses
    courses.forEach((c) => (c.studentIds = c.studentIds.filter((sid) => sid != req.params.id)));
    res.sendStatus(204);
});

// --- Courses CRUD ---
app.get("/courses", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let total = courses.length;
    let start = (page - 1) * limit;
    let end = start + limit;
    let data = courses.slice(start, end);
    res.json({
        data,
        pagination: { page, limit, total },
    });
});
app.get("/courses/:id", (req, res) => {
    const c = courses.find((crs) => crs.id == req.params.id);
    c ? res.json(c) : res.status(404).json({ error: "Course not found" });
});
app.post("/courses", (req, res) => {
    let studentIds = Array.isArray(req.body.studentIds) ? req.body.studentIds : [];
    let instructorId = req.body.instructorId ?? null;
    // Validate studentIds
    for (const sid of studentIds) {
        if (!students.find((s) => s.id == sid)) {
            return res.status(400).json({ error: `Invalid studentId: ${sid}` });
        }
    }
    // Validate instructorId
    if (instructorId !== null && !instructors.find((i) => i.id == instructorId)) {
        return res.status(400).json({ error: `Invalid instructorId: ${instructorId}` });
    }
    const course = {
        id: courseId++,
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        studentIds,
        instructorId,
        created_at: now(),
        updated_at: now(),
    };
    courses.push(course);
    // Sync student.courseIds
    for (const sid of studentIds) {
        const stu = students.find((s) => s.id == sid);
        if (stu && !stu.courseIds.includes(course.id)) {
            stu.courseIds.push(course.id);
        }
    }
    res.status(201).json(course);
});
app.put("/courses/:id", (req, res) => {
    const c = courses.find((crs) => crs.id == req.params.id);
    if (!c) return res.status(404).json({ error: "Course not found" });
    if (Array.isArray(req.body.studentIds)) {
        for (const sid of req.body.studentIds) {
            if (!students.find((s) => s.id == sid)) {
                return res.status(400).json({ error: `Invalid studentId: ${sid}` });
            }
        }
        // Remove this course from all students not in new list
        students.forEach((stu) => {
            if (stu.courseIds.includes(c.id) && !req.body.studentIds.includes(stu.id)) {
                stu.courseIds = stu.courseIds.filter((cid) => cid != c.id);
            }
        });
        // Add this course to all students in new list
        req.body.studentIds.forEach((sid) => {
            const stu = students.find((s) => s.id == sid);
            if (stu && !stu.courseIds.includes(c.id)) {
                stu.courseIds.push(c.id);
            }
        });
        c.studentIds = req.body.studentIds;
    }
    if (req.body.instructorId !== undefined) {
        if (req.body.instructorId !== null && !instructors.find((i) => i.id == req.body.instructorId)) {
            return res.status(400).json({ error: `Invalid instructorId: ${req.body.instructorId}` });
        }
        c.instructorId = req.body.instructorId;
    }
    c.name = req.body.name ?? c.name;
    c.code = req.body.code ?? c.code;
    c.description = req.body.description ?? c.description;
    c.updated_at = now();
    res.json(c);
});
app.delete("/courses/:id", (req, res) => {
    courses = courses.filter((crs) => crs.id != req.params.id);
    // Remove course from students
    students.forEach((s) => (s.courseIds = s.courseIds.filter((cid) => cid != req.params.id)));
    res.sendStatus(204);
});

// --- Instructors CRUD ---
app.get("/instructors", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let total = instructors.length;
    let start = (page - 1) * limit;
    let end = start + limit;
    let data = instructors.slice(start, end);
    res.json({
        data,
        pagination: { page, limit, total },
    });
});
app.get("/instructors/:id", (req, res) => {
    const i = instructors.find((ins) => ins.id == req.params.id);
    i ? res.json(i) : res.status(404).json({ error: "Instructor not found" });
});
app.post("/instructors", (req, res) => {
    let courseIds = Array.isArray(req.body.courseIds) ? req.body.courseIds : [];
    // Validate courseIds
    for (const cid of courseIds) {
        if (!courses.find((c) => c.id == cid)) {
            return res.status(400).json({ error: `Invalid courseId: ${cid}` });
        }
    }
    const instructor = {
        id: instructorId++,
        name: req.body.name,
        department: req.body.department,
        email: req.body.email,
        phone: req.body.phone,
        courseIds,
        created_at: now(),
        updated_at: now(),
    };
    instructors.push(instructor);
    res.status(201).json(instructor);
});
app.put("/instructors/:id", (req, res) => {
    const i = instructors.find((ins) => ins.id == req.params.id);
    if (!i) return res.status(404).json({ error: "Instructor not found" });
    if (Array.isArray(req.body.courseIds)) {
        for (const cid of req.body.courseIds) {
            if (!courses.find((c) => c.id == cid)) {
                return res.status(400).json({ error: `Invalid courseId: ${cid}` });
            }
        }
        i.courseIds = req.body.courseIds;
    }
    i.name = req.body.name ?? i.name;
    i.department = req.body.department ?? i.department;
    i.email = req.body.email ?? i.email;
    i.phone = req.body.phone ?? i.phone;
    i.updated_at = now();
    res.json(i);
});
app.delete("/instructors/:id", (req, res) => {
    instructors = instructors.filter((ins) => ins.id != req.params.id);
    // Remove instructor from courses
    courses.forEach((c) => {
        if (c.instructorId == req.params.id) c.instructorId = null;
    });
    res.sendStatus(204);
});

// --- Relationships ---
// Enroll student in course
app.post("/students/:sid/courses/:cid", (req, res) => {
    const s = students.find((stu) => stu.id == req.params.sid);
    const c = courses.find((crs) => crs.id == req.params.cid);
    if (!s || !c) return res.status(404).json({ error: "Student or Course not found" });
    if (!s.courseIds.includes(c.id)) s.courseIds.push(c.id);
    if (!c.studentIds.includes(s.id)) c.studentIds.push(s.id);
    res.json({ student: s, course: c });
});
// Remove student from course
app.delete("/students/:sid/courses/:cid", (req, res) => {
    const s = students.find((stu) => stu.id == req.params.sid);
    const c = courses.find((crs) => crs.id == req.params.cid);
    if (!s || !c) return res.status(404).json({ error: "Student or Course not found" });
    s.courseIds = s.courseIds.filter((cid) => cid != c.id);
    c.studentIds = c.studentIds.filter((sid) => sid != s.id);
    res.sendStatus(204);
});
// Assign instructor to course
app.post("/courses/:cid/instructor/:iid", (req, res) => {
    const c = courses.find((crs) => crs.id == req.params.cid);
    const i = instructors.find((ins) => ins.id == req.params.iid);
    if (!c || !i) return res.status(404).json({ error: "Course or Instructor not found" });
    if (c.instructorId && c.instructorId != i.id) {
        // Remove course from previous instructor
        const prev = instructors.find((ins) => ins.id == c.instructorId);
        if (prev) prev.courseIds = prev.courseIds.filter((cid) => cid != c.id);
    }
    c.instructorId = i.id;
    if (!i.courseIds.includes(c.id)) i.courseIds.push(c.id);
    res.json({ course: c, instructor: i });
});
// Remove instructor from course
app.delete("/courses/:cid/instructor", (req, res) => {
    const c = courses.find((crs) => crs.id == req.params.cid);
    if (!c) return res.status(404).json({ error: "Course not found" });
    if (c.instructorId) {
        const i = instructors.find((ins) => ins.id == c.instructorId);
        if (i) i.courseIds = i.courseIds.filter((cid) => cid != c.id);
        c.instructorId = null;
    }
    res.sendStatus(204);
});

app.listen(3157, () => console.log("College system demo running on http://localhost:3157"));
