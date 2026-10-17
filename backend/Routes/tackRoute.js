const taskController = require('../Controllers/taskController');

const Router = require('express').Router();

Router.post('/tasks', taskController.createTask);
Router.get('/tasks', taskController.getAllTasks);

module.exports = Router;