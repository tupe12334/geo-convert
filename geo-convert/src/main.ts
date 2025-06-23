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

function parseUTMInput(input: string): UTMCoordinate | null {
  // Expected format: "easting northing zone hemisphere" or "zone hemisphere easting northing"
  const parts = input.trim().split(/\s+/)
  
  if (parts.length !== 4) {
    return null
  }
  
  // Try format: easting northing zone hemisphere
  let easting = parseFloat(parts[0])
  let northing = parseFloat(parts[1])
  let zone = parseInt(parts[2])
  let hemisphere = parts[3].toUpperCase()
  
  // If first attempt fails, try format: zone hemisphere easting northing
  if (isNaN(easting) || isNaN(northing) || isNaN(zone)) {
    zone = parseInt(parts[0])
    hemisphere = parts[1].toUpperCase()
    easting = parseFloat(parts[2])
    northing = parseFloat(parts[3])
  }
  
  if (isNaN(easting) || isNaN(northing) || isNaN(zone) || 
      (hemisphere !== 'N' && hemisphere !== 'S') ||
      zone < 1 || zone > 60) {
    return null
  }
  
  return { easting, northing, zone, hemisphere: hemisphere as 'N' | 'S' }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>UTM to WGS84 Converter</h1>
    <div class="converter">
      <div class="input-section">
        <label for="utm-input">Enter UTM Coordinates:</label>
        <input 
          type="text" 
          id="utm-input" 
          placeholder="Example: 500000 4649776 33 N or 33 N 500000 4649776"
        />
        <p class="input-help">
          Format: Easting Northing Zone Hemisphere<br>
          Or: Zone Hemisphere Easting Northing<br>
          Example: 500000 4649776 33 N
        </p>
        <button id="convert-btn">Convert to WGS84</button>
      </div>
      <div class="output-section">
        <h3>WGS84 Result:</h3>
        <div id="result" class="result-display">
          Enter UTM coordinates above to see the conversion
        </div>
      </div>
    </div>
  </div>
`

// Set up event listeners
const input = document.querySelector<HTMLInputElement>('#utm-input')!
const convertBtn = document.querySelector<HTMLButtonElement>('#convert-btn')!
const result = document.querySelector<HTMLDivElement>('#result')!

function performConversion() {
  const inputValue = input.value.trim()
  
  if (!inputValue) {
    result.innerHTML = '<span class="error">Please enter UTM coordinates</span>'
    return
  }
  
  const utm = parseUTMInput(inputValue)
  
  if (!utm) {
    result.innerHTML = '<span class="error">Invalid format. Please use: Easting Northing Zone Hemisphere</span>'
    return
  }
  
  try {
    const wgs84 = convertUTMtoWGS84(utm)
    result.innerHTML = `
      <div class="success">
        <div class="coordinate-pair">
          <strong>Latitude:</strong> ${wgs84.latitude.toFixed(8)}°
        </div>
        <div class="coordinate-pair">
          <strong>Longitude:</strong> ${wgs84.longitude.toFixed(8)}°
        </div>
        <div class="decimal-degrees">
          <strong>Decimal Degrees:</strong> ${wgs84.latitude.toFixed(8)}, ${wgs84.longitude.toFixed(8)}
        </div>
      </div>
    `
  } catch (error) {
    result.innerHTML = '<span class="error">Error during conversion. Please check your input.</span>'
  }
}

convertBtn.addEventListener('click', performConversion)
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performConversion()
  }
})
