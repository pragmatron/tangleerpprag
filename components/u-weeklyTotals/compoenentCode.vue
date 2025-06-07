<template>
  <div> 
    <h3 class="heading-totals">Total Sales Orders for This Week</h3>
    <p>Total Amount: ${{ totalSalesOrdersAmount }}</p>
    <b-progress :value="totalSalesOrdersAmount" :max="targetAmount" class="w-100" style="margin-bottom:16px !important"></b-progress>
    <p>Target Amount: ${{ targetAmount }}</p>
    <h3>Total Completed Work Orders for This Week</h3>
    <p>Total Amount: ${{ totalWorkOrdersAmount }}</p>
    <b-progress :value="totalWorkOrdersAmount" :max="targetAmount" class="w-100" style="margin-bottom:16px !important"></b-progress>
    <p>Target Amount: ${{ targetAmount }}</p>
  </div>
</template>

<script>
module.exports = {
  data() {
    return {
      salesOrders: [],
      workOrders: [],
      targetAmount: 35000 // Assuming a static target for simplicity, adjust as needed
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
    getWeekRange() {
      const now = new Date();
      const dayOfWeek = now.getDay(); // Sunday - 0, Monday - 1, etc.
      const startOfWeek = new Date(now);
      const endOfWeek = new Date(now);

      // Adjust to Monday of this week
      startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      // Adjust to Friday of this week
      endOfWeek.setDate(now.getDate() + (5 - dayOfWeek));
      endOfWeek.setHours(23, 59, 59, 999);

      return { startOfWeek, endOfWeek };
    },
    fetchSalesOrders() {
      const { startOfWeek, endOfWeek } = this.getWeekRange();

      const salesOrders = $getGrid('opportunities')
        .filter(order =>  
          new Date(order.quoteDate) >= startOfWeek &&
          new Date(order.quoteDate) <= endOfWeek
        );

      this.salesOrders = salesOrders;
    },
    fetchWorkOrders() {
      const { startOfWeek, endOfWeek } = this.getWeekRange();

      const workOrders = $getGrid('opportunityLines')
        .filter(order => 
          new Date(order.completedDate) >= startOfWeek &&
          new Date(order.completedDate) <= endOfWeek
        );

      this.workOrders = workOrders;
    }
  }
}
</script>