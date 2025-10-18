import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion, type Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Types for our data
interface ChartDataItem {
  name: string;
  value: number;
  range?: string;
}

interface SummaryChartProps {
  data: {
    sources: ChartDataItem[];
    severities: ChartDataItem[];
  };
}

const SummaryChart: React.FC<SummaryChartProps> = ({ data }) => {
  // Color palettes
  const severityColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28'];
  const sourceColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 w-full"
    >
      {/* Sources Chart - Using Bar Chart for better comparison */}
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Log Sources</CardTitle>
            <CardDescription>Distribution across different log sources</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.sources} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} logs`, 'Count']}
                  labelFormatter={(label) => `Source: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Log Count"
                  radius={[4, 4, 0, 0]}
                >
                  {data.sources.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={sourceColors[index % sourceColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Severity Chart - Using Pie Chart with padding angle */}
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Severity Levels</CardTitle>
            <CardDescription>Distribution of log severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.severities}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {data.severities.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={severityColors[index % severityColors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, _, props) => [
                    `${value} logs`, 
                    props.payload.payload.name
                  ]}
                />
                <Legend 
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{
                    paddingLeft: '20px'
                  }}
                  formatter={(_, __, index) => (
                    <span className="text-sm">
                      {data.severities[index]?.name}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SummaryChart;