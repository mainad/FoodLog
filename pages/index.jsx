import { useEffect, useState, useRef } from 'react';
import ProgressBar from '../components/ProgressBar';
import GoalWizard from '../components/GoalWizard';
import HistoryChart from '../components/HistoryChart';

function formatDateKey(d = new Date()) {
  return d.toISOString().slice(0,10);
}

function extractNutrients(food) {
  const map = { energy: 0, protein: 0, carbs: 0, fat: 0, fiber:0, sodium:0, calcium:0, iron:0, potassium:0, vitaminD:0 };
  (food.foodNutrients || []).forEach(n => {
    const name = (n.nutrientName || '').toLowerCase();
    const amt = Number(n.value ?? n.amount ?? 0);
    if (name.includes('energy') || name.includes('kcal')) map.energy = amt;
    else if (name.includes('protein')) map.protein = amt;
    else if (name.includes('carbohydrate')) map.carbs = amt;
    else if (name.includes('total lipid') || name.includes('fat')) map.fat = amt;
    else if (name.includes('fiber')) map.fiber = amt;
    else if (name.includes('sodium')) map.sodium = amt;
    else if (name.includes('calcium')) map.calcium = amt;
    else if (name.includes('iron')) map.iron = amt;
    else if (name.includes('potassium')) map.potassium = amt;
    else if (name.includes('vitamin d') || name.includes('vit d')) map.vitaminD = amt;
  });
  return map;
}

function parseVoiceItems(transcript) {
  if (!transcript) return [];
  const parts = transcript.split(/,| and /i).map(s=>s.trim()).filter(Boolean);
  const wordNums = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,half:0.5};
  return parts.map(phrase=>{
    const m = phrase.match(/^(\\d+(?:\\.\\d+)?)\\s*(g|gram|grams|kg|cup|cups|tbsp|tablespoon|tsp|teaspoon|slice|slices)?\\s*(.*)$/i);
    let qty=1, unit='serving', name=phrase;
    if (m) {
      qty = parseFloat(m[1]);
      unit = m[2] || 'serving';
      name = m[3] || '';
    } else {
      // try word numbers
      const wm = phrase.match(/^(one|two|three|four|five|six|seven|eight|nine|ten|half)\\s+(.*)/i);
      if (wm) {
        qty = wordNums[wm[1].toLowerCase()] || 1;
        name = wm[2];
        unit = 'serving';
      } else {
        name = phrase;
      }
    }
    return { qty, unit, name: name.trim() };
  });
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState('serving');
  const [log, setLog] = useState(()=>{ try { return JSON.parse(localStorage.getItem('qf_log')||'{}'); } catch { return {}; }});
  const [goals, setGoals] = useState(()=>{ try { return JSON.parse(localStorage.getItem('qf_goals')||'null'); } catch { return null; }});
  const todayKey = formatDateKey();
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(()=>{ localStorage.setItem('qf_log', JSON.stringify(log)); }, [log]);
  useEffect(()=>{ localStorage.setItem('qf_goals', JSON.stringify(goals)); }, [goals]);

  // search when query changes
  useEffect(()=>{
    const controller = new AbortController();
    if (!query) { setSearchResults([]); return; }
    const t = setTimeout(async ()=>{
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = await res.json();
        setSearchResults(data.items || []);
      } catch(e){}
    }, 300);
    return ()=>{ clearTimeout(t); controller.abort(); };
  }, [query]);

  const addFoodFromSearch = async (item, qtyLocal=1, unitLocal='serving')=>{
    // fetch details
    const r = await fetch(`/api/food/${item.id}`);
    const details = await r.json();
    const base = extractNutrients(details);
    // Fix: correctly scale nutrients based on servingSize or 100g
    const servingSize = details.servingSize || 100;
    let multiplier = 1;
    if (unitLocal === 'g') {
      multiplier = qtyLocal / servingSize;
    } else {
      multiplier = qtyLocal;
    }
    const scaled = {
      calories: (base.energy||0) * multiplier,
      protein: (base.protein||0) * multiplier,
      carbs: (base.carbs||0) * multiplier,
      fat: (base.fat||0) * multiplier,
      fiber: (base.fiber||0) * multiplier,
      sodium: (base.sodium||0) * multiplier,
      calcium: (base.calcium||0) * multiplier,
      iron: (base.iron||0) * multiplier,
      potassium: (base.potassium||0) * multiplier,
      vitaminD: (base.vitaminD||0) * multiplier
    };
    const entry = {
      id: `${item.id}-${Date.now()}`,
      fdcId: item.id,
      description: item.description,
      brand: item.brand,
      qty: qtyLocal, unit: unitLocal,
      nutrients: scaled
    };
    const dayLog = log[todayKey] ? [...log[todayKey]] : [];
    dayLog.push(entry);
    setLog({...log, [todayKey]: dayLog});
  };

  const removeItem = (id) => {
    const dayLog = (log[todayKey] || []).filter(it=>it.id!==id);
    setLog({...log, [todayKey]: dayLog});
  };

  // totals
  const totals = (log[todayKey] || []).reduce((acc,it)=>{
    return {
      calories: acc.calories + (it.nutrients.calories||0),
      protein: acc.protein + (it.nutrients.protein||0),
      carbs: acc.carbs + (it.nutrients.carbs||0),
      fat: acc.fat + (it.nutrients.fat||0),
      fiber: acc.fiber + (it.nutrients.fiber||0),
      sodium: acc.sodium + (it.nutrients.sodium||0),
      calcium: acc.calcium + (it.nutrients.calcium||0),
      iron: acc.iron + (it.nutrients.iron||0),
      potassium: acc.potassium + (it.nutrients.potassium||0),
      vitaminD: acc.vitaminD + (it.nutrients.vitaminD||0)
    };
  }, {calories:0,protein:0,carbs:0,fat:0,fiber:0,sodium:0,calcium:0,iron:0,potassium:0,vitaminD:0});

  // history (last 14 days)
  const history = [];
  for (let i=13;i>=0;i--) {
    const d = new Date();
    d.setDate(d.getDate()-i);
    const k = formatDateKey(d);
    const dayTotal = (log[k]||[]).reduce((s,it)=>s + (it.nutrients.calories||0),0);
    history.push({ date: k.slice(5), calories: Math.round(dayTotal) });
  }

  // Speech recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const parsed = parseVoiceItems(transcript);
      parsed.forEach(async p => {
        setQuery(p.name);
        await new Promise(r=>setTimeout(r, 400));
        const res = await fetch(`/api/search?q=${encodeURIComponent(p.name)}`);
        const data = await res.json();
        const top = (data.items || [])[0];
        if (top) {
          await addFoodFromSearch(top, p.qty, (p.unit || 'serving'));
        }
      });
    };
    recognition.onerror = (err) => { console.error('speech error', err); };
    recognition.onend = ()=> setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  // Editable goals handling
  const [editingGoals, setEditingGoals] = useState(false);
  const [editGoalsState, setEditGoalsState] = useState(goals || {});

  useEffect(() => {
    if (goals) setEditGoalsState(goals);
  }, [goals]);

  const onChangeGoal = (key, val) => {
    const parsed = Number(val);
    if (isNaN(parsed) || parsed < 0) return;
    setEditGoalsState(prev => ({ ...prev, [key]: parsed }));
  };

  const saveGoals = () => {
    setGoals(editGoalsState);
    setEditingGoals(false);
  };

  const resetGoals = () => {
    setEditGoalsState(goals);
    setEditingGoals(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4">
      <div className="max-w-xl mx-auto">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">QuickFood 🍌</h1>
          <p className="text-sm text-gray-600">Speak or type — log quickly.</p>
        </header>

        {!goals && <GoalWizard onSave={(g)=>setGoals(g)} />}

        {goals && (
          <section className="bg-white p-4 rounded-xl shadow mb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  Calories
                  {!editingGoals && (
                    <button onClick={() => setEditingGoals(true)} className="text-xs text-blue-600 underline">Edit goals</button>
                  )}
                </div>
                {!editingGoals && (
                  <div className="text-2xl font-bold">{Math.round(totals.calories)} / {goals.calories} kcal</div>
                )}
                {editingGoals && (
                  <input
                    type="number"
                    className="w-24 border p-1 rounded"
                    value={editGoalsState.calories}
                    onChange={(e) => onChangeGoal('calories', e.target.value)}
                  />
                )}
              </div>
              <div className="text-right text-sm text-gray-600 space-y-1">
                {['protein','carbs','fat','fiber','sodium'].map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="capitalize" style={{width: '60px'}}>{key}</span>
                    {!editingGoals && (
                      <span>{Math.round(totals[key])} / {goals[key]} {key === 'sodium' ? 'mg' : 'g'}</span>
                    )}
                    {editingGoals && (
                      <input
                        type="number"
                        className="w-20 border p-1 rounded"
                        value={editGoalsState[key]}
                        onChange={(e) => onChangeGoal(key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {['calories','protein','carbs','fat','fiber','sodium'].map(key => (
                <ProgressBar
                  key={key}
                  label={key === 'calories' ? 'Calories' : key.charAt(0).toUpperCase() + key.slice(1) + (key==='sodium' ? ' (mg)' : ' (g)')}
                  value={totals[key]}
                  target={editingGoals ? editGoalsState[key] : goals[key]}
                />
              ))}
            </div>

            {editingGoals && (
              <div className="flex gap-2 mt-4 justify-end">
                <button onClick={resetGoals} className="px-3 py-1 border rounded">Cancel</button>
                <button onClick={saveGoals} className="px-3 py-1 bg-emerald-500 text-white rounded">Save Goals</button>
              </div>
            )}
          </section>
        )}

        <section className="bg-white rounded-xl p-3 shadow mb-4">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods or tap mic"
              className="flex-1 p-3 rounded-xl border"
            />
            <button
              onClick={() => {
                if (listening) stopListening();
                else startListening();
              }}
              className="px-4 rounded-xl bg-rose-500 text-white"
              aria-label="Start voice input"
            >
              {listening ? 'Listening…' : '🎤'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <ul className="mt-2 max-h-48 overflow-auto">
              {searchResults.map((it) => (
                <li key={it.id} className="p-2 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{it.description}</div>
                    <div className="text-xs text-gray-500">{it.brand || it.dataType}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="w-20 p-1 border rounded"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="p-1 border rounded"
                    >
                      <option value="serving">serving</option>
                      <option value="g">g</option>
                    </select>
                    <button
                      onClick={() => addFoodFromSearch(it, qty, unit)}
                      className="px-3 py-1 bg-emerald-500 text-white rounded"
                    >
                      Add
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl p-3 shadow mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Today — {new Date().toLocaleDateString()}</h2>
            <div className="text-sm text-gray-500">
              Calories: <strong>{Math.round(totals.calories)}</strong>
            </div>
          </div>

          <div className="space-y-2">
            {(log[todayKey] || []).map((it) => (
              <div key={it.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{it.description}</div>
                  <div className="text-xs text-gray-500">
                    {it.qty} {it.unit}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{Math.round(it.nutrients.calories)} kcal</div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="text-xs text-red-500 mt-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(log[todayKey] || []).length === 0 && (
              <div className="text-sm text-gray-500">No items yet — add something!</div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl p-3 shadow mb-8">
          <h3 className="font-semibold mb-2">History (last 14 days)</h3>
          <HistoryChart data={history} />
        </section>

        <footer className="text-center text-xs text-gray-600">
          Data: USDA FoodData Central. Speech uses browser SpeechRecognition API.
        </footer>
      </div>
    </main>
  );
}
