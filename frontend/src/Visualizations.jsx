import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

const Visualizations = ({ stats }) => {
    if (!stats) return null;

    // 1. Prepare Correlation Data
    const correlationData = stats.correlation
        ? Object.entries(stats.correlation).map(([key, value]) => ({
            name: key,
            value: value,
        }))
        : [];

    // 2. Prepare Numeric Summary (Top 5 cols by variance or just all?)
    // Let's take numeric stats and map them.
    // Normalizing is hard without context, so we might just show "Means" normalized or just raw.
    // A better chart might be "Min vs Average vs Max" for each column, but scales differ.
    // Let's do a chart per column if < 4, else pick top ones? 
    // Let's just do one combined chart for "Averages" but it might look weird if scales differ.
    // Alternative: "Data Health" - visualization of missing vs present? (Rows)

    // Let's stick to Correlation as it's the safest 'normalized' metric (-1 to 1).

    // Let's also try to show "Distribution" via a custom composed chart for the first 3 numeric metrics
    // showing min, mean, max.
    const numericKeys = Object.keys(stats.numeric_stats || {});
    const sampleNumericData = numericKeys.slice(0, 4).map(key => {
        const s = stats.numeric_stats[key];
        return {
            name: key,
            min: s.min,
            mean: s.mean,
            max: s.max
        };
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/60 mb-8">

            {/* Correlation Chart */}
            {correlationData.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Correlation Insights
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={correlationData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[-1, 1]} />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" name="Correlation Coefficient" radius={[0, 4, 4, 0]}>
                                    {
                                        correlationData.map((entry, index) => (
                                            <cell key={`cell-${index}`} fill={entry.value > 0 ? '#8b5cf6' : '#ef4444'} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-2">Stronger relationships shown in purple.</p>
                </div>
            )}

            {/* Numeric Highlights Chart (Min-Mean-Max) */}
            {sampleNumericData.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Key Numeric Ranges
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={sampleNumericData}>
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis dataKey="name" scale="band" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="mean" fill="#bfdbfe" stroke="#3b82f6" name="Average" />
                                <Bar dataKey="max" barSize={20} fill="#1e40af" name="Max Value" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="min" stroke="#ff7300" name="Min Value" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-2">Comparing Average vs Max vs Min for key columns.</p>
                </div>
            )}
        </div>
    );
};

export default Visualizations;
