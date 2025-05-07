// src/components/BarChart.jsx
import { ResponsiveBar } from '@nivo/bar'

export function BarChart({ data }) {
  return (
    <div style={{ height: 300 }}>
      <ResponsiveBar
        data={data}
        keys={['value']}
        indexBy="category"
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        padding={0.3}
        colors={{ scheme: 'nivo' }}
        axisBottom={{ tickRotation: -45 }}
      />
    </div>
  )
}
