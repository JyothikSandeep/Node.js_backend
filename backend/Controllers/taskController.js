const taskrepository = require('../Repositories/taskRepository');

async function createTask(req, res) {
    try{
        console.log(req.body);

        const taskData = req.body.data;;
        
        const newTask = taskrepository.createTask(taskData);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }   

}

async function getAllTasks(req, res) {
    try{
        const tasks = taskrepository.getAllTasks();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createTask,
    getAllTasks
};