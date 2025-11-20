import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS and logging middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://*.supabase.co'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}))

app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Authentication routes
app.post('/make-server-0167a82a/auth/signup', async (c) => {
  try {
    const { email, password, username } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log(`Signup error: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log(`Signup error: ${error}`)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// IoT Data Management Routes
app.post('/make-server-0167a82a/data/store', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const meterData = await c.req.json()
    const timestamp = new Date().toISOString()
    const dataKey = `meter_data_${user.id}_${timestamp}`
    
    await kv.set(dataKey, {
      userId: user.id,
      timestamp,
      voltage: meterData.voltage,
      current: meterData.current,
      power: meterData.power,
      energy: meterData.energy,
      powerFactor: meterData.powerFactor || 0.85,
      frequency: meterData.frequency || 50
    })
    
    return c.json({ success: true, key: dataKey })
  } catch (error) {
    console.log(`Data storage error: ${error}`)
    return c.json({ error: 'Failed to store data' }, 500)
  }
})

app.get('/make-server-0167a82a/data/retrieve', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const fromDate = c.req.query('from')
    const toDate = c.req.query('to')
    const limit = parseInt(c.req.query('limit') || '100')
    
    const prefix = `meter_data_${user.id}_`
    const allData = await kv.getByPrefix(prefix)
    
    // Filter by date range if provided
    let filteredData = allData
    if (fromDate || toDate) {
      filteredData = allData.filter(item => {
        const itemDate = new Date(item.value.timestamp)
        if (fromDate && itemDate < new Date(fromDate)) return false
        if (toDate && itemDate > new Date(toDate)) return false
        return true
      })
    }
    
    // Sort by timestamp and limit
    const sortedData = filteredData
      .sort((a, b) => new Date(b.value.timestamp).getTime() - new Date(a.value.timestamp).getTime())
      .slice(0, limit)
      .map(item => item.value)
    
    return c.json({ data: sortedData })
  } catch (error) {
    console.log(`Data retrieval error: ${error}`)
    return c.json({ error: 'Failed to retrieve data' }, 500)
  }
})

app.get('/make-server-0167a82a/analytics/summary', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const period = c.req.query('period') || 'week' // day, week, month, year
    const prefix = `meter_data_${user.id}_`
    const allData = await kv.getByPrefix(prefix)
    
    if (allData.length === 0) {
      return c.json({ 
        summary: {
          totalEnergy: 0,
          averagePower: 0,
          peakPower: 0,
          averageVoltage: 0,
          averageCurrent: 0,
          dataPoints: 0
        }
      })
    }
    
    // Filter data by period
    const now = new Date()
    const periodStart = new Date()
    
    switch (period) {
      case 'day':
        periodStart.setDate(now.getDate() - 1)
        break
      case 'week':
        periodStart.setDate(now.getDate() - 7)
        break
      case 'month':
        periodStart.setMonth(now.getMonth() - 1)
        break
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1)
        break
    }
    
    const periodData = allData
      .filter(item => new Date(item.value.timestamp) >= periodStart)
      .map(item => item.value)
    
    // Calculate summary statistics
    const totalEnergy = periodData.reduce((sum, item) => sum + (item.energy || 0), 0)
    const averagePower = periodData.reduce((sum, item) => sum + (item.power || 0), 0) / periodData.length
    const peakPower = Math.max(...periodData.map(item => item.power || 0))
    const averageVoltage = periodData.reduce((sum, item) => sum + (item.voltage || 0), 0) / periodData.length
    const averageCurrent = periodData.reduce((sum, item) => sum + (item.current || 0), 0) / periodData.length
    
    return c.json({
      summary: {
        totalEnergy: totalEnergy.toFixed(2),
        averagePower: averagePower.toFixed(2),
        peakPower: peakPower.toFixed(2),
        averageVoltage: averageVoltage.toFixed(2),
        averageCurrent: averageCurrent.toFixed(2),
        dataPoints: periodData.length,
        period
      }
    })
  } catch (error) {
    console.log(`Analytics summary error: ${error}`)
    return c.json({ error: 'Failed to generate analytics summary' }, 500)
  }
})

// Cost calculation route
app.post('/make-server-0167a82a/cost/calculate', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { voltage, current, hours, rate } = await c.req.json()
    
    const power = (voltage * current) / 1000 // kW
    const energy = power * hours // kWh
    const cost = energy * rate
    
    return c.json({
      calculation: {
        power: power.toFixed(3),
        energy: energy.toFixed(3),
        cost: cost.toFixed(4),
        inputs: { voltage, current, hours, rate }
      }
    })
  } catch (error) {
    console.log(`Cost calculation error: ${error}`)
    return c.json({ error: 'Failed to calculate cost' }, 500)
  }
})

// Settings management
app.post('/make-server-0167a82a/settings/update', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const settings = await c.req.json()
    const settingsKey = `user_settings_${user.id}`
    
    await kv.set(settingsKey, {
      userId: user.id,
      ...settings,
      updatedAt: new Date().toISOString()
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log(`Settings update error: ${error}`)
    return c.json({ error: 'Failed to update settings' }, 500)
  }
})

app.get('/make-server-0167a82a/settings/get', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const settingsKey = `user_settings_${user.id}`
    const settings = await kv.get(settingsKey)
    
    return c.json({ settings: settings || {} })
  } catch (error) {
    console.log(`Settings retrieval error: ${error}`)
    return c.json({ error: 'Failed to retrieve settings' }, 500)
  }
})

// Health check
app.get('/make-server-0167a82a/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Smart Meter Dashboard API'
  })
})

// Root route
app.get('/make-server-0167a82a/', (c) => {
  return c.json({ 
    message: 'Smart Meter Dashboard API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        signup: 'POST /auth/signup'
      },
      data: {
        store: 'POST /data/store',
        retrieve: 'GET /data/retrieve'
      },
      analytics: {
        summary: 'GET /analytics/summary'
      },
      cost: {
        calculate: 'POST /cost/calculate'
      },
      settings: {
        update: 'POST /settings/update',
        get: 'GET /settings/get'
      }
    }
  })
})

Deno.serve(app.fetch)