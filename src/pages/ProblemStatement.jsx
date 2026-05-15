import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react'; // Éditeur de code type VSCode

const ProblemStatement = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(`// Écrivez votre algorithme ici
function processInput(data) {
  // Ex: Optimiser la répartition des ressources
  return data.reduce((a, b) => a + b, 0);
}`);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId: id, code })
    });
    const data = await res.json();
    setResult(data);
  };

  if (!problem) return <div>Chargement du défi...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Panneau Gauche : Énoncé */}
      <div className="w-1/2 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">{problem.title}</h1>
        <p className="mb-6 text-gray-300">{problem.description}</p>
        
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h3 className="font-bold">Exemple d'entrée (Fianarantsoa Traffic Data):</h3>
          <pre className="text-green-400">{JSON.stringify(problem.testCases.input, null, 2)}</pre>
        </div>
      </div>

      {/* Panneau Droit : Éditeur */}
      <div className="w-1/2 flex flex-col">
        <Editor
          height="60vh"
          defaultLanguage="javascript"
          value={code}
          onChange={(val) => setCode(val)}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 14 }}
        />
        <button 
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 m-4 rounded transition"
        >
          Soumettre la solution
        </button>
        
        {result && (
          <div className={`p-4 m-4 rounded ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
            <h3 className="font-bold">{result.message}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemStatement;