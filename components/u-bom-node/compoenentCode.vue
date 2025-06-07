<script>
module.exports = {
    template: `
            <div class="part">
            <div class="d-flex align-items-center py-2" style="cursor: pointer;" @click="toggle">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center">
                        <h3 style="margin:0;">
                            {{ node.name || "Part" }}
                        </h3>
                        <b-button 
                            variant="success" 
                            size="sm"
                            class="ms-2 ml-2"
                            @click.stop="$dgShowEditRowModal('parts', node.rowKey)"
                        >
                            Open
                        </b-button>
                        <b-button 
                            variant="success" 
                            size="sm"
                            class="ms-2 ml-2"
                            @click.stop="setAllValues"
                        >
                            Set Values
                        </b-button>
                    </div>
                    <div class="text-muted small">{{ node.description }}</div>
                </div>
                <b-icon
                    :icon="isExpanded ? 'chevron-down' : 'chevron-right'"
                    class="me-2"
                    size="lg"
                    scale="2"
                    style="color: #0f0f0f;"
                ></b-icon>
            </div>

            <b-collapse v-model="isExpanded">
                <div class="scroll-container">
                    <table>
                        <tr>
                            <th>Metrics</th>
                            <th>Setup Hours</th>
                            <th>Cycle Hours</th>
                            <th>Total Hours</th>
                            <th>Setup Cost</th>
                            <th>Cycle Cost</th>
                            <th>Material Cost</th>
                            <th>Total Cost</th>
                            <th>Date Set</th>
                        </tr>
                        <tr>
                            <td>Direct</td>
                            <td class="direct">{{ formatNumber(directSetupHours) }}h</td>
                            <td class="direct">{{ formatNumber(directCycleHours) }}h</td>
                            <td class="direct">{{ formatNumber(directTotalHours) }}h</td>
                            <td class="direct">\${{ formatNumber(directSetupCost) }}</td>
                            <td class="direct">\${{ formatNumber(directCycleCost) }}</td>
                            <td class="direct">\${{ formatNumber(totalMaterialCost) }}</td>
                            <td class="direct">\${{ formatNumber(directTotalCost) }}</td>
                            

                        </tr>
                        <tr>
                            <td>Children</td>
                            <td class="children">{{ formatNumber(childSetupHours) }}h</td>
                            <td class="children">{{ formatNumber(childCycleHours) }}h</td>
                            <td class="children">{{ formatNumber(childTotalHours) }}h</td>
                            <td class="children">\${{ formatNumber(childSetupCost) }}</td>
                            <td class="children">\${{ formatNumber(childCycleCost) }}</td>
                            <td class="children">\${{ formatNumber(childMaterialCost) }}</td>
                            <td class="children">\${{ formatNumber(childTotalCost) }}</td>
                        </tr>
                        <tr>
                            <td><b>Total</b></td>
                            <td class="total">{{ formatNumber(totalSetupHours) }}h</td>
                            <td class="total">{{ formatNumber(totalCycleHours) }}h</td>
                            <td class="total">{{ formatNumber(totalHours) }}h</td>
                            <td class="total">\${{ formatNumber(totalSetupCost) }}</td>
                            <td class="total">\${{ formatNumber(totalCycleCost) }}</td>
                            <td class="total">\${{ formatNumber(rolledUpMaterialCost) }}</td>
                            <td class="total">\${{ formatNumber(rolledUpTotalCost) }}</td>
                        </tr>
                    </table>
                </div>

                <div v-if="node.operations" class="ops mt-3">
                    <div class="d-flex align-items-center mb-2">
                        <b-icon icon="gear-fill" class="me-2"></b-icon>
                        <b>Operations</b>
                    </div>
                    <div v-for="op in node.operations" class="ms-4">
                        {{ op.name }}: Setup {{ op.setupTime }}h, Cycle {{ op.cycleTime }}h × {{ effectiveQuantity }}
                        (Resource Rate: \${{ formatNumber(getResourceRate(op)) }}/hr)
                    </div>
                </div>

                <div v-if="node.materials" class="mats mt-3">
                    <div class="d-flex align-items-center mb-2">
                        <b-icon icon="box-fill" class="me-2"></b-icon>
                        <b>Materials</b>
                    </div>
                    <div v-for="material in node.materials" class="ms-4">
                        {{ material.description }} ({{ material.quantityPer }} × {{ effectiveQuantity }} = {{ formatNumber(material.quantityPer * effectiveQuantity) }})
                        <div v-if="material.childPart" class="tree">
                            <bom-node 
                                :node="material.childPart"
                                :parent-multiplier="material.quantityPer * parentMultiplier"
                                :key="componentKey"
                                @child-totals="updateChildTotals($event, material)">
                            </bom-node>
                        </div>
                    </div>
                </div>
            </b-collapse>
        </div>
    `,
    components: {
        'bom-node': $getCustomComponent('u-bom-node'),
    },
    props: {
        node: Object,
        parentMultiplier: {
            type: Number,
            default: 1
        },
        isParentPart: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            isExpanded: true,
            childrenTotals: [],
            componentKey: 0
        }
    },
    watch: {
        totalQty: {
            handler(newVal) {
                // Force child components to re-render
                this.componentKey += 1;
                this.$nextTick(() => {
                    this.emitTotals();
                });
            },
            immediate: true
        },
        parentMultiplier: {
            handler() {
                this.componentKey += 1;
                this.$nextTick(() => {
                    this.emitTotals();
                });
            },
            immediate: true
        },
        childrenTotals: {
            handler() {
                this.emitTotals();
            },
            deep: true
        }
    },
    computed: {
        totalQty() {
            return Number($getGlobalModel('costingQty') || 0);
        },
        effectiveQuantity() {
            return this.parentMultiplier * this.totalQty;
        },
        directSetupHours() {
        return this.node.operations ?
            this.node.operations.reduce((sum, op) => {
            const time = Number(op.setupTime || 0);
            return sum + (op.setupUnit == 'minutes' ? time / 60 : time);
            }, 0) : 0;
        },
        directCycleHours() {
            console.log('thisnodeops: ', this.node.operations)
        return this.node.operations ?
            this.node.operations.reduce((sum, op) => {
            const time = Number(op.cycleTime || 0) * this.effectiveQuantity;
            return sum + (op.cycleUnit == 'minutes' ? time / 60 : time);
            }, 0) : 0;
        },
        directTotalHours() { 
            return this.directSetupHours + this.directCycleHours; 
        },
        directSetupCost() {
        return this.node.operations ?
            this.node.operations.reduce((sum, op) => {
            const rate = this.getResourceRate(op);
            const time = Number(op.setupTime || 0);
            return sum + ((op.setupUnit === 'minutes' ? time / 60 : time) * rate);
            }, 0) : 0;
        },
        directCycleCost() {
        return this.node.operations ?
            this.node.operations.reduce((sum, op) => {
            const rate = this.getResourceRate(op);
            const time = Number(op.cycleTime || 0);
            return sum + ((op.cycleUnit === 'minutes' ? time / 60 : time) * rate * this.effectiveQuantity);
            }, 0) : 0;
        },
        directTotalCost() { 
            return this.directSetupCost + this.directCycleCost + this.totalMaterialCost; 
        },
        childSetupHours() {
        return this.childrenTotals.reduce((sum, child) => {
            const time = Number(child.setupHours || 0);
            return sum + (child.setupUnit == 'minutes' ? time / 60 : time);
        }, 0);
        },
        childCycleHours() {
        return this.childrenTotals.reduce((sum, child) => {
            const time = Number(child.cycleHours || 0);
            return sum + (child.cycleUnit == 'minutes' ? time / 60 : time);
        }, 0);
        },
        childTotalHours() { 
            return this.childSetupHours + this.childCycleHours; 
        },
        childSetupCost() {
            return this.childrenTotals.reduce((sum, child) => sum + Number(child.setupCost || 0), 0);
        },
        childCycleCost() {
            return this.childrenTotals.reduce((sum, child) => sum + Number(child.cycleCost || 0), 0);
        },
        childMaterialCost() {
            return this.childrenTotals.reduce((sum, child) => sum + Number(child.materialCost || 0), 0);
        },
        childTotalCost() {
            return this.childSetupCost + this.childCycleCost + this.childMaterialCost;
        },
        totalSetupHours() { 
            return this.directSetupHours + this.childSetupHours; 
        },
        totalCycleHours() { 
            return this.directCycleHours + this.childCycleHours; 
        },
        totalHours() { 
            return this.totalSetupHours + this.totalCycleHours; 
        },
        totalSetupCost() { 
            return this.directSetupCost + this.childSetupCost; 
        },
        totalCycleCost() { 
            return this.directCycleCost + this.childCycleCost; 
        },
        totalMaterialCost() {
            return this.node.materialCost ? Number(this.node.materialCost) * this.parentMultiplier * this.totalQty : 0;
        },
        rolledUpMaterialCost() { 
            return this.totalMaterialCost + this.childMaterialCost; 
        },
        rolledUpTotalCost() { 
            return this.totalSetupCost + this.totalCycleCost + this.rolledUpMaterialCost; 
        }
    },
    methods: {
        async setAllValues() {
            console.log('node: ', this.node)
            console.log('rolleduptotal: ', this.rolledUpTotalCost),
            console.log('totalmaterialcost: ', this.rolledUpMaterialCost)
            console.log('this.directmaterialost', this.node.materialCost)

             // Generate the current date
    const currentDate = new Date().toLocaleString(); // You can format this as needed

            await $dgSetRowVals('parts', this.node.rowKey, {
                costToManufactureBOM: this.childTotalCost,
                directSetupHours: this.directSetupHours,
                directCycleHours: this.directCycleHours,
                directTotalHours: this.directTotalHours,
                directSetupCost: this.directSetupCost,
                directCycleCost: this.directCycleCost,
                directTotalCost: this.directTotalCost,
                directMaterialCost: this.node.materialCost,
                childrenSetupHours: this.childSetupHours,
                childrenCycleHours: this.childCycleHours,
                childrenTotalHours: this.childTotalHours,
                childrenSetupCost: this.childSetupCost,
                childrenCycleCost: this.childCycleCost,
                childrenMaterialCost: this.childMaterialCost,
                childrenTotalCost: this.childTotalCost,
                totalSetupHours: this.totalSetupHours,
                totalCycleHours: this.totalCycleHours,
                totalSetupCost: this.totalSetupCost,
                totalCycleCost: this.totalCycleCost,
                totalMaterialCost: this.rolledUpMaterialCost,
                totalTotalHours: this.totalHours,
                totalTotalCost: this.rolledUpTotalCost,
                dateSet: currentDate // Add the current date here
            })
        },
        toggle() { 
            this.isExpanded = !this.isExpanded; 
        },
        formatNumber(num) { 
            return Number(num || 0).toFixed(2); 
        },
        getResourceRate(operation) {
            const resource = $getGrid('resources').find(r => r.rowKey === operation.resource);
            return (resource?.totalCostPerHour > 0 ? resource.totalCostPerHour : 
                   resource?.averageHourlyWage > 0 ? resource.averageHourlyWage : 
                   0);        
        },
updateChildTotals(totals, material) {
    // Create a unique identifier using both material and part info
    const uniqueId = `${material.id}_${material.part}_${material.parentPart}`;
    // console.log('Updating totals for:', uniqueId, totals); // Debug log
    
    const index = this.childrenTotals.findIndex(t => t.materialId === uniqueId);
    const newTotals = {
        materialId: uniqueId,
        setupHours: Number(totals.setupHours || 0),
        cycleHours: Number(totals.cycleHours || 0),
        setupCost: Number(totals.setupCost || 0),
        cycleCost: Number(totals.cycleCost || 0),
        materialCost: Number(totals.materialCost || 0)
    };
    
    if (index === -1) {
        this.childrenTotals.push(newTotals);
    } else {
        this.childrenTotals.splice(index, 1, newTotals);
    }

    // Debug log
    // console.log('Current childrenTotals:', this.childrenTotals);
    
    this.emitTotals();
},
        emitTotals() {
            this.$emit('child-totals', {
                setupHours: this.totalSetupHours,
                cycleHours: this.totalCycleHours,
                setupCost: this.totalSetupCost,
                cycleCost: this.totalCycleCost,
                materialCost: this.rolledUpMaterialCost
            });
        }
    },
    mounted() {
        this.emitTotals();
    }
};
</script>