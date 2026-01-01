import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-500 mb-2">Important Disclaimer</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            This calculator provides hypothetical projections for educational purposes only and does not constitute financial advice. 
            Results are based on assumptions that may not reflect your actual circumstances. Past performance does not guarantee 
            future results. Please consult with a qualified financial advisor before making any investment or retirement decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
