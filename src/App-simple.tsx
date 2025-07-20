function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">Data Marketplace</h1>
      <p className="text-lg">App is working! 🎉</p>
      <div className="mt-8 p-4 border rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Debug Info:</h2>
        <p>React is rendering correctly</p>
        <p>Tailwind CSS is working</p>
        <p>Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

export default App