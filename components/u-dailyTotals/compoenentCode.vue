<template>
  <div> 
    <h3 class="heading-totals">Total Sales Orders for Today</h3>
    <p>Total Amount: ${{ totalSalesOrdersAmount }}</p>
    <b-progress :value="totalSalesOrdersAmount" :max="7000" class="w-100" style="margin-bottom:16px !important"></b-progress>
    <p>Target Amount: $7000</p>
    <h3>Total Completed Work Orders for Today</h3>
    <p>Total Amount: ${{ totalWorkOrdersAmount }}</p>
    <b-progress :value="totalWorkOrdersAmount" :max="7000" class="w-100" style="margin-bottom:16px !important"></b-progress>
    <p>Target Amount: $7000</p>
  </div>
</template>

<script>
module.exports = {
  data() {
    return {
      salesOrders: [],
      workOrders: []
    };
  },
  computed: {
    totalSalesOrdersAmount() {
      return this.salesOrders.reduce((total, order) => total + order.totalQuoteLinePrice, 0);
    },
    totalWorkOrdersAmount() {
      return this.workOrders.reduce((total, order) => total + order.totalLineAmount, 0);
    } 
  },
  created() {
    this.fetchSalesOrders();
    this.fetchWorkOrders();
  },
  methods: {
    fetchSalesOrders() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const salesOrders = $getGrid('opportunities')
        .filter(order => 
          new Date(order.quoteDate) >= today
        );

      this.salesOrders = salesOrders;
    },
    fetchWorkOrders() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const workOrders = $getGrid('opportunityLines')
        .filter(order => 
          new Date(order.completedDate) >= today
        );
        console.log('Work Orders', workOrders)
      this.workOrders = workOrders;
    }
  }
}
</script>

<style>
.heading-totals {
  margin-top: 10px;
}
</style>
