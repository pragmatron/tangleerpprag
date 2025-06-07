<template>
    <div style="width:100%; min-height:100vh;">
      <!-- Controls -->
      <div class="controls-toggle" @click="toggleControls">
        <span v-if="!isControlsVisible" style="font-weight:500; font-size:14px;">Show Options</span>
        <span v-else style="font-weight:500; font-size:14px;">Hide Options</span>
        <i
          :class="isControlsVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"
          style="cursor: pointer; margin-left: 8px;"
        ></i>
      </div>
      <div v-if="isControlsVisible" class="controls">
        <!-- Group By Selection -->
        <div class="box_select">
          <label>Group by (in order):</label>
          <v-select
            v-model="selectedGroupings"
            :options="groupingOptions"
            multiple
            placeholder="Choose Groupings"
            class="group-select"
          ></v-select>
        </div>
        <!-- Columns to Display -->
        <div class="box_select">
          <label>Columns to display:</label>
          <v-select
            v-model="selectedColumns"
            :options="columnsOptions"
            multiple
            placeholder="Columns to display"
            class="group-select"
          ></v-select>
        </div>
        <div class="box_select">
          <label>Columns to Sum:</label>
          <v-select
            v-model="selectedSumColumns"
            multiple
            :options="sumColumnsOptions"
            placeholder="Columns to Sum"
            class="group-select"
          ></v-select>
        </div>
      <div class="checkbox-tooltip-container" style="margin-top: 10px;">
      <label>
        <input type="checkbox" v-model="enableCustomFormula" />
        Enable Advanced Formula
      </label>
      <span id="checkbox-info-icon" class="info-icon">
        <i class="fas fa-info-circle"></i>
      </span>
      <b-tooltip target="checkbox-info-icon" placement="top">
        Check this box to enable advanced formula. This is optional and only for custom needs. 
        It will be used for displaying the Total on a group section.
      </b-tooltip>
       </div>
        <!-- Columns to Use in Formula -->
        <div class="box_select">
          <label v-if="enableCustomFormula">Columns to Use in Formula:</label>
          <v-select
            v-if="enableCustomFormula"
            v-model="selectedFormulaColumns"
            multiple
            :options="sumColumnsOptions"
            placeholder="Columns to Use in Formula"
            class="group-select"
          ></v-select>
        </div>
        <!-- Custom Formula Input -->
        <div v-if="enableCustomFormula" class="box_select" style="padding:10px; position:relative">
          <label>Custom Calculation:</label>
          <input @input="validateFormula" v-model="customFormula" placeholder="e.g., value * qty + extravalue" />
          <b-tooltip target="info-icon" placement="top">
            Formula can only be built using the selected column names in "Columns to Use in Formula".
          </b-tooltip>
          <span id="info-icon" class="info-icon">
            <i class="fas fa-info-circle"></i>
          </span>
        </div>
        <b-button size="sm" style="margin-top:50px; font-size:14px;" @click="saveOptions">Save Options</b-button>
      </div>
  
      <!-- Table Header -->
      <div class="header row" :style="{ marginLeft: (selectedGroupings.length * 10)-10 + 'px!important' }">
        <div v-for="column in selectedColumns" :key="column" class="cell">
          {{ getColumnLabel(column) }}
        </div>
        <div class="cell"></div>
      </div>
  
      <!-- Grouped Data Rendering -->
  
      <div class="orders-container">
        <template v-if="selectedGroupings.length > 0">
          <div>
         
            <div v-for="(entry, index) in flattenedData" :key="index">
    
              <div
                v-if="entry.type === 'group' && entry.level===0"
                class="group-header"
                :style="{ marginLeft: entry.level * 10 -10 + 'px', position:'relative'}"
                @click="toggleGroup(entry.key)"
              >
                  <div :style="{width:'100%', position:'relaative', minHeight:'20px',  width: `calc(100% - ${entry.level * 10}px)`}">
                <div class="group-title-container" style="position:absolute">
                 <i :class="expandedGroups[entry.key] ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" style="margin-right: 10px; font-size:12px;"></i>
                  <div>
               <div class="group-stats" style="display:flex; display-flex:row;">
                 <span class="group-title">{{ entry.title }}</span>
                 <p style="padding:0px; margin:0px; font-size:12px; font-weight:500; width:40%">Count: {{ entry.count }}</p>
                <p style="padding:0px; margin:0px; font-size:12px; font-weight:500; width:50%" v-if="enableCustomFormula">| Total: ${{ entry.total.toLocaleString() }}</p>
               </div>
                  </div>
               </div>
               <div class="row2" :style="{ marginLeft: (selectedGroupings.length * 10)-10 + 'px!important', width:'100%'}">
                        <div v-for="column in selectedColumns" :key="column" class="cell">
  
                          <template v-for="(sum, col) in entry.sums" :key="col">
  
                           <span v-if="col===column"> Sum: {{ sum }}</span>
                           </template>
                       </div>
                     <div class="cell">
                        <span></span>
                     </div>
                </div>
                  </div>
                  <div v-for="child in getChildren(entry.key)" :key="child.key" style="width:100%;">
                    <div v-if="child.type === 'group' && child.level===1" class="group-header" :style="{ marginLeft: child.level * 10 + 'px',  width: `calc(100% - ${child.level * 10}px)`, display:'block', backgroundColor:'#F5F5F5' }" @click.stop="toggleGroup(child.key)">
                           <div :style="{width: `calc(100% - ${child.level * 10}px)`, position:'relaative'}">
                <div class="group-title-container" style="position:absolute">
                 <i :class="expandedGroups[child.key] ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" style="margin-right: 10px; font-size:12px;"></i>
                  <div>
               <div class="group-stats" style="display:flex; display-flex:row;">
                 <span class="group-title">{{ child.title }}</span>
                 <p style="padding:0px; margin:0px; font-size:12px; font-weight:500; width:40%">Count: {{ child.count }}</p>
                <p style="padding:0px; margin:0px; font-size:12px; font-weight:500; width:50%" v-if="enableCustomFormula">| Total: ${{ cild.total.toLocaleString() }}</p>
               </div>
                  </div>
               </div>
               <div class="row2" :style="{ marginLeft: (selectedGroupings.length * 10)-10 + 'px!important', width:'100%'}">
                        <div v-for="column in selectedColumns" :key="column" class="cell">
  
                          <template v-for="(sum, col) in child.sums" :key="col">
  
                           <span v-if="col===column"> Sum: {{ sum }}</span>
                    
                           </template>
                       </div>
                     <div class="cell">
                     </div>
                </div>
                  </div>
                      <!-- <i :class="expandedGroups[child.key] ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" style="margin-right: 10px; font-size:12px;"></i>
                      <span class="group-title">{{ child.title }}</span> -->
                          <div v-if="expandedGroups[child.key]">
                      <div v-for="subChild in getChildren(child.key)" :key="subChild.key">
                          <div v-if="subChild.type === 'group' && subChild.level===2" class="group-header" :style="{ marginLeft: subChild.level * 10 + 'px', width: `calc(100% - ${subChild.level * 10}px)`, display:'block' , marginBottom:'0px'}" @click.stop="toggleGroup(subChild.key)">
                      <i :class="expandedGroups[subChild.key] ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" style="margin-right: 10px; font-size:12px;"></i>
                      <span class="group-title">{{ subChild.title }}</span>
                    </div>
                        <div v-else-if="subChild.type === 'item'" class="row order-row" :style="{ marginLeft: (subChild.level * 10) - 10 + 'px!important'}">
                          <div v-for="column in selectedColumns" :key="column" class="cell">
                                 {{
                                    subChild.item[`$${column}$display`]
                                   ? subChild.item[`$${column}$display`]
                                     : subChild.item[column] || ''
                                     }}
                          </div>
                          <div class="cell">
                            <i class="fas fa-search preview-button" @click.stop="previewRow(subChild.item)"> Preview</i>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                           <div
                v-else-if="child.type === 'item'"
                class="row order-row"
                :style="{ marginLeft: (child.level * 10)-10 + 'px!important' }"
              >
                <div v-for="column in selectedColumns" :key="column" class="cell">
                  {{
                   child.item[`$${column}$display`]
                      ? child.item[`$${column}$display`]
                      : child.item[column] || ''
                  }}
                </div>
                <div class="cell">
                  <i class="fas fa-search preview-button"  @click.stop="previewRow(child.item)">  Preview</i>
                </div>
              </div>
                  </div>
              </div>
              <div
                v-else-if="entry.type === 'item' && entry.level===1"
                class="row order-row"
                :style="{ marginLeft: (entry.level * 10)-10 + 'px!important' }"
              >
                <div v-for="column in selectedColumns" :key="column" class="cell">
                  {{
                   entry.item[`$${column}$display`]
                      ? entry.item[`$${column}$display`]
                      : entry.item[column] || ''
                  }}
                </div>
                <div class="cell">
                  <i class="fas fa-search preview-button"  @click.stop="previewRow(entry.item)">  Preview</i>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div v-for="order in orders" :key="order.id" class="row order-row" :style="{ marginLeft: (selectedGroupings.length * 10)-10 + 'px!important' }">
            <div v-for="column in selectedColumns" :key="column" class="cell">
              {{
                 order[`$${column}$display`]
                  ? order[`$${column}$display`]
                  : order[column] || ''
              }}
            </div>
            <div class="cell">
               <i class="fas fa-search preview-button"  @click.stop="previewRow(order)">  Preview</i>
            </div>
          </div>
        </template>
      </div>
    </div>
  </template> 
  
  <script>
  module.exports = {
    name: 'OrderManagement',
    props: ['filteredRecords', 'tableName'],
    data() {
      return {
        selectedColumns: [],
        selectedGrid: [],
        gridsOptions: [],
        selectedGroupings: [],
        groupingOptions: [],
        columnsOptions: [],
        selectedSumColumns: [],
        selectedFormulaColumns: [],
        sumColumnsOptions: [],
        calculationOptions: ['sum', 'formula'],
        expandedGroups: {},
        customFormula: '',
        calculationType: 'formula',
        orders: [],
        showTooltip: true,
        isControlsVisible: false,
        enableCustomFormula:false
      };
    },
    computed: {
      //   getChildren(parentKey) {
      //   return this.flattenedData.filter((entry) => entry.parentKey === parentKey);
      // },
      groupedData() {
        if (this.selectedGroupings.length === 0) return { All: this.orders };
        return this.groupByMultiple([...this.orders], this.selectedGroupings);
      },
      flattenedData() {
        return this.flattenGroupedData(this.groupedData);
      },
    },
    methods: {
        getChildren(parentKey) {
          // console.log(parentKey)
        return this.flattenedData.filter((entry) => entry.parentKey === parentKey);
      },
      toggleControls() {
        this.isControlsVisible = !this.isControlsVisible;
      },
      getColumnLabel(column) {
        return column;
      },
      formatColumnValue(value) {
        if (!value) return '';
        if (moment(value, moment.ISO_8601, true).isValid()) {
          return moment(value).format('MM/DD/YYYY');
        }
        return value;
      },
      previewRow(row) {
        // console.log(row, 'row', this.selectedGrid);
        $dgShowPreview(this.selectedGrid, row.rowKey);
      },
      setGridData() {
      },
      groupByMultiple(items, groupings) {
        if (!groupings.length) return items;
  
        const groupingKey = groupings[0];
        const remainingGroupings = groupings.slice(1);
  
        const grouped = items.reduce((acc, item) => {
          const key = item[groupingKey] || 'Undefined';
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
  
        if (remainingGroupings.length) {
          Object.keys(grouped).forEach((key) => {
            grouped[key] = this.groupByMultiple(grouped[key], remainingGroupings);
          });
        }
  
        return grouped;
      },
      flattenGroupedData(groupedData, level = 0, parentKey = '') {
        let result = [];
        for (let key in groupedData) {
          const groupKey = parentKey ? `${parentKey}-${key}` : key;
          const group = groupedData[key];
          result.push({
            type: 'group',
            parentKey:parentKey?parentKey:'parent',
            key: groupKey,
            level: level,
            title: `${this.selectedGroupings[level]}: ${key}`,
            count: this.getGroupCount(group),
            total: this.getGroupTotal(group),
            sums: this.getColumnSums(group),
          });
  
          if (this.isGroupExpanded(groupKey)) {
            if (Array.isArray(group)) {
              group.forEach((item) => {
                result.push({
                  type: 'item',
                  parentKey:parentKey?parentKey:'parent',
                  item: item,
                  level: level + 1,
                });
              });
            } else {
              const subResult = this.flattenGroupedData(group, level + 1, groupKey);
              result = result.concat(subResult);
            }
          }
        }
        // console.log(result, 'res')
        return result;
      },
      //new
        getColumnSums(group) {
      if (Array.isArray(group)) {
        return this.selectedSumColumns.reduce((sums, col) => {
          sums[col] = group.reduce((sum, item) => {
            if (item[col] !== undefined && item[col] !== null) {
              return sum + parseFloat(item[col]) || 0;
            }
            return sum;
          }, 0);
          return sums;
        }, {});
      }
      return Object.values(group).reduce((sums, subGroup) => {
        const subSums = this.getColumnSums(subGroup);
        this.selectedSumColumns.forEach((col) => {
          sums[col] = (sums[col] || 0) + (subSums[col] || 0);
        });
        return sums;
      }, {});
    },
      //end
      toggleGroup(groupKey) {
        this.$set(this.expandedGroups, groupKey, !this.expandedGroups[groupKey]);
      },
      isGroupExpanded(groupKey) {
        return this.expandedGroups[groupKey];
      },
      getGroupCount(group) {
        if (Array.isArray(group)) return group.length;
        return Object.values(group).reduce(
          (sum, subGroup) => sum + this.getGroupCount(subGroup),
          0
        );
      },
      calculateCustomValue(item) {
        try {
          const allowedVariables = [...this.selectedFormulaColumns];
          let formula = this.customFormula;
  
          allowedVariables.forEach((variable) => {
            const regex = new RegExp(`\\b${variable}\\b`, 'g');
            formula = formula.replace(regex, item[variable] ?? 0);
          });
  
          // Evaluate the formula
          return eval(formula);
        } catch (error) {
          console.error('Error calculating formula:', error);
          return 0;
        }
      },
      getGroupTotal(group) {
        if (Array.isArray(group)) {
          if (this.calculationType === 'sum') {
            return this.sumValues(group);
          } else if (this.calculationType === 'formula') {
            return group.reduce(
              (sum, item) => sum + this.calculateCustomValue(item),
              0
            );
          }
        }
        return Object.values(group).reduce(
          (sum, subGroup) => sum + this.getGroupTotal(subGroup),
          0
        );
      },
  
      sumValues(array) {
        if (!Array.isArray(array)) return 0;
        return array.reduce((sum, item) => {
          let total = 0;
          this.selectedSumColumns.forEach((col) => {
            if (item[col] !== undefined && item[col] !== null) {
              total += parseFloat(item[col]) || 0;
            }
          });
          return sum + total;
        }, 0);
      },
      validateFormula() {
        const allowedVariables = [...this.selectedFormulaColumns];
        const operators = /^[0-9+\-*/(). ]+$/;
        const formula = this.customFormula.trim();
  
        try {
          let sanitizedFormula = formula;
          allowedVariables.forEach((variable) => {
            const regex = new RegExp(`\\b${variable}\\b`, 'g');
            sanitizedFormula = sanitizedFormula.replace(regex, '');
          });
  
          if (!operators.test(sanitizedFormula)) {
        
          }
        } catch (error) {
          console.error('Invalid formula syntax:', error);
        }
      },
      saveOptions() {
        let obj = {
          selectedColumns: [...this.selectedColumns],
          selectedGroupings: [...this.selectedGroupings],
          selectedSumColumns: [...this.selectedSumColumns],
          selectedFormulaColumns: [...this.selectedFormulaColumns],
          selectedGrid: this.selectedGrid,
          customFormula: this.customFormula,
          calculationType: this.calculationType,
          enableCustomFormula:this.enableCustomFormula
        };
        // Save options as needed
        $setSharedModel(this.$parent.$parent.widgetKey, obj);
      },
    },
    mounted() {
      
      if (this.filteredRecords) {
        // console.log(this.filteredRecords)
        this.orders = this.filteredRecords;
        this.selectedGrid = this.tableName;
  
        const nameOfColumns = [...this.orders];
        const numericKeys = [
          ...new Set(
            nameOfColumns.flatMap((obj) =>
              Object.keys(obj).filter(
                (key) =>
                  typeof obj[key] === 'number' &&
                  !key.startsWith('$') &&
                  !key.toLowerCase().includes('date')
              )
            )
          ),
        ];
        this.sumColumnsOptions = numericKeys ? numericKeys : [];
        const keys = Object.keys(nameOfColumns[0]).filter(
          (key) => !key.startsWith('$')
        );
        this.columnsOptions = keys ? keys : [];
        this.groupingOptions = keys ? keys : [];
  
        // Load saved options if any
        let data = $getSharedModel(this.$parent.$parent.widgetKey)
        // console.log(data)
        if (data) {
          this.selectedColumns = data.selectedColumns || [];
          this.selectedGroupings = data.selectedGroupings || [];
          this.selectedSumColumns = data.selectedSumColumns || [];
          this.selectedFormulaColumns = data.selectedFormulaColumns || [];
          this.customFormula = data.customFormula || '';
          this.calculationType = data.calculationType || 'sum';
          this.enableCustomFormula =data.enableCustomFormula || false;
        }
      }
    },
  };
  </script>
  
  <style scoped>
body {
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #333;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.controls-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
}

.controls {
  padding: 5px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
}

.preview-button {
  background: none;
  border: none;
  color: #5297FF; /* Blue button text */
  cursor: pointer;
  font-size: 12px;
  padding: 5px;
  margin: 0;
  text-align: end;
  text-decoration: underline;
}

.preview-button:hover {
  color: #3877CC; /* Darker blue on hover */
}

.box_select {
  margin-bottom: 15px;
}

/* Header styles */
.header {
  display: flex;
  background-color: transparent;
  border-bottom: 1px solid #ccc;
  margin-bottom: 2px;
  padding: 2px 0;
  font-weight: 500;
}

.header .cell {
  padding: 2px;
  flex: 1;
  text-align: left;
  border-right: 1px solid #ddd;
}

.header .cell:last-child {
  border-right: none;
}

/* Group header */
.group-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background-color: #DCEBFF; /* Lighter version of #5297FF */
  border: 1px solid #5297FF; /* Consistent blue border */
  color: #333; /* Text contrast */
  border-radius: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.group-header:hover {
  background-color: #C7E0FF; /* Slightly darker blue on hover */
}

.group-title-container {
  display: flex;
  align-items: center;
}

.group-title {
  font-weight: bold;
  font-size: 12px;
  color: #333; /* Darker text for readability */
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.group-stats {
  font-size: 12px;
  color: #555;
}

/* Data rows */
.row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 5px 5px;
}

.row2 {
  display: flex;
  align-items: center;
  background-color: #E7F1FF; /* Subtle light blue for child rows */
  padding: 5px;
}

.order-row {
  background-color: #F9FCFF; /* Light blue for rows */
  border-left: 2px solid #E0EFFF; /* Subtle border */
}

.order-row:nth-child(even) {
  background-color: #DCEBFF; /* Lighter alternate blue */
}

.row .cell {
  padding: 5px;
  flex: 1;
  text-align: left;
  border-right: 1px solid #ddd;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row .cell:last-child {
  border-right: none;
}

.row2 .cell {
  padding: 5px;
  flex: 1;
  text-align: left;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Buttons */
b-button {
  font-size: 13px;
  padding: 5px 10px;
  text-transform: capitalize;
  background-color: #5297FF;
  color: #fff;
  border: none;
}

b-button:hover {
  background-color: #3877CC; /* Darker blue on hover */
}

/* Tooltip icon */
.info-icon {
  margin-left: 10px;
  color: #5297FF; /* Blue tooltip icon */
  font-size: 14px;
  cursor: pointer;
}

.info-icon:hover {
  color: #3877CC; /* Darker blue on hover */
}


  
  </style>
