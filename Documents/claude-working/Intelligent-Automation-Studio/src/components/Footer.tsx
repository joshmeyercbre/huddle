export default function Footer() {
  return (
    <footer className="bg-cbre-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cbre-green rounded flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <div className="text-white font-semibold">CBRE Automations Team</div>
              <div className="text-gray-400 text-sm">GWS - On Demand</div>
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-gray-400 text-sm">
              Intelligent Automation Studio
            </div>
            <div className="text-gray-500 text-xs mt-1">
              &copy; {new Date().getFullYear()} CBRE Group, Inc.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
