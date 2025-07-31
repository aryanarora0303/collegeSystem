# College System Demo

This project is a simple Express server that simulates a college system with CRUD functionality for three entities: students, courses, and instructors. The data is stored in memory using arrays, making it easy to test and demonstrate the API without the need for a database.

## Getting Started

To set up and run the server, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd college-system-demo
    ```

2. **Install dependencies:**
   Make sure you have Node.js installed. Then run:

    ```bash
    npm install
    ```

3. **Start the server:**
   You can start the server using the following command:

    ```bash
    npm start
    ```

    The server will run on `http://localhost:3000`.

## API Endpoints

### Request Body Format

#### Students

-   **POST /students** and **PUT /students/:id**
    -   Accepts JSON:
        ```json
        {
            "name": "Student Name"
        }
        ```

#### Courses

-   **POST /courses** and **PUT /courses/:id**
    -   Accepts JSON:
        ```json
        {
            "name": "Course Name"
        }
        ```

#### Instructors

-   **POST /instructors** and **PUT /instructors/:id**
    -   Accepts JSON:
        ```json
        {
            "name": "Instructor Name"
        }
        ```

### Students

-   **GET /students**: Retrieve all students.
-   **POST /students**: Create a new student.
-   **GET /students/:id**: Retrieve a student by ID.
-   **PUT /students/:id**: Update a student by ID.
-   **DELETE /students/:id**: Delete a student by ID.

### Courses

-   **GET /courses**: Retrieve all courses.
-   **POST /courses**: Create a new course.
-   **GET /courses/:id**: Retrieve a course by ID.
-   **PUT /courses/:id**: Update a course by ID.
-   **DELETE /courses/:id**: Delete a course by ID.

### Instructors

-   **GET /instructors**: Retrieve all instructors.
-   **POST /instructors**: Create a new instructor.
-   **GET /instructors/:id**: Retrieve an instructor by ID.
-   **PUT /instructors/:id**: Update an instructor by ID.
-   **DELETE /instructors/:id**: Delete an instructor by ID.

## Example Requests

### Create a Student

```bash
curl -X POST http://localhost:3000/students -H "Content-Type: application/json" -d '{"name": "John Doe", "age": 20}'
```

### Get All Students

```bash
curl -X GET http://localhost:3000/students
```

## License

This project is licensed under the MIT License.
