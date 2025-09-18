"use client"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface OverviewProps {
    data: any[];
}

const Overview = ({data}: OverviewProps) => {
    return(
        <ResponsiveContainer width={"100%"} height={350}>
            <BarChart data={data}>
                <XAxis
                dataKey={"name"}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}/>
                <YAxis 
                tickFormatter={(v)=>`$${v}`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}/>

                {/* Use theme primary for bars */}
                <Bar dataKey={"total"} fill="hsl(var(--primary))" radius={[4,4,0,0]}/>
            </BarChart>
        </ResponsiveContainer>
    )
}

export default Overview;