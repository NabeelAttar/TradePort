import GeographicalMapChart from "../../shared/components/charts/GeographicalMap";
import SalesChart from "../../shared/components/charts/SaleChart";
import DeviceUsageChart from "../../shared/components/charts/DeviceUsage";
import RecentOrdersTable from "../../shared/components/charts/RecentOrdersTables";

const DashboardPage = () => {
  return (
    <div className="p-6 text-white space-y-6">
      {/* Top row: Revenue + Device Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold">Revenue Analytics</h2>
          <p className="text-sm text-slate-400 mb-4">Last 6 months performance</p>
          <SalesChart />
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <DeviceUsageChart />
        </div>
      </div>

      {/* Bottom row: Map + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold">User & Seller Distribution</h2>
          <p className="text-sm text-slate-400 mb-4">Visual breakdown of global user & seller activity.</p>
          <GeographicalMapChart />
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <p className="text-sm text-slate-400 mb-4">A quick snapshot of your latest transactions.</p>
          <RecentOrdersTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
