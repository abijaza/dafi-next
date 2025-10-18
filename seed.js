async function seedDatabase() {
  try {
    const response = await fetch('http://localhost:3000/api/seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    console.log('Seed response:', data)
  } catch (error) {
    console.error('Seed error:', error)
  }
}

seedDatabase()