async function createSampleSantri() {
  try {
    const response = await fetch('http://localhost:3000/api/santri/sample', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Sample santri response:', data)
  } catch (error) {
    console.error('Sample santri error:', error)
  }
}

createSampleSantri()