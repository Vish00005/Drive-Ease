import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const getFillColor = (name, index) => {
  const defaultColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#9ca3af'];
  const key = String(name || '').toLowerCase();
  const STATUS_COLORS = {
    pending: '#f59e0b',
    confirmed: '#06b6d4',
    active: '#6366f1',
    completed: '#10b981',
    rejected: '#ef4444',
    cancelled: '#9ca3af',
  };
  return STATUS_COLORS[key] || defaultColors[index % defaultColors.length];
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const fill = entry.payload.fill || getFillColor(entry.name, 0);
    return (
      <div className="glass rounded-xl p-3 shadow-xl border" style={{ borderColor: 'var(--surface-border)' }}>
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{entry.name}</p>
        <p className="text-xs font-bold" style={{ color: fill }}>{entry.value} booking{entry.value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export function BookingPieChart({ data }) {
  const formattedData = data.map((entry, index) => ({
    ...entry,
    fill: entry.fill || getFillColor(entry.name, index),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={formattedData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {formattedData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function UtilizationChart({ data }) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.name}>
          <div className="flex justify-between mb-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
            <span className="text-sm font-bold" style={{ color: item.fill || getFillColor(item.name, index) }}>{item.value}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${item.value}%`, background: item.fill || getFillColor(item.name, index) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
