import { useState } from 'react'
import axios from 'axios'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

function App() {
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState('idle') // idle, uploading, analyzed, generating, done, error
    const [stats, setStats] = useState(null)
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
            setStats(res.data.stats)
            setReportType(res.data.report_type)
            setStatus('analyzed')
        } catch (err) {
            console.error(err)
            setErrorMsg(err.response?.data?.error || "Upload failed")
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
            console.error(err)
            setErrorMsg(err.response?.data?.error || "Generation failed")
            setStatus('error')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-blue-600 flex items-center justify-center gap-3">
                        <FileText className="w-10 h-10" />
                        Data-to-Narrative
                    </h1>
                    <p className="text-gray-500">Automated Report Generator powered by Gemini</p>
                </header>

                {/* Upload Section */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 hover:bg-gray-50 transition">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="mt-2 text-xs text-gray-400">Supported format: CSV</p>
                    </div>

                    {file && status === 'idle' && (
                        <button
                            onClick={handleUpload}
                            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Analyze Data
                        </button>
                    )}

                    {status === 'uploading' && (
                        <div className="mt-6 flex justify-center text-blue-600"><Loader2 className="animate-spin" /></div>
                    )}

                    {errorMsg && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {errorMsg}
                        </div>
                    )}
                </div>

                {/* Stats & Generation Section */}
                {(status === 'analyzed' || status === 'generating' || status === 'done') && stats && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Analysis Results</h2>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {reportType}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Rows</p>
                                <p className="text-xl font-bold">{stats.basic_info.rows}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Columns</p>
                                <p className="text-xl font-bold">{stats.basic_info.columns.length}</p>
                            </div>
                            {/* Add more stats viewing logic here if needed */}
                        </div>

                        <div className="border-t pt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Instructions for AI (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Make it sound like a Wall Street Journal article..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                            />

                            <button
                                onClick={handleGenerate}
                                disabled={status === 'generating'}
                                className="mt-4 w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition font-medium flex justify-center items-center gap-2"
                            >
                                {status === 'generating' ? <Loader2 className="animate-spin" /> : "Generate Narrative Report"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Final Report Section */}
                {status === 'done' && report && (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-purple-100 ring-2 ring-purple-50">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <CheckCircle className="text-green-500" />
                            Generated Report
                        </h2>
                        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {report}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default App
