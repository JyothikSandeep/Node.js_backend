const task=[]
const task_id=1

function createTask(taskData){

    const newTaks={id:task_id++,data:taskData.trim()};
    task.push(newTaks);
    return newTaks;
}


function getAllTasks(){

    return task;
}

module.exports={
    createTask,
    getAllTasks
}
