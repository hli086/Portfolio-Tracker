import React, { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

const fetch = require('node-fetch')

/*
  React component that generates a graph of vistor data with a given encoded start date and enconded end date.
  parameters:
  encodedStartDate - Start date that is a string encoded with encodeURIComponent() so that endpoint may properly read the date.
  encodedEndDate - End date that is a string encoded with encodeURIComponent() so that endpoint may properly read the date.
*/
export const Pageloads = ({ encodedStartDate, encodedEndDate }) => {
  const [pageloads, setPageloads] = useState([])

  // Endpoint call to backend to get visitor data with given start date and end date
  useEffect(() => {
    async function fetchPageloads () {
      try {
        await fetch('/pageloads?start_date=' + encodedStartDate + '&end_date=' + encodedEndDate)
          .then(response => response.json())
          .then(data => {
            // fetch successful
            setPageloads(data)
          }, () => {
            // fetch failed; do nothing
          })
      } catch (e) {
        console.error(e)
      }
    }
    fetchPageloads()
  }, [encodedStartDate, encodedEndDate])

  // convert timestamps in JSON file into Date objects
  let timestamps = pageloads.map(d => new Date(d.timestamp))
  // sort timestamps by date in non-decreasing order
  timestamps = timestamps.sort((a, b) => a - b)
  // convert timestamps into local time format (mm/dd/yyyy) for the graph
  timestamps = timestamps.map(d => {
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
  })

  // count the number of occurences for each timestamp
  const occurrences = {}
  for (let i = 0; i < timestamps.length; i++) {
    occurrences[timestamps[i]] = (occurrences[timestamps[i]] || 0) + 1
  }

  // put ouccurences into data format
  const dates = Object.keys(occurrences)
  const visits = Object.values(occurrences)
  const data = []
  for (let i = 0; i < Object.keys(occurrences).length; i++) {
    const temp = {}
    temp.date = dates[i]
    temp.visits = visits[i]
    data.push(temp)
  }

  // only render the line chart if there are data
  if (Object.keys(data).length === 0) {
    return (
      <div className='pageloads'>No data available</div>
    )
  } else {
    return (
      <div className='pageloads'>
        <ResponsiveContainer width='100%' height={400}>
          <ComposedChart
            data={data}
            margin={{
              top: 25, right: 25, bottom: 25, left: 25
            }}
          >
            <CartesianGrid stroke='#f5f5f5' />
            <XAxis dataKey='date' allowDuplicatedCategory={false} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='visits' barSize={10} fill='#413ea0' />
            <Line type='monotone' dataKey='visits' stroke='#ff7300' legendType='none' />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }
}

export default Pageloads
