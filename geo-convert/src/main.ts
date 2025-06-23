import './style.css'
import proj4 from 'proj4'

interface UTMCoordinate {
  easting: number
  northing: number
  zone: number
  hemisphere: 'N' | 'S'
}

interface WGS84Coordinate {
  latitude: number
  longitude: number
}

function convertUTMtoWGS84(utm: UTMCoordinate): WGS84Coordinate {
  // Define the UTM projection string
  const utmProjection = `+proj=utm +zone=${utm.zone} +${utm.hemisphere === 'S' ? 'south' : ''} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`
  
  // Define WGS84 projection
  const wgs84Projection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'
  
  // Convert UTM to WGS84
  const [longitude, latitude] = proj4(utmProjection, wgs84Projection, [utm.easting, utm.northing])
  
  return { latitude, longitude }
}

function convertWGS84toUTM(wgs84: WGS84Coordinate, targetZone?: number): UTMCoordinate {
  // Determine UTM zone if not provided
  const zone = targetZone || Math.floor((wgs84.longitude + 180) / 6) + 1
  
  // Determine hemisphere
  const hemisphere: 'N' | 'S' = wgs84.latitude >= 0 ? 'N' : 'S'
  
  // Define WGS84 projection
  const wgs84Projection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'
  
  // Define the UTM projection string
  const utmProjection = `+proj=utm +zone=${zone} +${hemisphere === 'S' ? 'south' : ''} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`
  
  // Convert WGS84 to UTM
  const [easting, northing] = proj4(wgs84Projection, utmProjection, [wgs84.longitude, wgs84.latitude])
  
  return { easting, northing, zone, hemisphere }
}

function parseUTMInputs(easting: string, northing: string, zone: string, hemisphere: string): UTMCoordinate | null {
  const eastingNum = parseFloat(easting.trim())
  const northingNum = parseFloat(northing.trim())
  const zoneNum = parseInt(zone.trim())
  const hemisphereStr = hemisphere.trim().toUpperCase()
  
  if (isNaN(eastingNum) || isNaN(northingNum) || isNaN(zoneNum) || 
      (hemisphereStr !== 'N' && hemisphereStr !== 'S') ||
      zoneNum < 1 || zoneNum > 60) {
    return null
  }
  
  return { 
    easting: eastingNum, 
    northing: northingNum, 
    zone: zoneNum, 
    hemisphere: hemisphereStr as 'N' | 'S' 
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>UTM ⇄ WGS84 Converter</h1>
    <div class="converter">
      <div class="coordinates-grid">
        <div class="utm-section">
          <h3>UTM Coordinates</h3>
          <div class="input-grid">
            <div class="input-group">
              <label for="easting-input">Easting (X):</label>
              <input 
                type="number" 
                id="easting-input" 
                placeholder="500000"
                step="0.01"
              />
            </div>
            <div class="input-group">
              <label for="northing-input">Northing (Y):</label>
              <input 
                type="number" 
                id="northing-input" 
                placeholder="4649776"
                step="0.01"
              />
            </div>
            <div class="input-group">
              <label for="zone-input">Zone:</label>
              <input 
                type="number" 
                id="zone-input" 
                placeholder="33"
                min="1"
                max="60"
              />
            </div>
            <div class="input-group">
              <label for="hemisphere-select">Hemisphere:</label>
              <select id="hemisphere-select">
                <option value="">Select</option>
                <option value="N">North (N)</option>
                <option value="S">South (S)</option>
              </select>
            </div>
          </div>
          <button id="convert-to-wgs84">Convert to WGS84 →</button>
        </div>
        
        <div class="wgs84-section">
          <h3>WGS84 Coordinates</h3>
          <div class="input-grid">
            <div class="input-group">
              <label for="latitude-input">Latitude:</label>
              <input 
                type="number" 
                id="latitude-input" 
                placeholder="41.123456"
                step="0.00000001"
              />
            </div>
            <div class="input-group">
              <label for="longitude-input">Longitude:</label>
              <input 
                type="number" 
                id="longitude-input" 
                placeholder="2.123456"
                step="0.00000001"
              />
            </div>
          </div>
          <button id="convert-to-utm">← Convert to UTM</button>
        </div>
      </div>
      
      <div class="status-section">
        <div id="status" class="status-display">
          Enter coordinates in either format to see the conversion
        </div>
      </div>
    </div>
  </div>
`

// Set up event listeners
const eastingInput = document.querySelector<HTMLInputElement>('#easting-input')!
const northingInput = document.querySelector<HTMLInputElement>('#northing-input')!
const zoneInput = document.querySelector<HTMLInputElement>('#zone-input')!
const hemisphereSelect = document.querySelector<HTMLSelectElement>('#hemisphere-select')!
const latitudeInput = document.querySelector<HTMLInputElement>('#latitude-input')!
const longitudeInput = document.querySelector<HTMLInputElement>('#longitude-input')!
const convertToWGS84Btn = document.querySelector<HTMLButtonElement>('#convert-to-wgs84')!
const convertToUTMBtn = document.querySelector<HTMLButtonElement>('#convert-to-utm')!
const status = document.querySelector<HTMLDivElement>('#status')!

function convertUTMToWGS84() {
  const eastingValue = eastingInput.value.trim()
  const northingValue = northingInput.value.trim()
  const zoneValue = zoneInput.value.trim()
  const hemisphereValue = hemisphereSelect.value
  
  if (!eastingValue || !northingValue || !zoneValue || !hemisphereValue) {
    status.innerHTML = '<span class="error">Please fill in all UTM fields</span>'
    return
  }
  
  const utm = parseUTMInputs(eastingValue, northingValue, zoneValue, hemisphereValue)
  
  if (!utm) {
    status.innerHTML = '<span class="error">Invalid UTM input values. Please check your coordinates.</span>'
    return
  }
  
  try {
    const wgs84 = convertUTMtoWGS84(utm)
    latitudeInput.value = wgs84.latitude.toFixed(8)
    longitudeInput.value = wgs84.longitude.toFixed(8)
    status.innerHTML = '<span class="success">✓ Converted UTM to WGS84</span>'
  } catch (error) {
    status.innerHTML = '<span class="error">Error during UTM to WGS84 conversion</span>'
  }
}

function convertWGS84ToUTM() {
  const latitudeValue = latitudeInput.value.trim()
  const longitudeValue = longitudeInput.value.trim()
  
  if (!latitudeValue || !longitudeValue) {
    status.innerHTML = '<span class="error">Please fill in both latitude and longitude fields</span>'
    return
  }
  
  const latitude = parseFloat(latitudeValue)
  const longitude = parseFloat(longitudeValue)
  
  if (isNaN(latitude) || isNaN(longitude) || 
      latitude < -90 || latitude > 90 || 
      longitude < -180 || longitude > 180) {
    status.innerHTML = '<span class="error">Invalid WGS84 coordinates. Latitude: -90 to 90, Longitude: -180 to 180</span>'
    return
  }
  
  try {
    const utm = convertWGS84toUTM({ latitude, longitude })
    eastingInput.value = utm.easting.toFixed(2)
    northingInput.value = utm.northing.toFixed(2)
    zoneInput.value = utm.zone.toString()
    hemisphereSelect.value = utm.hemisphere
    status.innerHTML = '<span class="success">✓ Converted WGS84 to UTM</span>'
  } catch (error) {
    status.innerHTML = '<span class="error">Error during WGS84 to UTM conversion</span>'
  }
}

convertToWGS84Btn.addEventListener('click', convertUTMToWGS84)
convertToUTMBtn.addEventListener('click', convertWGS84ToUTM)

// Add Enter key support for UTM inputs
const utmInputs = [eastingInput, northingInput, zoneInput]
utmInputs.forEach((input: HTMLInputElement) => {
  input.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      convertUTMToWGS84()
    }
  })
})

// Add Enter key support for WGS84 inputs
const wgs84Inputs = [latitudeInput, longitudeInput]
wgs84Inputs.forEach((input: HTMLInputElement) => {
  input.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      convertWGS84ToUTM()
    }
  })
})

hemisphereSelect.addEventListener('change', () => {
  // Auto-convert when hemisphere is selected if other UTM fields are filled
  if (eastingInput.value && northingInput.value && zoneInput.value && hemisphereSelect.value) {
    convertUTMToWGS84()
  }
})
