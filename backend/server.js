const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const productionDomain = process.env.PRODUCTION_DOMAIN || 'http://localhost:3000';

app.use(cors({
    origin: productionDomain,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
if (isProduction) {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}


mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/To_Do");
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const to_do_user = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
to_do_user.pre('save', async function (next) {
    // 'this' refers to the document being saved
    // Check if the password field has been modified (or if it's a new user)
    if (!this.isModified('password')) return next(); // If the password isn't modified, skip hashing

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt for hashing
        this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
        next(); // Call the next middleware in the stack
    } catch (err) {
        next(err); // Pass the error to the next middleware for handling
    }
});
const taskSchema = new mongoose.Schema({
    task: { type: String, required: true },
    dateAdded: {
        type: String,
        default: () => new Date().toLocaleDateString('en-US'),
    },
    timeAdded: {
        type: String,
        default: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    },
    finishDate: {
        type: String,
        default: () => new Date().toLocaleDateString('en-US'),
        required: true,
    },
    finishTime: {
        type: String,
        default: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        required: true,
    },
    completed: { type: Boolean, default: false },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium',
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'To_Do_User', required: true },
});
const To_Do_User = mongoose.model("To_Do_User", to_do_user);
const Task = mongoose.model('Task', taskSchema);
const JWT_SECRET = process.env.JWT_SECRET;


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: 'Too many login attempts, please try again later.',
});

app.post('/signup', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send("Invalid email format");
        }

        const existingUser = await To_Do_User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists!");
        }

        const newUser = new To_Do_User({
            email: email,
            password: password
        });
        await newUser.save();
        res.status(201).send('User created');
    }
    catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Server error');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await To_Do_User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict'
        });

        res.status(200).json({ success: true, message: 'Logged in successfully' });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false, // Set to true if using HTTPS
        sameSite: 'strict'
    });
    return res.status(200).send('Logged out successfully');
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: 'Access denied, no token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });

        req.userId = decoded.userId;  // Save userId in the request object for later use
        next();  // Proceed to the next middleware or route handler
    });
};

app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).send('Access granted');
});


app.get('/api/user/email', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;  // Get userId from JWT token

        // Fetch the user by ID
        To_Do_User.findById(userId).then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Send user email as JSON
            return res.json({ email: user.email });
        }).catch(err => {
            return res.status(500).json({ message: 'Error retrieving user', error: err.message });
        });
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token', error: error.message });
    }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    const { task, finishDate, finishTime, priority, completed } = req.body;

    if (!task || !finishDate || !finishTime) {
        return res.status(400).json({ message: 'Task, finish date, and finish time are required.' });
    }

    try {
        // Create a new task with the logged-in user's ID
        const newTask = new Task({
            task,
            finishDate,
            finishTime,
            priority: priority || 'Medium',  // Default to 'Medium' priority if not specified
            completed: completed || false,
            user: req.userId,  // Asres.cosociate task with logged-in user
        });

        // Save the task to the database
        const savedTask = await newTask.save();

        // Send the saved task as a response
        res.status(201).json(savedTask);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Failed to create task', error: err.message });
    }
});
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.userId });
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ message: 'Error fetching tasks' });
    }
});
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { completed } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { completed },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task completion status' });
    }
});
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task version' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
