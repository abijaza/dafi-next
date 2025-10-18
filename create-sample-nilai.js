async function createSampleNilai() {
  try {
    const response = await fetch('http://localhost:3000/api/nilai/sample', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Sample nilai response:', data)
  } catch (error) {
    console.error('Sample nilai error:', error)
  }
}

createSampleNilai()