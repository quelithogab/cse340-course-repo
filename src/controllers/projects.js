// Import any needed model functions
import { getCategoriesByProjectId } from '../models/categories.js';

// Define any controller functions
const showProjectsPage = async (req, res) => {
    const title = 'Service Projects';

    res.render('projects', { title });
};

// Service project details page
const showProjectDetailsPage = async (req, res) => {
    const projectId = req.params.id;

    const categories = await getCategoriesByProjectId(projectId);

    const title = 'Project Details';

    res.render('project', { title, categories });
}; 

// Export any controller functions
export { showProjectsPage, showProjectDetailsPage };