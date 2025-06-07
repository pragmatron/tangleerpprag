return async function(dgRowInEditMode) {
  // Get selected work order materials
  if(!dgRowInEditMode) {
      console.error('No selected materials')
      return
  }
  const selectedMaterials = Object.keys(dgRowInEditMode)
    .filter(key => key.startsWith('workOrderMaterials.'))
    .map(key => key.split('.')[1])
    .map(key => this.$helpers.$getSingleRecord('workOrderMaterials', key))
  console.log(selectedMaterials)
  // Group materials by preferred vendor
  const materialsByVendor = this.$lodash.groupBy(selectedMaterials, 'preferredVendor')

  // Create POs for each vendor group
  for (const [vendorId, materials] of Object.entries(materialsByVendor)) {
    // Create purchase order
    const poData = {
      vendor: vendorId,
      state: 'New'
    }

    const poKey = await this.$dgAddRow('purchaseOrders', poData)

    // Create purchase lines
    for (const material of materials) {
      const lineData = {
        purchaseOrder: poKey,
        quantity: material.quantityRequired,
        material:material.rowKey,
        unitPrice: material.unitCost,
        part: material.part,
        description: material.description
      }
      console.log('lineData', lineData)

      await this.$dgAddRow('purchaseLines', lineData)
    }
  }
  console.log('test')
  // Show success message
  this.$bvToast.toast('Purchase orders created successfully', {
    title: 'Success',
    variant: 'success',
    solid: true
  })
}