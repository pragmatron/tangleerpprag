const resources = [
    { name: "Resource A", capacity: 5 },
    { name: "Resource B", capacity: 3 },
    { name: "Resource C", capacity: 4 }
];

const operations = [
    { task: "Task 1", workload: 2 },
    { task: "Task 2", workload: 1 },
    { task: "Task 3", workload: 3 },
    { task: "Task 4", workload: 2 }
];

function autoAssignOperations(resources, operations) {
    const assignments = [];

    operations.forEach(operation => {
        for(let i = 0; i < resources.length; i++) {
            if(resources[i].capacity >= operation.workload) {
                assignments.push({ resource: resources[i].name, task: operation.task });
                resources[i].capacity -= operation.workload;
                break; // Operation assigned, break out of the loop
            }
        }
    });

    return assignments;
}

const schedule = autoAssignOperations(resources, operations);
console.log(schedule);
