import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Editor from '@monaco-editor/react';
import { api } from '../../context/AuthContext';

const Ide = () => {
    const [language, setLanguage] = useState('javascript');
    const [theme, setTheme] = useState('vs-dark');
    const [code, setCode] = useState('// Write your code here...\nconsole.log("Hello World!");');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    // Initial codes template based on language
    const templates = {
        javascript: '// Write your JavaScript here...\nconsole.log("Hello World!");',
        python: '# Write your Python here...\nprint("Hello World!")',
        java: '// Write your Java here...\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
        cpp: '// Write your C++ here...\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello World!" << endl;\n    return 0;\n}',
        c: '// Write your C here...\n#include <stdio.h>\nint main() {\n    printf("Hello World!\\n");\n    return 0;\n}',
        sql: '-- Write your SQL queries here...\nSELECT * FROM students WHERE status = \'ACTIVE\';'
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(templates[lang] || '');
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Compiling and running code...');
        try {
            const res = await api.post('/api/students/run-code', { code, language });
            setOutput(res.data.output);
        } catch (error) {
            setOutput('Error running code: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <DashboardLayout title="Student Interactive IDE Console">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* IDE Configurations & Code Panel */}
                <div className="lg:col-span-3 space-y-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Language</label>
                                <select
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="c">C</option>
                                    <option value="sql">SQL</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1">Editor Theme</label>
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                                >
                                    <option value="vs-dark">VS Dark</option>
                                    <option value="light">Light</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isRunning ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                            ) : (
                                '▶ Run Code'
                            )}
                        </button>
                    </div>

                    {/* Monaco Editor Container */}
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                        <Editor
                            height="400px"
                            language={language}
                            theme={theme}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                wordWrap: 'on',
                                automaticLayout: true
                            }}
                        />
                    </div>
                </div>

                {/* Console Output Drawer */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col h-[500px]">
                    <div className="border-b border-slate-800 pb-4 mb-4 text-left">
                        <h3 className="font-bold text-white text-sm">Console Output</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Execution logs drawer</p>
                    </div>
                    <div className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-[11px] text-emerald-400 overflow-y-auto text-left whitespace-pre-wrap leading-relaxed select-all">
                        {output || 'No logs generated. Write and execute code to view output.'}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Ide;
