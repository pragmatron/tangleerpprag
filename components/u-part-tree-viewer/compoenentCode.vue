<template>
  <div class="material-tree-container" v-if="parsedData">
    <!-- Parent Part Name -->
    <div class="parent-part">
      <h2>{{ rowData.name }}</h2>
    </div>
    
    <!-- Summary Section -->
    <div class="total-summary">
      <div class="summary-item">
        <span class="label">Parent Operations Cost:</span>
        <span class="value">${{ formatNumber(parsedData.parentOperationsCost) }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Total Materials Cost:</span>
        <span class="value">${{ formatNumber(parsedData.totalMaterialsCost) }}</span>
      </div>
      <div class="summary-item total">
        <span class="label">Grand Total:</span>
        <span class="value">${{ formatNumber(parsedData.grandTotal) }}</span>
      </div>
    </div>

    <!-- Tree Structure -->
    <div class="materials-tree">
      <div v-for="material in parsedData.materials" :key="material.rowKey" class="node">
        <div class="node-header" @click="toggleNode(material.rowKey)">
          <span class="expand-icon">
            {{ material.materials.length > 0 ? (isExpanded(material.rowKey) ? '▼' : '▶') : '•' }}
          </span>
          <div class="node-content">
        <div class="node-summary">
          <strong>Part: {{ getPartName(material.part) }}</strong>
          <span class="quantity">Qty Per: {{ material.quantityPer }}</span>
          <span class="total-quantity">Total Needed: {{ material.totalQuantityNeeded }}</span>
          <span class="total-price">Total: ${{ formatNumber(material.totalForParent) }}</span>
        </div>
            <div v-if="isExpanded(material.rowKey)" class="node-details">
              <div class="cost-breakdown">
                <div class="cost-item">
                  <span class="label">Material Cost:</span>
                  <span class="value">${{ formatNumber(material.materialCost) }}</span>
                </div>
                <div class="cost-item">
                  <span class="label">Operations Cost:</span>
                  <span class="value">${{ formatNumber(material.operationsCost) }}</span>
                </div>
                <div class="cost-item">
                  <span class="label">Manufactured Component Cost:</span>
                  <span class="value">${{ formatNumber(material.manufacturedComponentCost) }}</span>
                </div>
                <div class="cost-item">
                  <span class="label">Sub-Materials Cost:</span>
                  <span class="value">${{ formatNumber(material.subMaterialsCost) }}</span>
                </div>
                <div class="cost-item">
                  <span class="label">Unit Cost:</span>
                  <span class="value">${{ formatNumber(material.unitCost) }}</span>
                </div>
                <div class="cost-item">
                  <span class="label">Price per Unit:</span>
                  <span class="value">${{ formatNumber(material.totalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nested materials -->
        <div v-if="isExpanded(material.rowKey) && material.materials.length > 0" class="node-children">
          <div v-for="subMaterial in material.materials" :key="subMaterial.rowKey" class="node">
            <div class="node-header" @click="toggleNode(subMaterial.rowKey)">
              <span class="expand-icon">
                {{ subMaterial.materials.length > 0 ? (isExpanded(subMaterial.rowKey) ? '▼' : '▶') : '•' }}
              </span>
              <div class="node-content">
            <div class="node-summary">
              <strong>Part: {{ getPartName(subMaterial.part) }}</strong>
              <span class="quantity">Qty Per: {{ subMaterial.quantityPer }}</span>
              <span class="total-quantity">Total Needed: {{ subMaterial.totalQuantityNeeded }}</span>
              <span class="total-price">Total: ${{ formatNumber(subMaterial.totalForParent) }}</span>
            </div>
                <div v-if="isExpanded(subMaterial.rowKey)" class="node-details">
                  <div class="cost-breakdown">
                    <div class="cost-item">
                      <span class="label">Material Cost:</span>
                      <span class="value">${{ formatNumber(subMaterial.materialCost) }}</span>
                    </div>
                    <div class="cost-item">
                      <span class="label">Operations Cost:</span>
                      <span class="value">${{ formatNumber(subMaterial.operationsCost) }}</span>
                    </div>
                    <div class="cost-item">
                      <span class="label">Manufactured Component Cost:</span>
                      <span class="value">${{ formatNumber(subMaterial.manufacturedComponentCost) }}</span>
                    </div>
                    <div class="cost-item">
                      <span class="label">Sub-Materials Cost:</span>
                      <span class="value">${{ formatNumber(subMaterial.subMaterialsCost) }}</span>
                    </div>
                    <div class="cost-item">
                      <span class="label">Unit Cost:</span>
                      <span class="value">${{ formatNumber(subMaterial.unitCost) }}</span>
                    </div>
                    <div class="cost-item">
                      <span class="label">Price per Unit:</span>
                      <span class="value">${{ formatNumber(subMaterial.totalPrice) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  props: ['rowData'],
  data() {
    return {
      expandedNodes: [],
      parsedData: null,
      partsMap: {}
    };
  },
  created() {
    try {
      this.parsedData = JSON.parse(this.rowData.dataForCustomComponent);
      this.expandAllNodes(this.parsedData.materials);
      this.partsMap = $getDashboardModel('parts');
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  },
  methods: {
    getPartName(partKey) {
      const part = this.partsMap[partKey];
      // Add logging to debug
      console.log('Getting name for part:', partKey, part);
      return part ? part.name || 'Unknown Part' : partKey;
    },
    formatNumber(value) {
      return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    toggleNode(rowKey) {
      const index = this.expandedNodes.indexOf(rowKey);
      if (index > -1) {
        this.expandedNodes.splice(index, 1);
      } else {
        this.expandedNodes.push(rowKey);
      }
    },
    isExpanded(rowKey) {
      return this.expandedNodes.includes(rowKey);
    },
    expandAllNodes(materials) {
      if (!materials) return;
      materials.forEach(material => {
        this.expandedNodes.push(material.rowKey);
        if (material.materials && material.materials.length > 0) {
          this.expandAllNodes(material.materials);
        }
      });
    }
  }
};
</script>

<style scoped>
/* Add new style for parent part name */
.parent-part {
  margin-bottom: 20px;
}

.parent-part h2 {
  color: #2c3e50;
  margin: 0;
  padding: 0;
  font-size: 1.5em;
}

/* Rest of your existing styles remain the same */
.material-tree-container {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.total-summary {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-item.total {
  font-weight: bold;
  font-size: 1.1em;
}

.label {
  color: #666;
  font-size: 0.9em;
}

.value {
  font-weight: bold;
  color: #333;
}

.node {
  margin: 10px 0;
}

.node-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #ddd;
  transition: background-color 0.2s;
}

.node-header:hover {
  background-color: #f8f8f8;
}

.expand-icon {
  font-family: monospace;
  width: 20px;
  text-align: center;
}

.node-content {
  flex-grow: 1;
}

.node-summary {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.quantity {
  color: #666;
}

.total-price {
  font-weight: bold;
  color: #2c3e50;
}

.node-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.cost-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
  margin-top: 5px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.node-children {
  margin-left: 20px;
  padding-left: 20px;
  border-left: 2px solid #eee;
}
</style>