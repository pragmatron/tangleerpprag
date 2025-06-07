 async function newLot(rowData){

let a = ''
a = await $dgAddRow('locationInventory', {name:rowData.newLotCode,part:rowData.parts,location:rowData.location})

console.log(a)

await $dgSetRowVals('inventoryTransaction', rowData.rowKey, {locationInventory:a})

}

window.newLot = newLot