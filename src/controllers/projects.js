import { body, validationResult } from 'express-validator';

import {
    getUpcomingProjects,
    getProjectDetails,
    createProject,
    updateProject,
    addVolunteerToProject,
    removeVolunteerFromProject,
    isUserVolunteeringForProject
} from '../models/projects.js';

import {
    getCategoriesByProjectId
} from '../models/categories.js';

import { getAllOrganizations } from '../models/organizations.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isInt().withMessage('Organization must be a valid integer')
];

const showProjectsPage = async (req, res, next) => {
    try {
        const title = 'Upcoming Service Projects';
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);

        res.render('projects', { 
            title, 
            projects,
            flash: req.flash() 
        });
    } catch (err) {
        next(err);
    }
};

const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);
        const categories = await getCategoriesByProjectId(projectId);
        let isVolunteer = false;

        if (!project) {
            const error = new Error('Project not found');
            error.status = 404;
            return next(error);
        }

        if (req.session && req.session.user) {
            isVolunteer = await isUserVolunteeringForProject(
                projectId,
                req.session.user.user_id
            );
        }

        const title = 'Service Project Details';

        res.render('project', {
            title,
            project,
            categories,
            isVolunteer,
            flash: req.flash()
        });
    } catch (err) {
        next(err);
    }
};

const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';

        res.render('new-project', { title, organizations, flash: req.flash() });
    } catch (err) {
        next(err);
    }
};

const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const projectDetails = await getProjectDetails(projectId);
        const organizations = await getAllOrganizations();

        if (!projectDetails) {
            const error = new Error('Project not found');
            error.status = 404;
            return next(error);
        }

        const title = 'Edit Service Project';
        const formattedDate = projectDetails.date instanceof Date
            ? [
                projectDetails.date.getFullYear(),
                String(projectDetails.date.getMonth() + 1).padStart(2, '0'),
                String(projectDetails.date.getDate()).padStart(2, '0')
            ].join('-')
            : String(projectDetails.date).slice(0, 10);

        res.render('edit-project', {
            title,
            projectDetails: {
                ...projectDetails,
                formattedDate
            },
            organizations,
            flash: req.flash()
        });
    } catch (err) {
        next(err);
    }
};

const processNewProjectForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });

            return res.redirect('/new-project');
        }

        const { title, description, location, date, organizationId } = req.body;

        const newProjectId = await createProject(
            title,
            description,
            location,
            date,
            organizationId
        );

        req.flash('success', 'New service project created successfully!');
        res.redirect('/projects');
    } catch (error) {
        console.error('Error creating new project:', error);
        req.flash('error', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
};

const processEditProjectForm = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });

            return res.redirect('/edit-project/' + req.params.id);
        }

        const projectId = req.params.id;
        const { title, description, location, date, organizationId } = req.body;

        await updateProject(
            projectId,
            title,
            description,
            location,
            date,
            organizationId
        );

        req.flash('success', 'Service project updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

const processVolunteerSignup = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;
        const signedUpProjectId = await addVolunteerToProject(projectId, userId);

        if (signedUpProjectId) {
            req.flash('success', 'You are now volunteering for this project.');
        } else {
            req.flash('info', 'You are already volunteering for this project.');
        }

        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

const processVolunteerRemoval = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;
        const removedProjectId = await removeVolunteerFromProject(projectId, userId);

        if (removedProjectId) {
            req.flash('success', 'You are no longer volunteering for this project.');
        } else {
            req.flash('info', 'You were not volunteering for this project.');
        }

        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

const processDashboardVolunteerRemoval = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.session.user.user_id;
        const removedProjectId = await removeVolunteerFromProject(projectId, userId);

        if (removedProjectId) {
            req.flash('success', 'You are no longer volunteering for this project.');
        } else {
            req.flash('info', 'You were not volunteering for this project.');
        }

        res.redirect('/dashboard');
    } catch (error) {
        next(error);
    }
};

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    showEditProjectForm,
    processNewProjectForm,
    processEditProjectForm,
    processVolunteerSignup,
    processVolunteerRemoval,
    processDashboardVolunteerRemoval,
    projectValidation
};
