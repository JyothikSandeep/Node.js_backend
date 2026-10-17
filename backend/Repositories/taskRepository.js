const taskrepository=require('../Services/data');

function createTask(taskData){

     if(typeof taskData!=='string' || taskData.trim()===''){
        throw new Error('Task data must be a non-empty string');
    }

    return taskrepository.createTask(taskData);
}

function getAllTasks(){
    return taskrepository.getAllTasks();
}

module.exports={
    createTask,
    getAllTasks
}