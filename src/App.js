import { useState } from 'react'
import { Mnemonic, HDNodeWallet, Wallet } from 'ethers'

export default function MnemonicGenerator() {
  const [mnemonic, setMnemonic] = useState("")
  const [numAccounts, setNumAccounts] = useState(10)
  const [showPrivateKeys, setShowPrivateKeys] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [error, setError] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const validateMnemonic = (phrase) => {
    try {
      return Mnemonic.isValidMnemonic(phrase.trim())
    } catch (e) {
      return false
    }
  }

  const createNewMnemonic = () => {
    try {
      const wallet = Wallet.createRandom()
      setMnemonic(wallet.mnemonic.phrase)
      setError("")
    } catch (e) {
      setError("Error generating new mnemonic: " + e.message)
    }
  }

  const generateAccounts = async () => {
    setError("")
    setAccounts([])
    
    const trimmedMnemonic = mnemonic.trim()
    if (!trimmedMnemonic) {
      setError("Please enter a mnemonic phrase")
      return
    }

    if (!validateMnemonic(trimmedMnemonic)) {
      setError("Invalid mnemonic phrase. Please check your words and try again. Each word should be from the BIP39 word list.")
      return
    }

    setIsGenerating(true)
    
    try {
      // Get the base wallet at m/44'/60'/0'/0
      const baseWallet = HDNodeWallet.fromPhrase(trimmedMnemonic, "", "m/44'/60'/0'/0")
      const newAccounts = []
      
      for (let i = 0; i < numAccounts; i++) {
        // Just derive the index since we're already at the base path
        const childWallet = baseWallet.deriveChild(i)
        newAccounts.push({
          address: childWallet.address,
          privateKey: childWallet.privateKey,
          path: `m/44'/60'/0'/0/${i}`
        })
      }
      
      setAccounts(newAccounts)
    } catch (e) {
      setError("Error generating accounts: " + e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    marginBottom: '20px',
    marginRight: '10px'
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <main>
        <h1>Mnemonic Account Generator</h1>
        <p>Generate Ethereum Addresses From Mnemonic (Secret Recovery Phrase)</p>
        
        <div style={{
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <h2 style={{ color: '#c62828', margin: '0 0 10px 0' }}>Security Warning</h2>
          <p>For greatest security, only use on a computer you fully trust.</p>
          <p>Ideally, use on a computer that is not connected to the internet, and never will be.</p>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '4px',
            color: '#c62828'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={createNewMnemonic}
          style={{
            ...buttonStyle,
            backgroundColor: '#388e3c'
          }}
        >
          Create New Mnemonic
        </button>

        <div style={{ marginBottom: '20px' }}>
          <label>
            <div>Secret Recovery Phrase</div>
            <textarea
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your secret recovery phrase or click 'Create New Mnemonic' above..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                marginTop: '8px',
                fontFamily: 'monospace'
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>
            <div>Number of accounts to generate</div>
            <input
              type="number"
              min="1"
              value={numAccounts}
              onChange={(e) => setNumAccounts(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                padding: '8px',
                marginTop: '8px'
              }}
            />
            <span style={{ marginLeft: '10px', color: '#666' }}>(can be slow!)</span>
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>
            <input
              type="checkbox"
              checked={showPrivateKeys}
              onChange={(e) => setShowPrivateKeys(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span>Display private keys</span>
          </label>
          <div style={{ color: '#666', marginLeft: '24px' }}>
            (do not check with untrusted people viewing your screen)
          </div>
        </div>

        <button
          onClick={generateAccounts}
          disabled={isGenerating}
          style={{
            ...buttonStyle,
            opacity: isGenerating ? 0.7 : 1,
            cursor: isGenerating ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? "Generating..." : "Generate Accounts"}
        </button>

        {accounts.length > 0 && (
          <div>
            <h2>Generated Accounts</h2>
            {accounts.map((account) => (
              <div 
                key={account.address}
                style={{
                  border: '1px solid #ddd',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}
              >
                <div><strong>Path:</strong> {account.path}</div>
                <div><strong>Address:</strong> {account.address}</div>
                {showPrivateKeys && (
                  <div><strong>Private Key:</strong> {account.privateKey}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}