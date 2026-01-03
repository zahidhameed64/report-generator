import { useState } from 'react'
import axios from 'axios'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, BarChart3, Sparkles, Download } from 'lucide-react'
import Visualizations from './Visualizations'
import ChatInterface from './ChatInterface'
import ReactMarkdown from 'react-markdown'

function App() {
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState('idle') // idle, uploading, analyzed, generating, done, error
    const [stats, setStats] = useState(null)
    const [plots, setPlots] = useState([])
    const [report, setReport] = useState("")
    const [reportType, setReportType] = useState("")
    const [instruction, setInstruction] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0])
            setErrorMsg("")
            setStatus('idle')
        }
    }

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading')
        setErrorMsg("")

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await axios.post('http://127.0.0.1:5000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            console.log("Upload response:", res.data)

            setStats(res.data.stats)
            setReportType(res.data.report_type)
            setPlots(res.data.plots)
            setStatus('analyzed')
        } catch (err) {
            console.error(err)
            const errMsg = err.response?.data?.error || "Upload failed"
            alert("Upload Error: " + errMsg)
            setErrorMsg(errMsg)
            setStatus('error')
        }
    }

    const handleGenerate = async () => {
        if (!stats) return;
        setStatus('generating')
        try {
            const res = await axios.post('http://127.0.0.1:5000/api/generate', {
                stats: stats,
                instruction: instruction
            })
            setReport(res.data.report)
            setStatus('done')
        } catch (err) {
            console.error("Generate Error:", err)
            const msg = err.response?.data?.error || "Generation failed"
            setErrorMsg(msg)
            alert("Error: " + msg)
            setStatus('error')
        }
    }

    // Native browser print for vector-quality PDF
    const handleDownloadPDF = () => {
        window.print();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-800 p-6 md:p-12 font-sans selection:bg-purple-200">
            <div className="max-w-5xl mx-auto space-y-10 animate-fade-in print:max-w-none print:p-0">

                {/* Header - Hidden when printing */}
                <header className="text-center space-y-4 print:hidden">
                    <div className="inline-flex items-center justify-center p-3 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm mb-4">
                        <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
                        <span className="text-sm font-semibold text-purple-700 tracking-wide uppercase">AI-Powered Analytics</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 tracking-tight pb-2">
                        DataNarrator
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Transform raw CSV data into compelling business narratives instantly using the power of Gemini AI.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:block">

                    {/* Left Column: Upload & Controls - Hidden when printing */}
                    <div className="lg:col-span-1 space-y-6 print:hidden">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 transition-all hover:shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-purple-600" />
                                Upload Data
                            </h3>

                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept=".csv, .xlsx, .xls, .json"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${file ? 'border-purple-400 bg-purple-50' : 'border-gray-300 group-hover:border-purple-400 group-hover:bg-gray-50'}`}>
                                    <div className={`p-4 rounded-full mb-3 ${file ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500'}`}>
                                        <FileText className="w-8 h-8 transition-transform group-hover:scale-110" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">{file ? file.name : "Click to browse"}</p>
                                    <p className="text-xs text-gray-400 mt-1">CSV, Excel, or JSON</p>
                                </div>
                            </div>

                            {file && status === 'idle' && (
                                <button
                                    onClick={handleUpload}
                                    className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-95 font-semibold flex items-center justify-center gap-2"
                                >
                                    Analyze Data
                                </button>
                            )}

                            {status === 'uploading' && (
                                <div className="mt-6 flex flex-col items-center justify-center text-purple-600 py-2">
                                    <Loader2 className="animate-spin w-8 h-8 mb-2" />
                                    <span className="text-sm font-medium">Crunching numbers...</span>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm animate-slide-up border border-red-100">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}
                        </div>

                        {/* Instructions Panel (appears after analysis) */}
                        {(status === 'analyzed' || status === 'generating' || status === 'done') && (
                            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/20 animate-slide-up">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Custom Instructions
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="E.g., Focus on the sales drop in Q3..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none text-sm"
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={status === 'generating'}
                                    className="mt-4 w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-xl hover:shadow-md hover:from-pink-600 hover:to-rose-600 transition-all active:scale-95 font-semibold flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'generating' ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Generate Report
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-2 space-y-6 print:w-full print:col-span-3">

                        {/* Empty State - Hidden when printing */}
                        {(status === 'idle' || status === 'uploading') && !stats && (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border-2 border-dashed border-white/50 text-gray-400 p-12 text-center print:hidden">
                                <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold mb-2">Ready to Visualize</h3>
                                <p className="max-w-xs">Upload your sales or performance data to get started with AI-driven insights.</p>
                            </div>
                        )}

                        {/* Stats Grid - Hidden when printing */}
                        {stats && (
                            <div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up print:hidden">
                                    <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rows</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.basic_info.rows}</p>
                                    </div>
                                    <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cols</p>
                                        <p className="text-2xl font-bold text-gray-800">{stats.basic_info.columns.length}</p>
                                    </div>
                                    <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Type</p>
                                            <p className="text-lg font-bold text-blue-900">{reportType}</p>
                                        </div>
                                        <CheckCircle className="w-6 h-6 text-blue-400" />
                                    </div>
                                </div>

                                {/* Visualizations are now embedded in the report */}
                            </div>
                        )}

                        {/* Report Card - Full width when printing */}
                        {(status === 'done' || status === 'generating') && (
                            <div id="report-content" className="bg-white p-8 rounded-3xl shadow-xl border border-purple-50 min-h-[500px] relative animate-fade-in group hover:shadow-2xl transition-all duration-500 print:shadow-none print:border-none print:p-0">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-t-3xl print:hidden"></div>
                                <div className="flex items-center justify-between mb-8 print:mb-4 print:hidden">
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 print:text-black">
                                        <FileText className="text-pink-500 print:text-black" />
                                        Report
                                    </h2>
                                    <div id="report-buttons" className="flex gap-2 print:hidden">
                                        {status === 'done' && (
                                            <button
                                                onClick={handleDownloadPDF}
                                                className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download PDF
                                            </button>
                                        )}
                                        {status === 'done' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center">Completed</span>}
                                    </div>
                                </div>

                                {status === 'generating' ? (
                                    <div className="space-y-4 animate-pulse print:hidden">
                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                        <div className="h-32 bg-gray-50 rounded-xl mt-6"></div>
                                    </div>
                                ) : (
                                    <div className="prose prose-purple prose-lg max-w-none text-gray-800 leading-relaxed bg-white p-4 rounded-xl print:text-black print:p-0 print:prose-p:text-black print:prose-headings:text-black print:prose-strong:text-black print:prose-li:text-black print:max-w-full">
                                        <ReactMarkdown
                                            components={{
                                                img: ({ node, ...props }) => (
                                                    <img {...props} className="w-full h-auto rounded-xl shadow-md my-4 border border-gray-100" />
                                                )
                                            }}
                                        >
                                            {(() => {
                                                if (!report || !plots) return report;
                                                let injectedReport = report;

                                                // 1. Inject Correlation Matrix (After Header 3)
                                                // Capture full line (.*) to avoid breaking headers like "## 3. Correlation & Logic"
                                                const corrPlot = plots.find(p => p.type === 'correlation');
                                                if (corrPlot) {
                                                    injectedReport = injectedReport.replace(
                                                        /(##\s*3\.\s*Correlation.*)/i,
                                                        `$1\n\n![Correlation Matrix](${corrPlot.url})\n\n`
                                                    );
                                                }

                                                // 2. Inject Distribution Plots (After Header 2 - Start of Deep Dive)
                                                const distPlots = plots.filter(p => p.type === 'distribution');
                                                if (distPlots.length > 0) {
                                                    const imgs = distPlots.map(p => `![${p.title}](${p.url})`).join('\n\n');
                                                    injectedReport = injectedReport.replace(
                                                        /(##\s*2\.\s*Deep Dive.*)/i,
                                                        `$1\n\n${imgs}\n\n`
                                                    );
                                                }

                                                // 3. Inject Category Plots (Before Header 3 - End of Deep Dive)
                                                // This places them at the bottom of the "Deep Dive" section, creating better flow
                                                const catPlots = plots.filter(p => p.type === 'category');
                                                if (catPlots.length > 0) {
                                                    const imgs = catPlots.map(p => `![${p.title}](${p.url})`).join('\n\n');
                                                    // Look for Header 3 again to insert *before* it
                                                    // If Header 3 is missing, fall back to appending to Header 2
                                                    if (injectedReport.match(/##\s*3\.\s*Correlation/i)) {
                                                        injectedReport = injectedReport.replace(
                                                            /(##\s*3\.\s*Correlation)/i,
                                                            `\n\n${imgs}\n\n$1`
                                                        );
                                                    } else {
                                                        // Fallback: append to Deep Dive header if Correlation is missing
                                                        injectedReport = injectedReport.replace(
                                                            /(##\s*2\.\s*Deep Dive.*)/i,
                                                            `$1\n\n${imgs}\n\n`
                                                        );
                                                    }
                                                }

                                                return injectedReport;
                                            })()}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chat Interface - Only show when we have stats/report */}
                        {status === 'done' && stats && (
                            <div className="print:hidden">
                                <ChatInterface stats={stats} />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
