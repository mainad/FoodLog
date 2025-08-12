import { useState } from 'react';

function toKg(value, unit) {
  if (unit === 'lbs') return value * 0.453592;
  return value;
}

export default function GoalWizard({ onSave, initial }) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(initial?.age || 59);
  const [gender, setGender] = useState(initial?.gender || 'female');
  const [height, setHeight] = useState(initial?.height || 178);
  const [heightUnit, setHeightUnit] = useState(initial?.heightUnit || 'cm');
  const [weight, setWeight] = useState(initial?.weight || 78);
  const [weightUnit, setWeightUnit] = useState(initial?.weightUnit || 'kg');
  const [activity, setActivity] = useState(initial?.activity || 'sedentary');
  const [goal, setGoal] = useState(initial?.goal || 'lose');

  const compute = () => {
    // Mifflin-St Jeor BMR
    const wkg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
    const hcm = heightUnit === 'in' ? height * 2.54 : height;
    let bmr;
    if (gender === 'female') {
      bmr = 10 * wkg + 6.25 * hcm - 5 * age - 161;
    } else {
      bmr = 10 * wkg + 6.25 * hcm - 5 * age + 5;
    }
    const activityMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
    const tdee = bmr * (activityMap[activity] || 1.2);
    let targetCal = tdee;
    if (goal === 'lose') targetCal = tdee - 500;
    if (goal === 'gain') targetCal = tdee + 400;
    // macros: protein 1.2g/kg, fat 25% cal, rest carbs
    const protein = Math.round(1.2 * wkg);
    const fat = Math.round((targetCal * 0.25) / 9);
    const carbs = Math.round((targetCal - protein*4 - fat*9) / 4);
    const goals = {
      calories: Math.round(targetCal),
      protein, carbs, fat,
      fiber: 25,
      sodium: 1500,
      calcium: 1000,
      iron: 18,
      potassium: 3500,
      vitaminD: 20
    };
    return goals;
  };

  const next = () => setStep(step + 1);
  const prev = () => setStep(Math.max(0, step-1));

  if (step === 0) return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h3 className="font-semibold">Tell us a few things</h3>
      <div className="mt-3 space-y-2">
        <label className="text-sm">Age</label>
        <input type="number" value={age} onChange={(e)=>setAge(Number(e.target.value))} className="w-full p-2 border rounded"/>
        <label className="text-sm">Gender</label>
        <select value={gender} onChange={(e)=>setGender(e.target.value)} className="w-full p-2 border rounded">
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-sm">Height</label>
            <input type="number" value={height} onChange={(e)=>setHeight(Number(e.target.value))} className="w-full p-2 border rounded"/>
            <select value={heightUnit} onChange={(e)=>setHeightUnit(e.target.value)} className="w-full mt-1 p-2 border rounded">
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm">Weight</label>
            <input type="number" value={weight} onChange={(e)=>setWeight(Number(e.target.value))} className="w-full p-2 border rounded"/>
            <select value={weightUnit} onChange={(e)=>setWeightUnit(e.target.value)} className="w-full mt-1 p-2 border rounded">
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-sm">Activity</label>
            <select value={activity} onChange={(e)=>setActivity(e.target.value)} className="w-full p-2 border rounded">
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very">Very active</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm">Goal</label>
            <select value={goal} onChange={(e)=>setGoal(e.target.value)} className="w-full p-2 border rounded">
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={next} className="px-3 py-2 bg-rose-500 text-white rounded">Next</button>
        </div>
      </div>
    </div>
  );

  if (step === 1) {
    const goals = compute();
    return (
      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="font-semibold">Your suggested goals</h3>
        <div className="mt-3 space-y-2">
          <div>Calories: <strong>{goals.calories} kcal</strong></div>
          <div>Protein: <strong>{goals.protein} g</strong></div>
          <div>Carbs: <strong>{goals.carbs} g</strong></div>
          <div>Fat: <strong>{goals.fat} g</strong></div>
          <div className="flex justify-between mt-3">
            <button onClick={prev} className="px-3 py-2 border rounded">Back</button>
            <button onClick={()=>{ onSave(goals); }} className="px-3 py-2 bg-emerald-500 text-white rounded">Use these goals</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
