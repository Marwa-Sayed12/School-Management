//__________________________________________________________Pakages_______________________________________________________
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');


//____________________________________________________Port_____________________________________________________________
const app = express();
const PORT = process.env.PORT || 3344;


//______________________________________________________config.env file _____________________________________________
 dotenv.config({ path: './config.env' });


//_______________________________________________________to connect with frontend_____________________________________
 app.use(express.json());
app.use(express.static(`${__dirname}/views`));


//__________________________________________________________Middleware_____________________________________________________
app.use(cors());
app.use(bodyParser.json());

//______________________________________________________Database connection setup_______________________________________
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'DB-PASS', 
    database: 'school_management'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

//________________________________________________________________________SchoolControllers_________________________________________
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;
    
    // Input validation
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding school', error: err });
        }
        res.status(201).json({ message: 'School added successfully', id: result.insertId });
    });
});

// List Schools API
app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    // Input validation
    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const sql = 'SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance FROM schools HAVING distance < 10000 ORDER BY distance';
    db.query(sql, [latitude, longitude, latitude], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching schools', error: err });
        }
        res.status(200).json(results);
    });
});

//______________________________________________________________Server listen_______________________________________
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
