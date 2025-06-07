


// Initialize window variable resourceGroupCapacity, for instance, as an object holding capacity info
window.resourceGroupCapacity = {
    groupA: 50, // Example capacity of group A
    groupB: 30, // Example capacity of group B
    groupC: 20  // Example capacity of group C
};

// Function to move operations based on group capacity
function moveOperations(operations) {
    let groupedOperations = {
        groupA: [],
        groupB: [],
        groupC: []
    };

    operations.forEach(operation => {
        if (groupedOperations.groupA.length < window.resourceGroupCapacity.groupA) {
            groupedOperations.groupA.push(operation);
        } else if (groupedOperations.groupB.length < window.resourceGroupCapacity.groupB) {
            groupedOperations.groupB.push(operation);
        } else if (groupedOperations.groupC.length < window.resourceGroupCapacity.groupC) {
            groupedOperations.groupC.push(operation);
        } else {
            console.error("No available capacity in any group for operation:", operation);
        }
    });

    return groupedOperations;
}

// Usage Example
let operations = [/* array of operations */];
let allocatedOperations = moveOperations(operations);
console.log(allocatedOperations);











