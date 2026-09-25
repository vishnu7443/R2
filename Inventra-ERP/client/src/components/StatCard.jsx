function StatCard({ title, value, icon: Icon, gradient, trend, trendLabel }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${gradient}`}>
      {/* Background glow orb */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">{title}</p>
          <h2 className="text-3xl font-black mt-2 tracking-tight">{value}</h2>
          {trendLabel && (
            <p className="text-xs mt-2 text-white/60 font-medium">{trendLabel}</p>
          )}
        </div>

        {Icon && (
          <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
            <Icon size={26} className="text-white" />
          </div>
        )}
      </div>

      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );
}

export default StatCard;