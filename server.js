import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';

import { testConnection } from './src/models/db.js';
import { getAllOrganizations } from './src/models/organizations.js';

// Define the the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number the server will listen on
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


/**
  * Configure Express middleware
  */

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find your templates
app.set('views', path.join(__dirname, 'src/views'));


/**
 * Routes
 */
app.get('/', async (req, res) => {
    const title = 'Home';
    res.render('home', { title });
});

app.get('/organizations', async (req, res) => {
    try {
        // 1. Fetch the data array from your model function
        const organizations = await getAllOrganizations();
        
        // 2. CRUCIAL: This satisfies your requirement to print to the console
        console.log("--- Organizations Printed to Terminal Console ---");
        console.log(organizations); 
        console.log("-------------------------------------------------");
          
        const title = 'Our Partner Organizations';
        
        // 3. Pass BOTH variables to EJS so the webpage can read them
        res.render('organizations', { title, organizations }); 
    } catch (error) {
        console.error("Route error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/projects', async (req, res) => {
    const title = 'Service Projects';
    res.render('projects', { title });
});

// To this (to match the other routes and requirements):
app.get('/categories', async (req, res) => {
    const title = 'Service Project Categories';
    res.render('categories', { title });
});


app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server is running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);    
    }   catch (error) {
        console.error('Failed to start server:', error);
    }
});
