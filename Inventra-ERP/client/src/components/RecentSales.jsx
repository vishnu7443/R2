function RecentSales({ sales = [] }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Recent Sales</h3>
          <p className="text-xs text-slate-400 mt-0.5">Latest completed transactions</p>
        </div>
        {sales.length > 0 && (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {sales.length} entries
          </span>
        )}
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-12 text-slate-300">
          <p className="text-sm">No recent sales to display</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.map((sale, index) => (
                <tr key={index} className="table-row-hover">
                  <td className="py-3.5 pr-4 font-mono text-sm font-semibold text-blue-600">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-3.5 pr-4 text-sm font-medium text-slate-700">
                    {sale.customerName}
                  </td>
                  <td className="py-3.5 pr-4 text-sm font-bold text-slate-900">
                    ₹ {sale.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-sm text-slate-400">
                    {sale.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentSales;