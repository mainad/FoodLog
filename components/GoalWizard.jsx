import { useState } from 'react';
export default function GoalWizard({ onSave, initial }) {
  const [age, setAge] = useState(initial?.age || 30);
  const [gender, setGender] = useState(initial?.gender || 'female');
  const [height, setHeight] = useState(initial?.height || 170);
  const [heightUnit, setHeightUnit] = useState(initial?.heightUnit || 'cm');
  const [weight, setWeight] = useState(initial?.weight || 70);
  const [weightUnit, setWeightUnit] = useState(initial?.weightUnit || 'kg');
  const [activity, setActivity] = useState(initial?.activity || 'sedentary');
  const [goal, setGoal] = useState(initial?.goal || 'maintain');

  const compute = () => {
    const wkg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
    const hcm = heightUnit === 'in' ? height * 2.54 : height;
    let bmr = gender === 'female'
      ? (10 * wkg + 6.25 * hcm - 5 * age - 161)
      : (10 * wkg + 6.25 * hcm - 5 * age + 5);
    const activityMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
    const tdee = bmr * (activityMap[activity] || 1.2);
    let targetCal = tdee;
    if (goal === 'lose') targetCal -= 500;
    if (goal === 'gain') targetCal += 400;
    const protein = Math.round(1.2 * wkg);
    const fat = Math.round((targetCal * 0.25) / 9);
    const carbs = Math.round((targetCal - protein*4 - fat*9) / 4);
    return { calories: Math.round(targetCal), protein, carbs, fat, fiber: 25, sodium: 1500 };
  };

  const goals = compute();

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h3 className="font-semibold">Set your goals</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div><label className="text-sm">Age</label><input type="number" value={age} onChange={e=>setAge(+e.target.value)} className="w-full p-2 border rounded"/></div>
        <div><label className="text-sm">Gender</label>
          <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full p-2 border rounded">
            <option value="female">Female</option><option value="male">Male</option>
          </select>
        </div>
        <div><label className="text-sm">Height</label><input type="number" value={height} onChange={e=>setHeight(+e.target.value)} className="w-full p-2 border rounded"/></div>
        <div><label className="text-sm">Height unit</label>
          <select value={heightUnit} onChange={e=>setHeightUnit(e.target.value)} className="w-full p-2 border rounded"><option value="cm">cm</option><option value="in">in</option></select>
        </div>
        <div><label className="text-sm">Weight</label><input type="number" value={weight} onChange={e=>setWeight(+e.target.value)} className="w-full p-2 border rounded"/></div>
        <div><label className="text-sm">Weight unit</label>
          <select value={weightUnit} onChange={e=>setWeightUnit(e.target.value)} className="w-full p-2 border rounded"><option value="kg">kg</option><option value="lbs">lbs</option></select>
        </div>
        <div><label className="text-sm">Activity</label>
          <select value={activity} onChange={e=>setActivity(e.target.value)} className="w-full p-2 border rounded">
            <option value="sedentary">Sedentary</option><option value="light">Light</option>
            <option value="moderate">Moderate</option><option value="active">Active</option><option value="very">Very</option>
          </select>
        </div>
        <div><label className="text-sm">Goal</label>
          <select value={goal} onChange={e=>setGoal(e.target.value)} className="w-full p-2 border rounded">
            <option value="lose">Lose</option><option value="maintain">Maintain</option><option value="gain">Gain</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={()=>onSave(goals)} className="px-3 py-2 bg-emerald-500 text-white rounded">Use these goals</button>
      </div>
    </div>
  );
}
