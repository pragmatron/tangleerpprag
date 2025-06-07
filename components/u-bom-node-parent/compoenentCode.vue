<template>
	<div style="height: 100%; overflow: auto" class="bom">
    <div class="controls">
        <label>Quantity: <input type="number"  @input="updateCostingQty" :value="$getGlobalModel('costingQty')" min="1"></label>
    </div>

    <button @click="loadData">Refresh</button>

    <div v-if="parsedData">
        <bom-node :node="parsedData"></bom-node>
    </div>
	</div>
</template>

<script>
	module.exports = {
        components: {
            'bom-node': $getCustomComponent('u-bom-node'),
        },
        props: {
            rowKey: {
                type: String,
                default: null
            }
        },

        data() {
            return {
                jsonInput: '{"name":"Top Assembly","description":"Main Product Assembly","operations":[{"name":"Final Assembly","setupTime":1,"cycleTime":0.5}],"materials":[{"description":"Sub-Component A","quantityPer":2,"childPart":{"name":"Component A","description":"Machined Part","operations":[{"name":"Machine Setup","setupTime":0.5,"cycleTime":0.25}],"materials":[{"description":"Raw Material","quantityPer":1,"childPart":{"name":"Raw Block","description":"Aluminum Block","unitCost":10}}]}}]}',
                parsedData: null,
                costingQty: 1
            };
        },

        mounted() {
            if (!$getGlobalModel('costingQty')) {
                $setGlobalModel('costingQty', 1);
            }
            this.loadData();
        },

        methods: {
            updateCostingQty(val) {
                console.log('val: ', val.target.value);
                $setGlobalModel('costingQty', val.target.value);
            },
            async loadData() {
                const self = this;

                function pickPartFields(part) {
                    return {
                        rowKey: part.rowKey,
                        name: part.name,
                        productLine: part.productLine,
                        description: part.description,
                        materialCost: part.issueUnitCost ? part.issueUnitCost : part.purchasePrice ? part.purchasePrice : part.costperunit ? part.costperunit : 0
                    };
                }

                async function processBOM(partId, partsData, methodMaterials, methodOperations) {
                    const mainPart = partsData.find(p => p.rowKey === partId);
                    if (!mainPart) return null;

                    const snapshot = await self.$dbService
                        .getRef("models/methodMaterials")
                        .orderByChild("parentPart")
                        .equalTo(partId)
                        .once("value");

                    let materialsArray = Object.values(snapshot.val() || {});
                    let materials = materialsArray.filter((f) => f.parentPart != f.part);

                    const snapshotOps = await self.$dbService
                        .getRef("models/methodOperations")
                        .orderByChild("parentPart")
                        .equalTo(partId)
                        .once("value");

                    const operations = Object.values(snapshotOps.val() || {}).map(operation => {
                        const resource = $getGrid('resources').find(r => r.rowKey === operation.resource);
                        return {
                            ...operation,
                            resourceRate: resource ? resource.totalCostPerHour : 0
                        };
                    });

                    const processedMaterials = await Promise.all(materials.map(async material => {
                        const basicMaterial = material;

                        if (material.part) {
                            const childPart = await processBOM(material.part, partsData, methodMaterials, methodOperations);
                            if (childPart) {
                                return {
                                    ...basicMaterial,
                                    childPart,
                                    costingQuantity: material.quantityPer * (childPart.costingQuantity || 1)
                                };
                            }
                        }
                        return basicMaterial;
                    }));

                    const processedOperations = operations.map(operation => {
                        const basicOperation = {
                            name: operation.name,
                            setupTime: operation.setupTime,
                            cycleTime: operation.cycleTime,
                            setupPrice: operation.setupPrice,
                            cyclePrice: operation.cyclePrice,
                            parentPart: operation.parentPart,
                            resource: operation.resource
                        };
                        const totalSetupTime = basicOperation.setupTime || 0;
                        const totalCycleTime = (basicOperation.cycleTime || 0);
                        return {
                            ...basicOperation,
                            totalTime: totalSetupTime + totalCycleTime
                        };
                    });

                    const totalMaterialCost = processedMaterials.reduce((total, material) => {
                        const materialCost = material.unitCost * material.quantityPer;
                        const childPartCost = material.childPart ? material.childPart.totalMaterialCost : 0;
                        return total + materialCost + childPartCost;
                    }, 0);

                    const totalOperationsCost = processedOperations.reduce((total, operation) => {
                        const resource = $getGrid('resources').find(r => r.rowKey === operation.resource);
                        const costPerHour = resource ? resource.totalCostPerHour : 0;
                        const setupCost = (costPerHour || 0) * (operation.setupTime || 0);
                        const cycleCost = (costPerHour || 0) * (operation.cycleTime || 0);
                        return total + setupCost + cycleCost;
                    }, 0);

                    return {
                        ...pickPartFields(mainPart),
                        costingQuantity: 1,
                        materials: processedMaterials,
                        operations: processedOperations,
                        totalMaterialCost,
                        totalOperationsCost,
                        totalCost: totalMaterialCost + totalOperationsCost
                    };
                }

                const snapshot = await self.$dbService
                    .getRef("models/methodMaterials")
                    .orderByChild("parentPart")
                    .equalTo(this.rowKey)
                    .once("value");

                const filteredMats = Object.values(snapshot.val() || {});

                const snapshotOps = await self.$dbService
                    .getRef("models/methodOperations")
                    .orderByChild("parentPart")
                    .equalTo(this.rowKey)
                    .once("value");

                const filteredOps = Object.values(snapshotOps.val() || {});

                const bomStructure = await processBOM(
                    this.rowKey,
                    $getGrid('parts'),
                    filteredMats,
                    filteredOps
                );

                this.parsedData = bomStructure;
                console.log('this.parsedData: ', this.parsedData);
            }
        }
    };
</script>

<style>
.bom .controls { 
    background: #f5f5f5; 
    padding: 15px; 
    margin-bottom: 15px; 
    display: flex; 
    gap: 15px; 
}
.bom input { 
    padding: 8px; 
    width: 100px; 
}
.bom .json-input { 
    width: 100%; 
    height: 100px; 
    margin: 10px 0; 
}
.bom .part { 
    border: 1px solid #ddd; 
    margin: 5px 0; 
    padding: 15px; 
    background: white; 
    color: black;
}
.bom .tree { 
    margin-left: 20px; 
    border-left: 2px solid #eee; 
    padding-left: 15px; 
}
.bom table { 
    width: 100%; 
    border-collapse: collapse; 
    margin: 10px 0; 
    font-size: 0.9em;
}
.bom th, .bom td { 
    padding: 8px; 
    text-align: right; 
    border-bottom: 1px solid #ddd;
    white-space: nowrap;
    color: black;
}
.bom .bom th { 
    background: #f8f9fa;
    position: sticky;
    top: 0;
    z-index: 1;
}
.bom td:first-child { 
    text-align: left; 
}
.bom .ops { 
    background: #5297FF; /* Blue background */
    color: white; /* White text */
    padding: 10px; 
    margin: 5px 0; 
    border-radius: 10px; /* Rounded corners */
}
.bom .mats { 
    background: white; /* White background */
    padding: 10px; 
    margin: 5px 0; 
    color: black;
}
.bom button { 
    padding: 10px 20px; /* Enhanced button style */
    cursor: pointer; 
    background-color: #5297FF; 
    color: white; 
    border: none; 
    border-radius: 5px; 
    font-size: 14px; 
    font-weight: bold; 
    transition: background-color 0.3s ease;
}
.bom button:hover {
    background-color: #407ACC; /* Hover effect */
}
.bom .total { 
    font-weight: bold; 
    color: #28a745; 
}
.bom .direct { 
    color: #0066cc; 
}
.bom .children { 
    color: #cc6600; 
}
.bom .scroll-container {
    overflow-x: auto;
    margin: 10px 0;
}
</style>



