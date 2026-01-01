import { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, TrendingDown, DollarSign, TrendingUp, Percent, Target, Heart } from 'lucide-react';
import InputField from './components/InputField';
import ResultCard from './components/ResultCard';
import ProjectionChart from './components/ProjectionChart';
import Disclaimer from './components/Disclaimer';
import ProgressBar from './components/ProgressBar';

type CalculatorMode = 'standard' | 'coast' | 'barista' | 'savingsRate' | 'reverse' | 'healthcareGap';
type FireType = 'lean' | 'regular' | 'fat';

const getFireType = (annualExpenses: number): FireType => {
  if (annualExpenses <= 40000) return 'lean';
  if (annualExpenses >= 100000) return 'fat';
  return 'regular';
};

const fireTypeInfo = {
  lean: {
    name: 'Lean FIRE',
    icon: TrendingDown,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    description: 'Minimalist lifestyle with low expenses',
    tips: [
      'Focus on geographic arbitrage - consider lower cost-of-living areas',
      'Build frugal habits early - they compound like investments',
      'Healthcare costs are critical - plan carefully for insurance',
      'Small buffer recommended - unexpected costs hit harder at this level',
    ],
    warnings: [
      'Limited flexibility for lifestyle inflation',
      'Higher vulnerability to inflation and cost increases',
      'May require strict budgeting discipline',
    ],
  },
  regular: {
    name: 'Traditional FIRE',
    icon: DollarSign,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Balanced approach with moderate expenses',
    tips: [
      'Maintain a healthy balance between saving and living',
      'Build multiple income streams for added security',
      'Keep 1-2 years of expenses in cash for emergencies',
      'Regular rebalancing keeps your portfolio on track',
    ],
    warnings: [],
  },
  fat: {
    name: 'Fat FIRE',
    icon: TrendingUp,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Luxury lifestyle with high expenses',
    tips: [
      'Consider tax-advantaged accounts and strategies',
      'Diversify across asset classes and geographies',
      'Estate planning becomes increasingly important',
      'Professional financial advice is highly recommended',
    ],
    warnings: [
      'Significantly longer timeline to reach FIRE',
      'Requires high income and aggressive savings rate',
      'Lifestyle creep can derail progress - stay disciplined',
      'Higher net worth may require more complex investment strategies',
    ],
  },
};

interface CalculatorInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  annualExpenses: number;
  annualSavings: number;
  investmentReturn: number;
  partTimeIncome: number;
  targetRetirementAge: number;
  healthcareMonthlyCost: number;
}

const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 30,
  retirementAge: 65,
  currentSavings: 50000,
  annualExpenses: 40000,
  annualSavings: 20000,
  investmentReturn: 7,
  partTimeIncome: 20000,
  targetRetirementAge: 50,
  healthcareMonthlyCost: 500,
};

function App() {
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>('standard');
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  
  // Toggle states for monthly/annual display
  const [expensesMonthly, setExpensesMonthly] = useState(false);
  const [savingsMonthly, setSavingsMonthly] = useState(false);
  const [partTimeMonthly, setPartTimeMonthly] = useState(false);
  const [healthcareAnnual, setHealthcareAnnual] = useState(false);

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlInputs: Partial<CalculatorInputs> = {};
    
    if (params.has('mode')) {
      const mode = params.get('mode');
      if (mode === 'coast' || mode === 'standard' || mode === 'barista' || mode === 'savingsRate' || mode === 'reverse' || mode === 'healthcareGap') {
        setCalculatorMode(mode);
      }
    }
    
    if (params.has('ca')) urlInputs.currentAge = Number(params.get('ca'));
    if (params.has('ra')) urlInputs.retirementAge = Number(params.get('ra'));
    if (params.has('cs')) urlInputs.currentSavings = Number(params.get('cs'));
    if (params.has('ae')) urlInputs.annualExpenses = Number(params.get('ae'));
    if (params.has('as')) urlInputs.annualSavings = Number(params.get('as'));
    if (params.has('ir')) urlInputs.investmentReturn = Number(params.get('ir'));
    if (params.has('pi')) urlInputs.partTimeIncome = Number(params.get('pi'));
    if (params.has('tra')) urlInputs.targetRetirementAge = Number(params.get('tra'));
    if (params.has('hmc')) urlInputs.healthcareMonthlyCost = Number(params.get('hmc'));

    if (Object.keys(urlInputs).length > 0) {
      setInputs((prev) => ({ ...prev, ...urlInputs }));
    }
  }, []);

  // Sync to URL (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set('mode', calculatorMode);
      params.set('ca', inputs.currentAge.toString());
      params.set('ra', inputs.retirementAge.toString());
      params.set('cs', inputs.currentSavings.toString());
      params.set('ae', inputs.annualExpenses.toString());
      params.set('as', inputs.annualSavings.toString());
      params.set('ir', inputs.investmentReturn.toString());
      params.set('pi', inputs.partTimeIncome.toString());
      params.set('tra', inputs.targetRetirementAge.toString());
      params.set('hmc', inputs.healthcareMonthlyCost.toString());
      
      window.history.replaceState({}, '', `?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputs, calculatorMode]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculate FIRE metrics
  const results = useMemo(() => {
    const fireNumber = inputs.annualExpenses * 25;
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    const returnRate = inputs.investmentReturn / 100;

    if (calculatorMode === 'savingsRate') {
      // Savings Rate Calculator: Show how savings rate impacts years to FIRE
      const annualIncome = inputs.annualSavings / 0.3; // Assume current savings rate is 30%
      const savingsRateScenarios = [20, 30, 40, 50, 60, 70].map(rate => {
        const savingsRate = rate / 100;
        const annualSavingsAmount = annualIncome * savingsRate;
        
        // Calculate years to FIRE with this savings rate
        let years = 0;
        let balance = inputs.currentSavings;
        while (balance < fireNumber && years < 100) {
          balance = balance * (1 + returnRate) + annualSavingsAmount;
          years++;
        }
        
        return {
          rate,
          years,
          annualSavings: annualSavingsAmount,
          fireAge: inputs.currentAge + years,
        };
      });

      // Current savings rate
      const currentSavingsRate = (inputs.annualSavings / annualIncome) * 100;
      
      // Projection data for current savings rate
      const projectionData = [];
      let balance = inputs.currentSavings;
      let yearsToFire = 0;
      let fireBalance = inputs.currentSavings;
      while (fireBalance < fireNumber && yearsToFire < 100) {
        fireBalance = fireBalance * (1 + returnRate) + inputs.annualSavings;
        yearsToFire++;
      }
      
      for (let year = 0; year <= yearsToFire; year++) {
        projectionData.push({
          year: inputs.currentAge + year,
          balance: Math.round(balance),
          fireNumber: Math.round(fireNumber),
        });
        
        if (year < yearsToFire) {
          balance = balance * (1 + returnRate) + inputs.annualSavings;
        }
      }

      return {
        mode: 'savingsRate' as const,
        fireNumber,
        annualIncome,
        currentSavingsRate,
        savingsRateScenarios,
        yearsToFire,
        fireAge: inputs.currentAge + yearsToFire,
        projectionData,
      };
    } else if (calculatorMode === 'reverse') {
      // Reverse FIRE: Work backwards from target retirement age
      const yearsUntilTarget = inputs.targetRetirementAge - inputs.currentAge;
      
      // Calculate required annual savings using future value formula
      // FV = PV(1+r)^n + PMT * [((1+r)^n - 1) / r]
      // Solve for PMT: PMT = (FV - PV(1+r)^n) / [((1+r)^n - 1) / r]
      const futureValueOfCurrentSavings = inputs.currentSavings * Math.pow(1 + returnRate, yearsUntilTarget);
      const futureValueFactor = (Math.pow(1 + returnRate, yearsUntilTarget) - 1) / returnRate;
      const requiredAnnualSavings = (fireNumber - futureValueOfCurrentSavings) / futureValueFactor;
      
      // Calculate if achievable
      const isAchievable = requiredAnnualSavings > 0 && requiredAnnualSavings < 1000000;
      
      // Projection data
      const projectionData = [];
      let balance = inputs.currentSavings;
      
      for (let year = 0; year <= yearsUntilTarget; year++) {
        projectionData.push({
          year: inputs.currentAge + year,
          balance: Math.round(balance),
          fireNumber: Math.round(fireNumber),
        });
        
        if (year < yearsUntilTarget) {
          balance = balance * (1 + returnRate) + (isAchievable ? requiredAnnualSavings : inputs.annualSavings);
        }
      }

      const finalBalance = projectionData[projectionData.length - 1].balance;
      const savingsRateNeeded = isAchievable && requiredAnnualSavings > 0 
        ? (requiredAnnualSavings / (requiredAnnualSavings + inputs.annualExpenses)) * 100 
        : 0;

      return {
        mode: 'reverse' as const,
        fireNumber,
        targetRetirementAge: inputs.targetRetirementAge,
        yearsUntilTarget,
        requiredAnnualSavings: Math.max(0, requiredAnnualSavings),
        currentAnnualSavings: inputs.annualSavings,
        savingsGap: Math.max(0, requiredAnnualSavings - inputs.annualSavings),
        isAchievable,
        savingsRateNeeded,
        finalBalance,
        projectionData,
      };
    } else if (calculatorMode === 'healthcareGap') {
      // Healthcare Gap: Calculate costs between early retirement and Medicare at 65
      const medicareAge = 65;
      const earlyRetirementAge = inputs.targetRetirementAge;
      const gapYears = Math.max(0, medicareAge - earlyRetirementAge);
      const monthlyPremium = inputs.healthcareMonthlyCost;
      const annualHealthcareCost = monthlyPremium * 12;
      const totalHealthcareCost = annualHealthcareCost * gapYears;
      const healthcarePortionOfFire = (totalHealthcareCost / fireNumber) * 100;
      
      // Calculate adjusted FIRE number including healthcare
      const adjustedFireNumber = fireNumber + totalHealthcareCost;
      
      // Projection with healthcare costs factored in
      const projectionData = [];
      let balance = inputs.currentSavings;
      let yearsToFire = 0;
      let fireBalance = inputs.currentSavings;
      
      while (fireBalance < adjustedFireNumber && yearsToFire < 100) {
        fireBalance = fireBalance * (1 + returnRate) + inputs.annualSavings;
        yearsToFire++;
      }
      
      for (let year = 0; year <= yearsToFire; year++) {
        projectionData.push({
          year: inputs.currentAge + year,
          balance: Math.round(balance),
          fireNumber: Math.round(adjustedFireNumber),
        });
        
        if (year < yearsToFire) {
          balance = balance * (1 + returnRate) + inputs.annualSavings;
        }
      }

      const hasGap = gapYears > 0;
      const finalBalance = projectionData[projectionData.length - 1].balance;

      return {
        mode: 'healthcareGap' as const,
        fireNumber,
        adjustedFireNumber,
        earlyRetirementAge,
        medicareAge,
        gapYears,
        monthlyPremium,
        annualHealthcareCost,
        totalHealthcareCost,
        healthcarePortionOfFire,
        hasGap,
        yearsToFire,
        fireAge: inputs.currentAge + yearsToFire,
        finalBalance,
        projectionData,
      };
    } else if (calculatorMode === 'barista') {
      // Barista FIRE: Part-time income covers expenses gap
      const expenseGap = Math.max(0, inputs.annualExpenses - inputs.partTimeIncome);
      const baristaFireNumber = expenseGap * 25; // Only need to cover the gap
      const currentShortfall = Math.max(0, baristaFireNumber - inputs.currentSavings);
      const currentSurplus = Math.max(0, inputs.currentSavings - baristaFireNumber);
      
      // Calculate projection with continued savings until Barista FIRE
      const projectionData = [];
      let balance = inputs.currentSavings;
      
      for (let year = 0; year <= yearsToRetirement; year++) {
        projectionData.push({
          year: inputs.currentAge + year,
          balance: Math.round(balance),
          fireNumber: Math.round(baristaFireNumber),
        });
        
        if (year < yearsToRetirement) {
          balance = balance * (1 + returnRate) + inputs.annualSavings;
        }
      }

      const finalBalance = projectionData[projectionData.length - 1].balance;
      const hasReachedBarista = inputs.currentSavings >= baristaFireNumber;
      
      // Calculate years to Barista FIRE
      let yearsToBarista = 0;
      let baristaBalance = inputs.currentSavings;
      while (baristaBalance < baristaFireNumber && yearsToBarista < 100) {
        baristaBalance = baristaBalance * (1 + returnRate) + inputs.annualSavings;
        yearsToBarista++;
      }
      const baristaAge = inputs.currentAge + yearsToBarista;

      return {
        mode: 'barista' as const,
        fireNumber,
        baristaFireNumber,
        expenseGap,
        partTimeIncome: inputs.partTimeIncome,
        currentShortfall,
        currentSurplus,
        finalBalance,
        projectionData,
        hasReachedBarista,
        yearsToBarista,
        baristaAge,
      };
    } else if (calculatorMode === 'coast') {
      // Coast FIRE: Calculate how much you need NOW for it to grow to FIRE number
      const coastFireNumber = fireNumber / Math.pow(1 + returnRate, yearsToRetirement);
      const currentShortfall = Math.max(0, coastFireNumber - inputs.currentSavings);
      const currentSurplus = Math.max(0, inputs.currentSavings - coastFireNumber);
      
      // Calculate projection with NO additional contributions
      const projectionData = [];
      let balance = inputs.currentSavings;
      
      for (let year = 0; year <= yearsToRetirement; year++) {
        projectionData.push({
          year: inputs.currentAge + year,
          balance: Math.round(balance),
          fireNumber: Math.round(fireNumber),
        });
        
        if (year < yearsToRetirement) {
          balance = balance * (1 + returnRate); // No contributions in Coast FIRE
        }
      }

      const finalBalance = projectionData[projectionData.length - 1].balance;
      const hasReachedCoast = inputs.currentSavings >= coastFireNumber;

      return {
        mode: 'coast' as const,
        fireNumber,
        coastFireNumber,
        currentShortfall,
        currentSurplus,
        finalBalance,
        projectionData,
        hasReachedCoast,
        yearsUntilRetirement: yearsToRetirement,
      };
    } else {
      // Standard FIRE calculation
      const projectionData = [];
      let balance = inputs.currentSavings;
      
      for (let year = 0; year <= yearsToRetirement; year++) {
        projectionData.push({
          year: inputs.currentAge + year,
          balance: Math.round(balance),
          fireNumber: Math.round(fireNumber),
        });
        
        if (year < yearsToRetirement) {
          balance = balance * (1 + returnRate) + inputs.annualSavings;
        }
      }

      const finalBalance = projectionData[projectionData.length - 1].balance;
      const shortfall = Math.max(0, fireNumber - finalBalance);
      const surplus = Math.max(0, finalBalance - fireNumber);
      
      // Calculate years to FIRE with current savings rate
      let yearsToFire = 0;
      let fireBalance = inputs.currentSavings;
      while (fireBalance < fireNumber && yearsToFire < 100) {
        fireBalance = fireBalance * (1 + returnRate) + inputs.annualSavings;
        yearsToFire++;
      }
      const fireAge = inputs.currentAge + yearsToFire;

      return {
        mode: 'standard' as const,
        fireNumber,
        yearsToFire,
        fireAge,
        finalBalance,
        shortfall,
        surplus,
        projectionData,
        onTrack: finalBalance >= fireNumber,
      };
    }
  }, [inputs, calculatorMode]);

  const updateInput = (key: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: 'conservative' | 'moderate' | 'aggressive') => {
    const presets = {
      conservative: {
        annualExpenses: 35000,
        annualSavings: 15000,
        investmentReturn: 5,
        currentSavings: 40000,
      },
      moderate: {
        annualExpenses: 45000,
        annualSavings: 25000,
        investmentReturn: 7,
        currentSavings: 60000,
      },
      aggressive: {
        annualExpenses: 30000,
        annualSavings: 40000,
        investmentReturn: 9,
        currentSavings: 80000,
      },
    };
    
    setInputs((prev) => ({ ...prev, ...presets[preset] }));
  };

  const fireType = useMemo(() => getFireType(inputs.annualExpenses), [inputs.annualExpenses]);
  const fireInfo = fireTypeInfo[fireType];
  const FireIcon = fireInfo.icon;

  return (
    <div className="flex min-h-screen bg-[#0f1419]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1f2e] border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">🔥</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">FIRE Calculators</h1>
              <p className="text-gray-400 text-xs">Financial Independence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <h3 className="text-gray-500 text-xs font-semibold uppercase mb-3 px-2">Calculators</h3>
            <div className="space-y-1">
              <button
                onClick={() => setCalculatorMode('standard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  calculatorMode === 'standard'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">🎯</span>
                Standard FIRE
              </button>
              <button
                onClick={() => setCalculatorMode('coast')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  calculatorMode === 'coast'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">🏖️</span>
                Coast FIRE
              </button>
              <button
                onClick={() => setCalculatorMode('lean')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white hover:bg-gray-800`}
              >
                <span className="text-lg">🌱</span>
                Lean FIRE
              </button>
              <button
                onClick={() => setCalculatorMode('fat')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white hover:bg-gray-800`}
              >
                <span className="text-lg">💎</span>
                Fat FIRE
              </button>
              <button
                onClick={() => setCalculatorMode('barista')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  calculatorMode === 'barista'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">☕</span>
                Barista FIRE
              </button>
              <button
                onClick={() => setCalculatorMode('savingsRate')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  calculatorMode === 'savingsRate'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Percent className="w-5 h-5" />
                Savings Rate
              </button>
              <button
                onClick={() => setCalculatorMode('reverse')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  calculatorMode === 'reverse'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Target className="w-5 h-5" />
                Reverse FIRE
              </button>
              <button
                onClick={() => setCalculatorMode('healthcareGap')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  calculatorMode === 'healthcareGap'
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Heart className="w-5 h-5" />
                Healthcare Gap
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🔒</span>
            <span>100% Private & Offline</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">

        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header with mode badge */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${fireInfo.color === 'text-green-600 dark:text-green-400' ? 'from-green-500/20 to-green-600/20 border border-green-500/30' : fireInfo.color === 'text-purple-600 dark:text-purple-400' ? 'from-purple-500/20 to-purple-600/20 border border-purple-500/30' : 'from-blue-500/20 to-blue-600/20 border border-blue-500/30'}`}>
                  <FireIcon className={`w-5 h-5 ${fireInfo.color}`} />
                  <span className={`font-semibold ${fireInfo.color}`}>{fireInfo.name}</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {calculatorMode === 'standard' ? 'Standard FIRE Calculator' : 
                 calculatorMode === 'coast' ? 'Coast FIRE Calculator' : 
                 calculatorMode === 'barista' ? 'Barista FIRE Calculator' :
                 calculatorMode === 'savingsRate' ? 'Savings Rate Calculator' :
                 calculatorMode === 'reverse' ? 'Reverse FIRE Calculator' :
                 'Healthcare Gap Calculator'}
              </h2>
              <p className="text-gray-400">{fireInfo.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Section */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
                  <h3 className="text-white font-semibold mb-4">Your Information</h3>
                  
                  {/* Preset Buttons */}
                  <div className="mb-4 pb-4 border-b border-gray-800">
                    <p className="text-xs text-gray-400 mb-2">Quick Presets</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => applyPreset('conservative')}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-blue-500/20 text-gray-300 hover:text-blue-400 border border-gray-700 hover:border-blue-500/50 transition-colors"
                      >
                        Conservative
                      </button>
                      <button
                        onClick={() => applyPreset('moderate')}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-orange-500/20 text-gray-300 hover:text-orange-400 border border-gray-700 hover:border-orange-500/50 transition-colors"
                      >
                        Moderate
                      </button>
                      <button
                        onClick={() => applyPreset('aggressive')}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-500/50 transition-colors"
                      >
                        Aggressive
                      </button>
                    </div>
                  </div>

              <div className="space-y-4">
                <InputField
                  label="Current Age"
                  value={inputs.currentAge}
                  onChange={(val) => updateInput('currentAge', val)}
                  tooltip="Your current age in years"
                  min={18}
                  max={100}
                  step={1}
                />
                <InputField
                  label="Planned Retirement Age"
                  value={inputs.retirementAge}
                  onChange={(val) => updateInput('retirementAge', val)}
                  tooltip="The age at which you plan to retire"
                  min={inputs.currentAge + 1}
                  max={100}
                  step={1}
                />
                <InputField
                  label="Current Savings"
                  value={inputs.currentSavings}
                  onChange={(val) => updateInput('currentSavings', val)}
                  tooltip="Total amount you currently have saved/invested"
                  prefix="$"
                  min={0}
                  step={1000}
                />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {expensesMonthly ? 'Monthly' : 'Annual'} Expenses
                    </label>
                    <button
                      onClick={() => setExpensesMonthly(!expensesMonthly)}
                      className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                      Switch to {expensesMonthly ? 'Annual' : 'Monthly'}
                    </button>
                  </div>
                  <InputField
                    label=""
                    value={expensesMonthly ? Math.round(inputs.annualExpenses / 12) : inputs.annualExpenses}
                    onChange={(val) => updateInput('annualExpenses', expensesMonthly ? val * 12 : val)}
                    tooltip={expensesMonthly ? 'Your expected monthly expenses in retirement' : 'Your expected annual expenses in retirement'}
                    prefix="$"
                    min={0}
                    step={expensesMonthly ? 100 : 1000}
                  />
                </div>
                {calculatorMode === 'barista' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Part-Time {partTimeMonthly ? 'Monthly' : 'Annual'} Income
                      </label>
                      <button
                        onClick={() => setPartTimeMonthly(!partTimeMonthly)}
                        className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        Switch to {partTimeMonthly ? 'Annual' : 'Monthly'}
                      </button>
                    </div>
                    <InputField
                      label=""
                      value={partTimeMonthly ? Math.round(inputs.partTimeIncome / 12) : inputs.partTimeIncome}
                      onChange={(val) => updateInput('partTimeIncome', partTimeMonthly ? val * 12 : val)}
                      tooltip={partTimeMonthly ? 'Expected monthly income from part-time work' : 'Expected annual income from part-time work (covers expenses gap)'}
                      prefix="$"
                      min={0}
                      step={partTimeMonthly ? 100 : 1000}
                    />
                  </div>
                )}
                {(calculatorMode === 'reverse' || calculatorMode === 'healthcareGap') && (
                  <InputField
                    label="Target Retirement Age"
                    value={inputs.targetRetirementAge}
                    onChange={(val) => updateInput('targetRetirementAge', val)}
                    tooltip="The age you want to retire by"
                    min={inputs.currentAge + 1}
                    max={100}
                    step={1}
                  />
                )}
                {calculatorMode === 'healthcareGap' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Healthcare {healthcareAnnual ? 'Annual' : 'Monthly'} Cost
                      </label>
                      <button
                        onClick={() => setHealthcareAnnual(!healthcareAnnual)}
                        className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        Switch to {healthcareAnnual ? 'Monthly' : 'Annual'}
                      </button>
                    </div>
                    <InputField
                      label=""
                      value={healthcareAnnual ? inputs.healthcareMonthlyCost * 12 : inputs.healthcareMonthlyCost}
                      onChange={(val) => updateInput('healthcareMonthlyCost', healthcareAnnual ? val / 12 : val)}
                      tooltip={healthcareAnnual ? 'Expected annual healthcare cost until Medicare at 65' : 'Expected monthly healthcare premium until Medicare at 65'}
                      prefix="$"
                      min={0}
                      step={healthcareAnnual ? 500 : 50}
                    />
                  </div>
                )}
                {(calculatorMode === 'standard' || calculatorMode === 'barista' || calculatorMode === 'savingsRate' || calculatorMode === 'reverse' || calculatorMode === 'healthcareGap') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {savingsMonthly ? 'Monthly' : 'Annual'} Savings
                      </label>
                      <button
                        onClick={() => setSavingsMonthly(!savingsMonthly)}
                        className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                      >
                        Switch to {savingsMonthly ? 'Annual' : 'Monthly'}
                      </button>
                    </div>
                    <InputField
                      label=""
                      value={savingsMonthly ? Math.round(inputs.annualSavings / 12) : inputs.annualSavings}
                      onChange={(val) => updateInput('annualSavings', savingsMonthly ? val * 12 : val)}
                      tooltip={savingsMonthly ? 'Amount you save/invest each month' : 'Amount you save/invest each year'}
                      prefix="$"
                      min={0}
                      step={savingsMonthly ? 100 : 1000}
                    />
                  </div>
                )}
                <InputField
                  label="Expected Return"
                  value={inputs.investmentReturn}
                  onChange={(val) => updateInput('investmentReturn', val)}
                  tooltip="Expected annual investment return (inflation-adjusted)"
                  suffix="%"
                  min={0}
                  max={20}
                  step={0.5}
                />
              </div>
            </div>
          </div>

              {/* Results Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Key Metrics */}
                {calculatorMode === 'savingsRate' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ResultCard
                        title="FIRE Number"
                        value={`$${results.fireNumber.toLocaleString()}`}
                        description="25x your annual expenses"
                        variant="primary"
                      />
                      <ResultCard
                        title="Current Savings Rate"
                        value={`${'currentSavingsRate' in results ? results.currentSavingsRate.toFixed(1) : 0}%`}
                        description={`Annual income: $${'annualIncome' in results ? Math.round(results.annualIncome).toLocaleString() : 0}`}
                        variant="primary"
                      />
                      <ResultCard
                        title="Years to FIRE"
                        value={'yearsToFire' in results ? results.yearsToFire : 0}
                        description={`FIRE at age ${'fireAge' in results ? results.fireAge : 0}`}
                        variant="success"
                      />
                      <ResultCard
                        title="Annual Savings"
                        value={`$${inputs.annualSavings.toLocaleString()}`}
                        description="Your current savings amount"
                        variant="success"
                      />
                    </div>
                    {/* Savings Rate Scenarios Table */}
                    <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
                      <h3 className="text-white font-semibold mb-4">Savings Rate Impact</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-800">
                              <th className="text-left text-gray-400 font-medium pb-3">Savings Rate</th>
                              <th className="text-left text-gray-400 font-medium pb-3">Annual Savings</th>
                              <th className="text-left text-gray-400 font-medium pb-3">Years to FIRE</th>
                              <th className="text-left text-gray-400 font-medium pb-3">FIRE Age</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-300">
                            {'savingsRateScenarios' in results && results.savingsRateScenarios.map((scenario) => (
                              <tr key={scenario.rate} className="border-b border-gray-800/50">
                                <td className="py-3 font-semibold">{scenario.rate}%</td>
                                <td className="py-3">${Math.round(scenario.annualSavings).toLocaleString()}</td>
                                <td className="py-3">{scenario.years} years</td>
                                <td className="py-3">{scenario.fireAge}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <ProgressBar 
                      current={inputs.currentSavings} 
                      target={results.fireNumber} 
                      label="Progress to FIRE" 
                    />
                    <Disclaimer />
                  </>
                ) : calculatorMode === 'reverse' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ResultCard
                      title="FIRE Number"
                      value={`$${results.fireNumber.toLocaleString()}`}
                      description="25x your annual expenses"
                      variant="primary"
                    />
                    <ResultCard
                      title="Target Retirement Age"
                      value={'targetRetirementAge' in results ? results.targetRetirementAge : 0}
                      description={`In ${'yearsUntilTarget' in results ? results.yearsUntilTarget : 0} years`}
                      variant="primary"
                    />
                    <ResultCard
                      title="Required Annual Savings"
                      value={`$${'requiredAnnualSavings' in results ? Math.round(results.requiredAnnualSavings).toLocaleString() : 0}`}
                      description={`Savings rate: ${'savingsRateNeeded' in results ? results.savingsRateNeeded.toFixed(1) : 0}%`}
                      variant={'isAchievable' in results && results.isAchievable ? 'success' : 'warning'}
                    />
                    <ResultCard
                      title="Current Annual Savings"
                      value={`$${'currentAnnualSavings' in results ? results.currentAnnualSavings.toLocaleString() : 0}`}
                      description={`Gap: $${'savingsGap' in results ? Math.round(results.savingsGap).toLocaleString() : 0}`}
                      variant={'isAchievable' in results && results.savingsGap <= 0 ? 'success' : 'warning'}
                    />
                    <ProgressBar 
                      current={inputs.currentSavings} 
                      target={results.fireNumber} 
                      label="Progress to FIRE" 
                    />
                    <Disclaimer />
                  </div>
                ) : calculatorMode === 'healthcareGap' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ResultCard
                      title="Healthcare Gap Years"
                      value={'gapYears' in results ? results.gapYears : 0}
                      description={`From age ${'earlyRetirementAge' in results ? results.earlyRetirementAge : 0} to ${'medicareAge' in results ? results.medicareAge : 0}`}
                      variant="primary"
                    />
                    <ResultCard
                      title="Monthly Premium"
                      value={`$${'monthlyPremium' in results ? results.monthlyPremium.toLocaleString() : 0}`}
                      description={`$${'annualHealthcareCost' in results ? results.annualHealthcareCost.toLocaleString() : 0}/year`}
                      variant="primary"
                    />
                    <ResultCard
                      title="Total Healthcare Cost"
                      value={`$${'totalHealthcareCost' in results ? Math.round(results.totalHealthcareCost).toLocaleString() : 0}`}
                      description={`${'healthcarePortionOfFire' in results ? results.healthcarePortionOfFire.toFixed(1) : 0}% of FIRE portfolio`}
                      variant="warning"
                    />
                    <ResultCard
                      title="Adjusted FIRE Number"
                      value={`$${'adjustedFireNumber' in results ? Math.round(results.adjustedFireNumber).toLocaleString() : 0}`}
                      description={`Including healthcare costs`}
                      variant="primary"
                    />
                    <ProgressBar 
                      current={inputs.currentSavings} 
                      target={'adjustedFireNumber' in results ? results.adjustedFireNumber : results.fireNumber} 
                      label="Progress to Adjusted FIRE" 
                    />
                    <Disclaimer />
                  </div>
                ) : calculatorMode === 'standard' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  title="FIRE Number"
                  value={`$${results.fireNumber.toLocaleString()}`}
                  description="25x your annual expenses"
                  variant="primary"
                />
                <ResultCard
                  title="Years to FIRE"
                  value={'yearsToFire' in results ? results.yearsToFire : 0}
                  description={`You'll reach FIRE at age ${'fireAge' in results ? results.fireAge : 0}`}
                  variant="success"
                />
                <ResultCard
                  title="Projected Balance"
                  value={`$${results.finalBalance.toLocaleString()}`}
                  description={`At age ${inputs.retirementAge}`}
                  variant={'onTrack' in results && results.onTrack ? 'success' : 'warning'}
                />
                <ResultCard
                  title={'onTrack' in results && results.onTrack ? 'Surplus' : 'Shortfall'}
                  value={`$${('onTrack' in results && results.onTrack ? results.surplus : results.shortfall).toLocaleString()}`}
                  description={'onTrack' in results && results.onTrack ? 'Extra cushion' : 'Additional savings needed'}
                  variant={'onTrack' in results && results.onTrack ? 'success' : 'warning'}
                />
                <ProgressBar 
                  current={inputs.currentSavings} 
                  target={results.fireNumber} 
                  label="Progress to FIRE" 
                />
                <Disclaimer />
              </div>
            ) : calculatorMode === 'barista' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  title="Barista FIRE Number"
                  value={`$${'baristaFireNumber' in results ? results.baristaFireNumber.toLocaleString() : 0}`}
                  description="Your reduced portfolio target"
                  variant="primary"
                />
                <ResultCard
                  title="Years to Barista FIRE"
                  value={'yearsToBarista' in results ? results.yearsToBarista : 0}
                  description={`Reach Barista FIRE at age ${'baristaAge' in results ? results.baristaAge : 0}`}
                  variant="success"
                />
                <ResultCard
                  title="Part-Time Income"
                  value={`$${'partTimeIncome' in results ? results.partTimeIncome.toLocaleString() : 0}`}
                  description={`Covers ${'expenseGap' in results ? ((results.partTimeIncome / inputs.annualExpenses) * 100).toFixed(0) : 0}% of expenses`}
                  variant="success"
                />
                <ResultCard
                  title={'hasReachedBarista' in results && results.hasReachedBarista ? 'Ready!' : 'Needed'}
                  value={`$${('hasReachedBarista' in results && results.hasReachedBarista ? results.currentSurplus : results.currentShortfall).toLocaleString()}`}
                  description={'hasReachedBarista' in results && results.hasReachedBarista ? 'You can start Barista FIRE!' : 'Additional savings needed'}
                  variant={'hasReachedBarista' in results && results.hasReachedBarista ? 'success' : 'warning'}
                />
                <ProgressBar 
                  current={inputs.currentSavings} 
                  target={'baristaFireNumber' in results ? results.baristaFireNumber : results.fireNumber} 
                  label="Progress to Barista FIRE" 
                />
                <Disclaimer />
              </div>
            ) : calculatorMode === 'coast' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultCard
                  title="FIRE Number"
                  value={`$${results.fireNumber.toLocaleString()}`}
                  description="25x your annual expenses"
                  variant="primary"
                />
                <ResultCard
                  title="Coast FIRE Number"
                  value={`$${'coastFireNumber' in results ? Math.round(results.coastFireNumber).toLocaleString() : 0}`}
                  description="What you need saved NOW"
                  variant="primary"
                />
                <ResultCard
                  title="Current Savings"
                  value={`$${inputs.currentSavings.toLocaleString()}`}
                  description={'hasReachedCoast' in results && results.hasReachedCoast ? 'You\'ve reached Coast FIRE!' : 'Keep saving to reach Coast'}
                  variant={'hasReachedCoast' in results && results.hasReachedCoast ? 'success' : 'warning'}
                />
                <ResultCard
                  title={'hasReachedCoast' in results && results.hasReachedCoast ? 'Surplus' : 'Needed'}
                  value={`$${('hasReachedCoast' in results && results.hasReachedCoast ? Math.round(results.currentSurplus) : Math.round(results.currentShortfall)).toLocaleString()}`}
                  description={'hasReachedCoast' in results && results.hasReachedCoast ? 'Extra cushion above Coast' : 'Additional savings to reach Coast'}
                  variant={'hasReachedCoast' in results && results.hasReachedCoast ? 'success' : 'warning'}
                />
                <ProgressBar 
                  current={inputs.currentSavings} 
                  target={'coastFireNumber' in results ? results.coastFireNumber : results.fireNumber} 
                  label="Progress to Coast FIRE" 
                />
                <Disclaimer />
              </div>
            ) : null}

                {/* Projection Chart */}
                <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
                  <h3 className="text-white font-semibold mb-4">
                    {calculatorMode === 'standard'
                      ? 'Savings Projection'
                      : calculatorMode === 'barista'
                      ? 'Barista FIRE Growth Projection'
                      : calculatorMode === 'coast'
                      ? 'Coast FIRE Growth (No Contributions)'
                      : calculatorMode === 'savingsRate'
                      ? 'Savings Growth at Current Rate'
                      : calculatorMode === 'reverse'
                      ? 'Path to Target Retirement'
                      : 'Adjusted FIRE Projection'}
                  </h3>
                  <ProjectionChart data={results.projectionData} />
                </div>

                {/* Explanation */}
                <div className="bg-orange-500/10 rounded-xl border border-orange-500/20 p-6">
              {calculatorMode === 'savingsRate' ? (
                <>
                  <h3 className="font-semibold text-orange-500 mb-2">
                    About Savings Rate
                  </h3>
                  <p className="text-sm text-gray-300">
                    Your savings rate is the most powerful lever for FIRE. The table above shows how different 
                    savings rates dramatically impact your timeline. At a {'currentSavingsRate' in results ? results.currentSavingsRate.toFixed(1) : 0}% 
                    savings rate, you'll reach FIRE in <strong className="text-white">{'yearsToFire' in results ? results.yearsToFire : 0} years</strong>. 
                    Increasing your savings rate by just 10% can shave years off your journey!
                  </p>
                </>
              ) : calculatorMode === 'reverse' ? (
                <>
                  <h3 className="font-semibold text-orange-500 mb-2">
                    About Reverse FIRE
                  </h3>
                  <p className="text-sm text-gray-300">
                    Working backwards from your target retirement age of <strong className="text-white">{'targetRetirementAge' in results ? results.targetRetirementAge : 0}</strong>, 
                    you need to save <strong className="text-white">${'requiredAnnualSavings' in results ? Math.round(results.requiredAnnualSavings).toLocaleString() : 0}</strong> per year. 
                    {'isAchievable' in results && !results.isAchievable ? (
                      <> This may not be achievable with your current situation. Consider adjusting your target retirement age, 
                      increasing current savings, or reducing annual expenses.</>
                    ) : (
                      <> This represents a savings rate of <strong className="text-white">{'savingsRateNeeded' in results ? results.savingsRateNeeded.toFixed(1) : 0}%</strong>.</>
                    )}
                  </p>
                </>
              ) : calculatorMode === 'healthcareGap' ? (
                <>
                  <h3 className="font-semibold text-orange-500 mb-2">
                    About Healthcare Gap
                  </h3>
                  <p className="text-sm text-gray-300">
                    {'hasGap' in results && results.hasGap ? (
                      <>
                        Retiring at age <strong className="text-white">{'earlyRetirementAge' in results ? results.earlyRetirementAge : 0}</strong> means 
                        <strong className="text-white"> {'gapYears' in results ? results.gapYears : 0} years</strong> until Medicare eligibility at 65. 
                        At <strong className="text-white">${'monthlyPremium' in results ? results.monthlyPremium.toLocaleString() : 0}/month</strong>, 
                        your total healthcare cost will be <strong className="text-white">${'totalHealthcareCost' in results ? Math.round(results.totalHealthcareCost).toLocaleString() : 0}</strong>. 
                        This is <strong className="text-white">{'healthcarePortionOfFire' in results ? results.healthcarePortionOfFire.toFixed(1) : 0}%</strong> of 
                        your FIRE portfolio—a critical factor in early retirement planning.
                      </>
                    ) : (
                      <>
                        Your target retirement age is at or after 65, so you won't have a healthcare gap before Medicare eligibility. 
                        You'll be able to enroll in Medicare immediately upon retirement.
                      </>
                    )}
                  </p>
                </>
              ) : calculatorMode === 'standard' ? (
                <>
                  <h3 className="font-semibold text-orange-500 mb-2">
                    About the 25x Rule
                  </h3>
                  <p className="text-sm text-gray-300">
                    The FIRE movement uses the "25x rule" based on the 4% safe withdrawal rate. 
                    If you have 25 times your annual expenses saved, you can withdraw 4% per year 
                    indefinitely. Your FIRE number is <strong className="text-white">${results.fireNumber.toLocaleString()}</strong> 
                    (25 × ${inputs.annualExpenses.toLocaleString()}).
                  </p>
                </>
              ) : calculatorMode === 'barista' ? (
                <>
                  <h3 className="font-semibold text-orange-500 mb-2">
                    About Barista FIRE
                  </h3>
                  <p className="text-sm text-gray-300">
                    Barista FIRE means working part-time to cover some expenses while your portfolio covers the rest. 
                    With part-time income of <strong className="text-white">${'partTimeIncome' in results ? results.partTimeIncome.toLocaleString() : 0}</strong>, 
                    you only need <strong className="text-white">${'baristaFireNumber' in results ? results.baristaFireNumber.toLocaleString() : 0}</strong> saved 
                    (25x the <strong className="text-white">${'expenseGap' in results ? results.expenseGap.toLocaleString() : 0}</strong> gap). 
                    This is much faster than traditional FIRE and often includes health insurance benefits!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-orange-500 mb-2">
                    About Coast FIRE
                  </h3>
                  <p className="text-sm text-gray-300">
                    Coast FIRE means you have enough saved NOW that compound growth will reach your FIRE number 
                    by retirement—without any additional contributions. Your Coast FIRE number is{' '}
                    <strong className="text-white">${'coastFireNumber' in results ? Math.round(results.coastFireNumber).toLocaleString() : 0}</strong>.{' '}
                    {('yearsUntilRetirement' in results && results.yearsUntilRetirement > 0) && (
                      <>
                        Over {results.yearsUntilRetirement} years at {inputs.investmentReturn}% return, this grows to your 
                        FIRE goal of ${results.fireNumber.toLocaleString()}.
                      </>
                    )}
                  </p>
                </>
              )}
            </div>

                {/* FIRE Type Tips & Warnings */}
                <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
                  <h3 className={`font-semibold mb-3 ${fireInfo.color}`}>
                {fireInfo.name} Insights
              </h3>
              
              {/* Tips */}
              {fireInfo.tips.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    💡 Tips for Success
                  </h4>
                  <ul className="space-y-1.5">
                    {fireInfo.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {fireInfo.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ⚠️ Important Considerations
                  </h4>
                  <ul className="space-y-1.5">
                    {fireInfo.warnings.map((warning, index) => (
                      <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
